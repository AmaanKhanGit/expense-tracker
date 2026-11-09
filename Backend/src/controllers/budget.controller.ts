import { Request, Response, NextFunction } from "express";
import { BudgetQueryType, BudgetType } from "../types/budget.types";
import budgetModel from "../models/budget.model";
import AppError from "../error/AppError";
import categoryModel from "../models/category.model";
import { CategoryKinds, CategoryTypeEnum } from "../types/category.type";

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
