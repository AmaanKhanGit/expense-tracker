const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../services/email.service");

// register user
async function registerUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "all fields are mandetoary",
    });
  }

  const userAlreadyExists = await userModel.findOne({
    $or: [{ email }],
  });

  if (userAlreadyExists) {
    return res.status(400).json({
      message: "user already exists!",
    });
  }

  try {
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

    sendEmail(email, "Email verification", token);

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
    res.status(400).json({
      message: "something went wrong",
    });
  }
}

//verify email
async function verifyEmail(req, res) {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel.findOne({
    emailVerificationTokenHash: hashedToken,
    emailVerificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "invalid user!",
    });
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
}


async function login(req,res){
  
}

module.exports = { registerUser, verifyEmail ,login};
