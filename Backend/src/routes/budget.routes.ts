import { Router } from "express";
import {
  budgetIdValidator,
  budgetUpdateValidator,
  budgetValidator,
} from "../validator/budget.validator";
import validate from "../middlewares/validate.middleware";
import { authUser } from "../middlewares/auth.middleware";
import {
  createBudget,
  deleteBudget,
  getBudget,
  updateBudget,
} from "../controllers/budget.controller";

const router = Router();

// create budget route
router.post("/", authUser, budgetValidator, validate, createBudget);

// get budget route
router.get("/", authUser, getBudget);

// update budget route
router.patch(
  "/:id",
  authUser,
  budgetUpdateValidator,
  budgetIdValidator,
  validate,
  updateBudget,
);

// delete budget route
router.delete("/:id", authUser, budgetIdValidator, validate, deleteBudget);

export default router;
