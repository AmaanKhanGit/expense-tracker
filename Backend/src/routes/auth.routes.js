const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  loginUserValidator,
  registerUserValidator,
} = require("../validator/user.validator");
const validate = require("../middlewares/validate.middleware");

const { authUser } = require("../middlewares/auth.middleware");

const router = express.Router();

//  register user
router.post(
  "/register",
  registerUserValidator,
  validate,
  authController.registerUser,
);

//  verify email
router.get("/verify-email/:token", authController.verifyEmail);

//  login user
router.post("/login", loginUserValidator, validate, authController.login);

//  logout user
router.get("/logout", authController.logout);

// test route

router.get("/test", authUser, (req, res) => {
  res.status(200).json({
    message: "everything's okay",
    user: req.user,
  });
});

// export router
module.exports = router;
