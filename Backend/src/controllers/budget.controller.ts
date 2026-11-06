import { Request, Response, NextFunction } from "express";
import { BudgetType } from "../types/budget.types";
import budgetModel from "../models/budget.model";
import AppError from "../error/AppError";
import categoryModel from "../models/category.model";
import { CategoryKinds } from "../types/category.type";

export async function createBudget(
  req: Request<{}, {}, BudgetType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { amount, category, month, year } = req.body;

    const userId = req.user._id;

    const isCategoryExists = await categoryModel.findOne({
      $or: [
        { title: category, type: CategoryKinds.Custom, createdBy: userId },
        { title: category, type: CategoryKinds.Default },
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
