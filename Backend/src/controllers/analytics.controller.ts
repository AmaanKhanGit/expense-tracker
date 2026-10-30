import { Request, Response, NextFunction } from "express";
import transactionModel from "../models/transaction.model";

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user._id;

    const result = await transactionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          netSavings: { $subtract: ["$totalIncome", "$totalExpense"] },
        },
      },

      {
        $project: {
          totalIncome: 1,
          totalExpense: 1,
          netSavings: 1,
          savingsRate: {
            $cond: [
              { $gt: ["$totalIncome", 0] },
              {
                $multiply: [{ $divide: ["$netSavings", "$totalIncome"] }, 100],
              },
              0,
            ],
          },
        },
      },
    ]);

    console.log(result);

    res.status(200).json({
      message: "analytics fetched",
      result,
    });
  } catch (error) {
    next(error);
  }
}
