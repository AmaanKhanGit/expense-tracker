import { Router } from "express";
import { budgetValidator } from "../validator/budget.validator";
import validate from "../middlewares/validate.middleware";
import { authUser } from "../middlewares/auth.middleware";
import { createBudget, getBudget } from "../controllers/budget.controller";

const router = Router();

// create budget route
router.post("/", authUser, budgetValidator, validate, createBudget);

// get budget route
router.get("/", authUser, getBudget);

export default router;
