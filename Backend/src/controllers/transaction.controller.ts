import { Request, Response, NextFunction } from "express";
import {
  Identity,
  TransactionQuery,
  TransactionType,
  TransactionUpdateBody,
  UpdateData,
} from "../types/transaction.type";
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

    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

    const calculatedSkip = (parsedPage - 1) * parsedLimit;

    const transactions = await transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(calculatedSkip)
      .limit(parsedLimit);

    const totalTransactions = await transactionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / parsedLimit);

    res.status(200).json({
      message: "transaction fetched!",
      transactions,
      meta: {
        page: parsedPage,
        limit: parsedLimit,
        totalTransactions,
        totalPages,
      },
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

// update transaction by id and user id

export async function updateById(
  req: Request<{}, {}, TransactionUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { amount, category, date, description, type, id } = req.body;
    const userId = req.user;

    const identity: Partial<Identity> = {};
    const updateData: Partial<UpdateData> = {};

    if (!id) throw new AppError("no such a transaction", 404);

    if (userId && id) {
      identity.userId = userId._id;
      identity._id = id;
    }

    if (amount) updateData.amount = amount;

    if (category) updateData.category = category;

    if (date) updateData.date = date;

    if (description) updateData.description = description;

    if (type) updateData.type = type;

    if (Object.keys(updateData).length === 0)
      throw new AppError("send atleast one field to update", 400);

    const transaction = await transactionModel.findOneAndUpdate(
      identity,
      updateData,
    );

    if (!transaction) throw new AppError("no such a transaction", 404);

    res.status(200).json({
      message: "item updated successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
}
