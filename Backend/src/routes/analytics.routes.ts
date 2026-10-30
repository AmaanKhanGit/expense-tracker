import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware";
import { getAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.get("/", authUser, getAnalytics);

export default router;
