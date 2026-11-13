import { body, param, query, ValidationChain } from "express-validator";

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

export const budgetUpdateValidator: ValidationChain[] = [
  body("category")
    .trim()
    .optional()
    .notEmpty()
    .withMessage("category can not be empty")
    .toLowerCase(),
  body("amount")
    .optional()
    .isInt({ min: 1000 })
    .withMessage("Budget amount must be at least 1000.")
    .toInt(),
  body("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("invalid month")
    .toInt(),
  body("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("invalid year")
    .toInt(),
];

export const budgetQueryValidator: ValidationChain[] = [
  query("month")
    .trim()
    .notEmpty()
    .withMessage("month is neccesary")
    .toInt()
    .isInt({ min: 1, max: 12 }),
  query("year")
    .trim()
    .notEmpty()
    .withMessage("month is neccesary")
    .toInt()
    .isInt({ min: 2000, max: 2100 }),
];
