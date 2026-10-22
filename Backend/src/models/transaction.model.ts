import mongoose, { Model, Schema, Types } from "mongoose";
import { TransactionType, typeType } from "../types/transaction.type";

const transactionSchema = new Schema<TransactionType>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(typeType), // validation for type
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      required: true,
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const transactionModel: Model<TransactionType> = mongoose.model(
  "transaction",
  transactionSchema,
);

export default transactionModel;
