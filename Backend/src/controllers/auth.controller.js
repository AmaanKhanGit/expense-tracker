const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../services/email.service");
const jwt = require("jsonwebtoken");
const AppError = require("../error/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/token.service");

// register user
async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new AppError("all field are required", 400);
      next(error);
      return;
    }

    const userAlreadyExists = await userModel.findOne({
      $or: [{ email }],
    });

    if (userAlreadyExists) {
      const error = new AppError("user already exists", 400);
      next(error);
      return;
    }

    // hash password
    // create random salt

    const hashedPass = await bcrypt.hash(password, 10);

    // creating random bytes
    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // note: instead of crypto we'll use crypto cuz bcrypt generates random hash each time even if inputs are same

    //expiring date calc
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = await userModel.create({
      name,
      email,
      password: hashedPass,
      isEmailVerified: false,
      emailVerificationTokenHash: hashedToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    await sendEmail(email, "Email verification", token);

    res.status(201).json({
      message: "user created successfully",
      user: {
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      next(error);
    } else {
      const err = new AppError("internal server error", 500);
      next(err);
    }
  }
}

//verify email
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      emailVerificationTokenHash: hashedToken,
      emailVerificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      const error = new AppError("Invalid or expired verification token", 400);
      next(error);
      return;
    }

    //change the verification status
    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpiresAt = null;

    // save the status
    await user.save();

    res.status(200).json({
      message: "email verification successfully!",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      next(error);
    } else {
      const err = new AppError("internal server error", 500);
      next(err);
    }
  }
}

// login user
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      const error = new AppError("invalid credentials", 400);
      next(error);
      return;
    }

    if (!user.isEmailVerified) {
      const error = new AppError("please verify your email first", 400);
      next(error);
      return;
    }

    const isPassValid = await bcrypt.compare(password, user.password);

    if (!isPassValid) {
      const error = new AppError("incorrect credentials", 400);
      next(error);
      return;
    }

    const accessToken = generateAccessToken(user.id);

    const refreshToken = generateRefreshToken(user.id);

    // const token = jwt.sign(
    //   {
    //     id: user._id,
    //   },
    //   process.env.JWT_SECRET,
    // );

    // res.cookie("token", token);

    res.status(200).json({
      message: "user login successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      next(error);
    } else {
      const err = new AppError("internal server error", 500);
      next(err);
    }
  }
}

// logout user
async function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    message: "logout successfull",
  });
}

module.exports = { registerUser, verifyEmail, login, logout };
