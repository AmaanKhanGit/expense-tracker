import { Types } from "mongoose";

export interface BudgetType {
  userId: Types.ObjectId;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetQueryType {
  month?: number;
  year?: number;
  category?: string;
}

export interface BudgetUpdateType {
  category?: string;
  amount?: number;
  month?: number;
  year?: number;
}

export interface BudgetIdentity {
  userId: string;
  _id: string;
}
