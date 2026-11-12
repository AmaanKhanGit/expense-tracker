import { Request, Response, NextFunction } from "express";
import {
  BudgetIdentity,
  BudgetQueryType,
  BudgetType,
  BudgetUpdateType,
} from "../types/budget.types";
import budgetModel from "../models/budget.model";
import AppError from "../error/AppError";
import categoryModel from "../models/category.model";
import { CategoryKinds, CategoryTypeEnum } from "../types/category.type";
import transactionModel from "../models/transaction.model";

export async function createBudget(
  req: Request<{}, {}, BudgetType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { amount, category, month, year } = req.body;

    const userId = req.user._id;

    const isCategoryExists = await categoryModel.findOne({
      title: category,
      categoryType: CategoryTypeEnum.Expense,
      $or: [
        {
          type: CategoryKinds.Custom,
          createdBy: userId,
        },
        {
          type: CategoryKinds.Default,
          deletedBy: { $ne: userId },
        },
      ],
    });
    if (!isCategoryExists) throw new AppError("category does not exists", 404);

    const budget = await budgetModel.create({
      amount,
      category,
      month,
      year,
      userId,
    });

    res.status(201).json({
      message: "budget created successfully",
      budget,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBudget(
  req: Request<{}, {}, {}, BudgetQueryType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user._id;

    const { category, month, year } = req.query;

    const filter: any = { userId };

    if (category) filter.category = category;
    if (month) filter.month = month;
    if (year) filter.year = year;

    const budget = await budgetModel
      .find(filter)
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      message: "bueget fetched",
      budget,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(
  req: Request<{ id: string }, {}, BudgetUpdateType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { category, amount, month, year } = req.body;

    const { id } = req.params;

    const userId = req.user._id;

    const filter: Partial<BudgetUpdateType> = {};

    const identity: Partial<BudgetIdentity> = {};

    if (userId && id) {
      identity.userId = userId;
      identity._id = id;
    }

    if (Object.keys(identity).length === 0)
      throw new AppError("Invalid budget identifier", 400);

    if (category) filter.category = category;
    if (amount) filter.amount = amount;
    if (year) filter.year = year;
    if (month) filter.month = month;

    // checking if filter is empty
    if (Object.keys(filter).length === 0)
      throw new AppError("send atleast one field to update", 400);

    const response = await budgetModel.findOneAndUpdate(identity, filter, {
      new: true,
      runValidators: true,
    });

    if (!response) throw new AppError("no such a budget", 404);

    res.status(200).json({
      message: "budget updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    const response = await budgetModel.findOneAndDelete({ userId, _id: id });

    console.log(response);

    if (!response) throw new AppError("no such a budget", 404);

    res.status(200).json({
      message: "budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function budgetOverview(
  req: Request<{}, {}, {}, BudgetQueryType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const userId = req.user._id;

    const filter: Partial<BudgetQueryType> = {};

    if (month) filter.month = month;
    if (year) filter.year = year;

    console.log(filter);

    const budgetResult = await budgetModel.aggregate([
      { $match: { userId, ...filter } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalBudget: 1,
        },
      },
    ]);

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
      {
        $project: {
          _id: 0,
          totalSpent: 1,
        },
      },
    ]);

    const [{ totalBudget = 0 } = {}] = budgetResult;
    const [{ totalSpent = 0 } = {}] = transactionResult;

    const remainingBudget = totalBudget - totalSpent;

    const percentageUsed =
      totalBudget > 0
        ? Number(((totalSpent / totalBudget) * 100).toFixed(2))
        : 0;

    const status =
      totalBudget === 0
        ? "no_budget"
        : totalSpent > totalBudget
          ? "over_budget"
          : totalSpent === totalBudget
            ? "fully_used"
            : "under_budget";

    console.log(
      totalBudget,
      totalSpent,
      remainingBudget,
      percentageUsed,
      status,
    );

    res.status(200).json({
      message: "data fetched!",
      data: {
        totalBudget,
        totalSpent,
        remainingBudget,
        percentageUsed,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
}
