import { Request, Response, NextFunction } from "express";
import { TransactionType } from "../types/transaction.type";
import AppError from "../error/AppError";
import transactionModel from "../models/transaction.model";
import { IUserDocument } from "../types/user.type";

// add transaction
export async function addTransaction(
  req: Request<{}, {}, TransactionType>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { amount, type, category, description } = req.body;

    if (!amount || !type || !category) {
      throw new AppError("all fields are required", 400);
    }

    const user: IUserDocument = req.user;

    const transaction = await transactionModel.create({
      userId: user._id,
      amount,
      type,
      category,
      description,
    });

    res.status(201).json({
      message: "transaction added successfulyy",
      transaction,
    });
  } catch (error) {
    next(error);
  }
}

// get transaction

export async function getTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const transactions = await transactionModel.find();

    res.status(200).json({
      message: "transaction fetched!",
      transactions,
    });
  } catch (error) {
    next(error);
  }
}
