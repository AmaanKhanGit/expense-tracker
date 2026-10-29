import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller";
import { addCategoryValidator } from "../validator/category.validator";
import validate from "../middlewares/validate.middleware";

const router = Router();

// add category route
router.post("/", authUser, addCategoryValidator, validate, addCategory);

// get categories route
router.get("/", authUser, getCategories);

// delete category
router.delete("/:id", authUser, deleteCategory);

export default router;
