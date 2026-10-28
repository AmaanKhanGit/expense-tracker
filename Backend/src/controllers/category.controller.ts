import { Request, Response, NextFunction } from "express";
import { CategoryKinds, CategoryRequest } from "../types/category.type";
import { Types } from "mongoose";
import categoryModel from "../models/category.model";

export async function addCategory(
  req: Request<{}, {}, CategoryRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title } = req.body;

    const createdBy: Types.ObjectId = req.user._id;

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
