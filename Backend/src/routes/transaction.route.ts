import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import {
  addTransaction,
  deleteById,
  getTransaction,
} from "../controllers/transaction.controller";
import { transactionValidator } from "../validator/transaction.validator";
import validate from "../middlewares/validate.middleware";

// creating router
const router = Router();

//  add transaction
router.post("/", authUser, transactionValidator, validate, addTransaction);

// get transactions
router.get("/", authUser, getTransaction);

// delete transaction by id
router.post("/:id", authUser, deleteById);

export default router;
