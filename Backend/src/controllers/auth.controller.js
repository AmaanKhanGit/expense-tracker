const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../services/email.service");

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
    const token = crypto.randomBytes(32);

    const hashedToken = await bcrypt.hash(token.toString("hex"), 10);

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

    sendEmail(email, "Email verification", token.toString("hex"));

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

module.exports = { registerUser };
