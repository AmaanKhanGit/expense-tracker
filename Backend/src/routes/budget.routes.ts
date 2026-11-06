import { Router } from "express";
import { budgetValidator } from "../validator/budget.validator";
import validate from "../middlewares/validate.middleware";
import { authUser } from "../middlewares/auth.middleware";
import { createBudget } from "../controllers/budget.controller";

const router = Router();

// create budget route
router.post("/", authUser, budgetValidator, validate, createBudget);

export default router;
