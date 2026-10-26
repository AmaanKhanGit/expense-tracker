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
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionQuery {
  page?: string;
  limit?: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}
