import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller";

const router = Router();

// add category route
router.post("/", authUser, addCategory);

// get categories route
router.get("/", authUser, getCategories);

// delete category
router.delete("/:id", authUser, deleteCategory);

export default router;
