import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.model";
import sendEmail from "../services/email.service";
import { AppError } from "../error/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service";

interface RefreshTokenPayload extends JwtPayload {
  id: string;
}

// register user
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const userAlreadyExists = await userModel.findOne({
      $or: [{ email }],
    });

    if (userAlreadyExists) {
      throw new AppError("user already exists", 400);
    }

    // hash password
    // create random salt
    const hashedPass = await bcrypt.hash(password, 10);

    // creating random bytes
    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // note: instead of bcrypt we'll use crypto cuz bcrypt generates random hash each time even if inputs are same

    // expiring date calc
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = await userModel.create({
      name,
      email,
      password: hashedPass,
      isEmailVerified: false,
      emailVerificationTokenHash: hashedToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    await sendEmail(email, "Email verification", token);

    res.status(201).json({
      message: "user created successfully",
      user: {
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
}

// verify email
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string") {
      throw new AppError("Invalid or missing verification token", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      emailVerificationTokenHash: hashedToken,
      emailVerificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    // change the verification status
    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpiresAt = null;

    // save the status
    await user.save();

    res.status(200).json({
      message: "email verification successfully!",
    });
  } catch (error) {
    next(error);
  }
}

// login user
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      throw new AppError("invalid credentials", 400);
    }

    if (!user.isEmailVerified) {
      throw new AppError("please verify your email first", 400);
    }

    const isPassValid = await bcrypt.compare(password, user.password);

    if (!isPassValid) {
      throw new AppError("incorrect credentials", 400);
    }

    const accessToken = generateAccessToken(user.id);

    const refreshToken = generateRefreshToken(user.id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: true, only for production
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true, only for production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "user login successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

// logout user
export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({
    message: "logout successfull",
  });
}

// refresh access token
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken: token } = req.cookies || {};

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new AppError("REFRESH_TOKEN_SECRET is not configured", 500);
    }

    const decoded = jwt.verify(token, secret) as RefreshTokenPayload;

    const user = await userModel.findById(decoded.id);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    if (!user.isEmailVerified) {
      throw new AppError("please verify email first", 401);
    }

    const accessToken = generateAccessToken(user.id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: true, only for production
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "token generated successfully",
    });
  } catch (error) {
    next(error);
  }
}
