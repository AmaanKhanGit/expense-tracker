import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import {
  addTransaction,
  getTransaction,
} from "../controllers/transaction.controller";

const router = Router();

//  add transaction
router.post("/", authUser, addTransaction);

// get transactions
router.get("/", authUser, getTransaction);

export default router;
