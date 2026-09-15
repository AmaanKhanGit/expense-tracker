const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const AppError = require("../error/AppError");

async function authUser(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    const error = new AppError("Unauthorized access", 401);
    next(error);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      const error = new AppError("user not found", 404);
      next(error);
      return;
    }

    if (!user.isEmailVerified) {
      const error = new AppError("please verify email first", 401);
      next(error);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof AppError) {
      next(error);
    } else {
      const err = new AppError("Oops! something went wrong", 500);
      next(err);
    }
  }
}

module.exports = { authUser };
