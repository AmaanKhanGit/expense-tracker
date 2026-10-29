import { Request, Response, NextFunction } from "express";
import { CategoryKinds, CategoryRequest } from "../types/category.type";
import { Types } from "mongoose";
import categoryModel from "../models/category.model";
import AppError from "../error/AppError";

// add categories
export async function addCategory(
  req: Request<{}, {}, CategoryRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title } = req.body;

    const createdBy: Types.ObjectId = req.user._id;

    const isExists = await categoryModel.findOne({ title, createdBy });

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

// get categories
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const createdBy = req.user._id;

    const categories = await categoryModel.find({
      $or: [{ type: CategoryKinds.Default }, { createdBy: createdBy }],
      $nor: [{ deletedBy: createdBy }],
    });

    res.status(200).json({
      message: "category fetched",
      categories,
    });
  } catch (error) {
    next(error);
  }
}

// delete catgory
export async function deleteCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;

    const createdBy: Types.ObjectId = req.user._id;

    const category = await categoryModel.findById(id);

    if (!category) throw new AppError("category not found", 404);

    if (category?.type === CategoryKinds.Custom) {
      const response = await categoryModel.findOneAndDelete({
        _id: id,
        createdBy,
      });

      if (!response) throw new AppError("category not found", 404);

      res.status(200).json({
        message: "deleted successfully",
        response,
      });
    } else if (
      category.type === CategoryKinds.Default &&
      !category.deletedBy.some((id) => id.toString() === createdBy.toString())
    ) {
      const response = await categoryModel.findByIdAndUpdate(id, {
        $push: { deletedBy: createdBy },
      });

      res.status(200).json({
        message: "deleted successfully",
        response,
      });
    } else {
      throw new AppError("bad request", 400);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}
