import { Request, Response, NextFunction } from "express";
import { CategoryKinds, CategoryRequest } from "../types/category.type";
import { Types } from "mongoose";
import categoryModel from "../models/category.model";
import AppError from "../error/AppError";

export async function addCategory(
  req: Request<{}, {}, CategoryRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title } = req.body;

    const createdBy: Types.ObjectId = req.user._id;

    const isExists = await categoryModel.find({ title, createdBy });

    if (isExists) throw new AppError("category already exists", 400);

    const category = await categoryModel.create({
      title,
      type: CategoryKinds.Custom,
      createdBy,
    });

    res.status(201).json({
      message: "category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
}
