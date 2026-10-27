import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../error/AppError";
import mongoose from "mongoose";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  let statusCode = 500;
  let message = "internal server error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "unauthorized";
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "invalid id format";
  } else {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
  });
}

export default errorHandler;
