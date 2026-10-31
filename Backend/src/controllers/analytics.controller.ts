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

    res.status(200).json({
      message: "data fetched",
      analytics: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBreakdown(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user._id;

    const result = await transactionModel.aggregate([
      { $match: { userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          totalExpense: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          totalExpense: -1,
        },
      },
      {
        $project: { _id: 0, category: "$_id", totalExpense: 1 },
      },
    ]);

    res.status(200).json({
      message: "data fetched",
      result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyTrend(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user._id;

    const result = await transactionModel.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$date",
              timezone: "Asia/Kolkata",
            },
          },
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
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalIncome: 1,
          totalExpense: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "data fetched!",
      result,
    });
  } catch (error) {
    next(error);
  }
}

// MY APPROACH

// const result = await transactionModel.aggregate([
//   { $match: { userId } },
//   {
//     $group: {
//       _id: {
//         month: { $month: "$date" },
//         year: { $year: "$date" },
//       },
//       totalIncome: {
//         $sum: {
//           $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
//         },
//       },
//       totalExpense: {
//         $sum: {
//           $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
//         },
//       },
//     },
//   },
//   {
//     $sort: {
//         "_id.year": 1,
//         "_id.month": 1,

//     },
//   },

//   {
//     $project: {
//       _id: 0,
//       month: {
//         $concat: [
//           { $toString: "$_id.year" },
//           "-",
//           { $toString: "$_id.month" },
//         ],
//       },
//       totalExpense: 1,
//       totalIncome: 1,
//     },
//   },
// ]);
