import { body, ValidationChain } from "express-validator";

export const budgetValidator: ValidationChain[] = [
  body("category")
    .trim()
    .notEmpty()
    .withMessage("can not be empty")
    .toLowerCase(),
  body("amount")
    .notEmpty()
    .withMessage("can not be empty")
    .isInt({ min: 1000 })
    .withMessage("Budget amount must be at least 1000."),
  body("month")
    .notEmpty()
    .withMessage("can not be empty")
    .isInt({ min: 1, max: 12 })
    .withMessage("invalid month"),
  body("year")
    .notEmpty()
    .withMessage("can not be empty")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("invalid year"),
];
