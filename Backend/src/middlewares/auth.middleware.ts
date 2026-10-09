import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.model";
import { AppError } from "../error/AppError";

interface AuthTokenPayload extends JwtPayload {
  id: string;
}

export async function authUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { accessToken } = req.cookies || {};

    if (!accessToken) {
      throw new AppError("Unauthorized access", 401);
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new AppError("ACCESS_TOKEN_SECRET is not configured", 500);
    }

    const decoded = jwt.verify(accessToken, secret) as AuthTokenPayload;
    const user = await userModel.findById(decoded.id);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    if (!user.isEmailVerified) {
      throw new AppError("please verify email first", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
