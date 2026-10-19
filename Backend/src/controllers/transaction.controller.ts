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

    await transactionModel.create({
      userId: user._id,
      amount,
      type,
      category,
      description,
    });

    res.status(201).json({
      message: "transaction added successfulyy",
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
    const userId = req.user._id;

    const transactions = await transactionModel
      .find({
        userId: userId,
      })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(10);

    res.status(200).json({
      message: "transaction fetched!",
      transactions,
    });
  } catch (error) {
    next(error);
  }
}

// delete transaction by id

export async function deleteById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;
    const userId = req.user._id;

    const transaction = await transactionModel.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!transaction) throw new AppError("no such a transaction", 404);

    res.status(200).json({
      message: "transaction deleted!",
    });
  } catch (error) {
    next(error);
  }
}
