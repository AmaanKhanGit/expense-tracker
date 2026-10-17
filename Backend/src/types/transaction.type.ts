import { Schema } from "mongoose";

// validation for type
export enum typeType {
  Income = "income",
  Expense = "expense",
}

export interface TransactionType {
  userId: Schema.Types.ObjectId;
  amount: number;
  type: typeType; // validation for type
  category: string;
  description?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
