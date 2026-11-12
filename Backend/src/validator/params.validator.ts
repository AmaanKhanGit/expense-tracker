import { param, ValidationChain } from "express-validator";

export const idValidator: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid budget ID"),
];
