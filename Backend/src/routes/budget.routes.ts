import { Router } from "express";
import {
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
import { idValidator } from "../validator/params.validator";

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
  idValidator,
  validate,
  updateBudget,
);

// delete budget route
router.delete("/:id", authUser, idValidator, validate, deleteBudget);

export default router;
