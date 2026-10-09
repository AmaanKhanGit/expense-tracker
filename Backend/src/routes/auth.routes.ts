import { Router, Request, Response } from "express";
import * as authController from "../controllers/auth.controller";
import {
  loginUserValidator,
  registerUserValidator,
} from "../validator/user.validator";
import validate from "../middlewares/validate.middleware";
import { authUser } from "../middlewares/auth.middleware";

const router = Router();

// register user
router.post(
  "/register",
  registerUserValidator,
  validate,
  authController.registerUser,
);

// verify email
router.get("/verify-email/:token", authController.verifyEmail);

// login user
router.post("/login", loginUserValidator, validate, authController.login);

// logout user
router.post("/logout", authController.logout);

// refresh access token
router.post("/refresh", authController.refreshToken);

// test route
router.get("/test", authUser, (req: Request, res: Response) => {
  res.status(200).json({
    message: "everything's okay",
    user: req.user,
  });
});

export default router;
