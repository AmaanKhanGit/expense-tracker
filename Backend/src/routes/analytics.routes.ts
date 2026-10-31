import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import {
  getAnalytics,
  getCategoryBreakdown,
  getMonthlyTrend,
} from "../controllers/analytics.controller";

const router = Router();

// get analytics
router.get("/", authUser, getAnalytics);

// get category breakdown
router.get("/category-breakdown", authUser, getCategoryBreakdown);

// get monthly trend
router.get("/monthly-trend", authUser, getMonthlyTrend);

export default router;
