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
