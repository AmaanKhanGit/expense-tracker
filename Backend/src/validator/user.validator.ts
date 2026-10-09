import { body, ValidationChain } from "express-validator";

export const registerUserValidator: ValidationChain[] = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must contain 6 characters"),
];

export const loginUserValidator: ValidationChain[] = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("invalid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("password is required"),
];
