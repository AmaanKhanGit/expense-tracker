import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import { addCategory } from "../controllers/category.controller";

const router = Router();

// add category route
router.post("/", authUser, addCategory);

export default router;
