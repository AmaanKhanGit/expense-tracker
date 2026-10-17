import mongoose, { Model, Schema } from "mongoose";
import { TransactionType, typeType } from "../types/transaction.type";

const transactionSchema = new Schema<TransactionType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
      type: Date,
      required: true,
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
