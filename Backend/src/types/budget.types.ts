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

// 1. Define strict status types and the final return item shape
export type BudgetStatus =
  | "no_budget"
  | "over_budget"
  | "fully_used"
  | "under_budget";

export interface CategoryOverviewItem {
  category: string; // Use Types.ObjectId if category is a reference ID
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  status: BudgetStatus;
}

// 2. Define shapes for raw Mongoose aggregation results
export interface TransactionAggResult {
  _id: string;
  totalSpent: number;
}

export interface BudgetAggResult {
  _id: string;
  totalBudget: number;
}

// Helper type for the merged object inside reduce
export interface MergedCategory {
  _id: string;
  totalBudget?: number;
  totalSpent?: number;
}
