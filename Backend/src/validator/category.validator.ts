import { body, ValidationChain } from "express-validator";

export const addCategoryValidator: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("can not add empty category")
    .toLowerCase(),
];
