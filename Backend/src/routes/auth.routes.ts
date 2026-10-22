import {
  loginUserValidator,
  registerUserValidator,
} from "../validator/user.validator";
import {
  login,
  logout,
  refreshToken,
  registerUser,
  verifyEmail,
} from "../controllers/auth.controller";
import validate from "../middlewares/validate.middleware";
import { Router, Request, Response } from "express";
import { authUser } from "../middlewares/auth.middleware";

// creating rourer
const router = Router();

// register user
router.post("/register", registerUserValidator, validate, registerUser);

// verify email
router.get("/verify-email/:token", verifyEmail);

// login user
router.post("/login", loginUserValidator, validate, login);

// logout user
router.post("/logout", logout);

// refresh access token
router.post("/refresh", refreshToken);

// test route
router.get("/test", authUser, (req: Request, res: Response) => {
  res.status(200).json({
    message: "everything's okay",
    user: req.user,
  });
});

export default router;
