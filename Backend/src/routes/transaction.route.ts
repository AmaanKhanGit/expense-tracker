import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import { addTransaction } from "../controllers/transaction.controller";

const router = Router();

router.post("/", authUser, addTransaction);

export default router;
