import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import {
  getAnalytics,
  getCategoryBreakdown,
} from "../controllers/analytics.controller";

const router = Router();

// get analytics
router.get("/", authUser, getAnalytics);

// get category breakdown
router.get("/category-breakdown", authUser, getCategoryBreakdown);

export default router;
