import { Request, Response, NextFunction } from "express";
import { TransactionQuery, TransactionType } from "../types/transaction.type";
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
    const { amount, type, category, description, date } = req.body;

    const user: IUserDocument = req.user;

    await transactionModel.create({
      userId: user._id,
      amount,
      type,
      category,
      description,
      date,
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
  req: Request<{}, {}, {}, TransactionQuery>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { type, category, limit, page, startDate, endDate } = req.query;

    const userId = req.user._id;

    const filter: any = { userId };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const parsedPage = page ? parseInt(page as string, 10) : 0;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

    const transactions = await transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

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
