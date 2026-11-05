import mongoose, { Model, Schema } from "mongoose";
import { BudgetType } from "../types/budget.types";

const budgetSchema = new Schema<BudgetType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  },
);

budgetSchema.index(
  {
    userId: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  },
);

const budgetModel: Model<BudgetType> = mongoose.model("budget", budgetSchema);

export default budgetModel;
