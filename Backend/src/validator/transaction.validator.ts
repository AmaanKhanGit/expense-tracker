import { body, ValidationChain } from "express-validator";

export const transactionValidator: ValidationChain[] = [
  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isFloat({ gt: 0 })
    .withMessage("amount can only contain positive values"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("type is required")
    .isIn(["income", "expense"])
    .withMessage("can only contain income or expense type"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("category is required")
    .isString()
    .withMessage("can only contain string values")
    .isLength({ max: 50 })
    .withMessage("must not above 50 characters"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("can only contain string values")
    .isLength({ max: 500 })
    .withMessage("must not above 500 characters"),

  body("date")
    .notEmpty()
    .withMessage("date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("date must be in YYYY-MM-DD format")
    .isISO8601({ strict: true })
    .withMessage("invalid date format"),
];
