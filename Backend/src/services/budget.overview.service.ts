import { Types } from "mongoose";
import budgetModel from "../models/budget.model";
import transactionModel from "../models/transaction.model";
import {
  BudgetAggResult,
  BudgetStatus,
  CategoryOverviewItem,
  MergedCategory,
  TransactionAggResult,
} from "../types/budget.types";

export async function getOverviewService(
  userId: Types.ObjectId,
  month: number,
  year: number,
): Promise<{
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  status: String;
}> {
  // get total budget
  const budgetResult = await budgetModel.aggregate([
    { $match: { userId, month, year } },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: "$amount" },
      },
    },
  ]);

  // we have date object so we're doing range for month selection
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactionResult = await transactionModel.aggregate([
    {
      $match: {
        userId,
        type: "expense",
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$amount" },
      },
    },
  ]);

  // gets the first index's item
  const [{ totalBudget = 0 } = {}] = budgetResult;
  const [{ totalSpent = 0 } = {}] = transactionResult;

  // calculations
  const remainingBudget = totalBudget - totalSpent;

  const percentageUsed =
    totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(2)) : 0;

  const status =
    totalBudget === 0
      ? "no_budget"
      : totalSpent > totalBudget
        ? "over_budget"
        : totalSpent === totalBudget
          ? "fully_used"
          : "under_budget";

  return { totalBudget, totalSpent, remainingBudget, percentageUsed, status };
}

export async function getCategoryOverviewService(
  userId: Types.ObjectId,
  month: number,
  year: number,
): Promise<CategoryOverviewItem[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  // Pass generic types to .aggregate<T>() and run in parallel
  const [transactionCategoryResult, budgetCategoryResult] = await Promise.all([
    transactionModel.aggregate<TransactionAggResult>([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
        },
      },
    ]),
    budgetModel.aggregate<BudgetAggResult>([
      { $match: { userId, month, year } },
      {
        $group: {
          _id: "$category",
          totalBudget: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  // 4. Strongly type the reduce accumulator (no 'any' needed!)
  const categoryWiseOverview = [
    ...budgetCategoryResult,
    ...transactionCategoryResult,
  ].reduce<Record<string, MergedCategory>>((acc, obj) => {
    const key = String(obj._id); // Safely handles ObjectId or string keys
    acc[key] = {
      ...acc[key],
      ...obj,
    };
    return acc;
  }, {});

  // 5. 'item' is now automatically inferred as MergedCategory
  const normalized: CategoryOverviewItem[] = Object.values(
    categoryWiseOverview,
  ).map((item) => {
    const totalBudget = item.totalBudget ?? 0;
    const totalSpent = item.totalSpent ?? 0;

    const remainingBudget =
      totalBudget === 0 ? 0 : Number((totalBudget - totalSpent).toFixed(2));

    const percentageUsed =
      totalBudget > 0
        ? Number(((totalSpent / totalBudget) * 100).toFixed(2))
        : 0;

    let status: BudgetStatus = "under_budget";
    if (totalBudget === 0) {
      status = "no_budget";
    } else if (totalSpent > totalBudget) {
      status = "over_budget";
    } else if (totalSpent === totalBudget) {
      status = "fully_used";
    }

    return {
      category: item._id,
      totalBudget,
      totalSpent,
      remainingBudget,
      percentageUsed,
      status,
    };
  });

  return normalized;
}
