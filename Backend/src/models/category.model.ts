import mongoose, { Model, Schema, Types } from "mongoose";
import { CategoryType, CategoryKinds } from "../types/category.type";

const categorySchema = new Schema<CategoryType>(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(CategoryKinds),
      default: CategoryKinds.Default,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    deletedBy: {
      type: [Schema.Types.ObjectId],
      ref: "user",
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const categoryModel: Model<CategoryType> = mongoose.model(
  "category",
  categorySchema,
);

export default categoryModel;
