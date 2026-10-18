import { Types } from "mongoose";

// validation for type
export enum typeType {
  Income = "income",
  Expense = "expense",
}

export interface TransactionType {
  userId: Types.ObjectId;
  amount: number;
  type: typeType; // validation for type
  category: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
