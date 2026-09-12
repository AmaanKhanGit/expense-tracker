const { body } = require("express-validator");

const registerUserValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be string"),
  body("email")
    .trim()
    .notEmpty()
    .isEmail("email is required")
    .withMessage("invalid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("password must contain 6 characters"),
];

const loginUserValidator = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail("email is required")
    .withMessage("invalid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("password is required"),
];

module.exports = { registerUserValidator, loginUserValidator };
