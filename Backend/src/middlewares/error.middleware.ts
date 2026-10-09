import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../error/AppError";

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
  } else {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
  });
}

export default errorHandler;
