import { body, ValidationChain } from "express-validator";
import { CategoryTypeEnum } from "../types/category.type";

export const addCategoryValidator: ValidationChain[] = [
  body("title").trim().notEmpty().withMessage("can not be empty").toLowerCase(),
  body("categoryType")
    .trim()
    .notEmpty()
    .withMessage("can not be empty")
    .toLowerCase()
    .isIn(Object.values(CategoryTypeEnum))
    .withMessage("can only contain income or expense in the type"),
];
