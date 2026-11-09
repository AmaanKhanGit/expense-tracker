import { Types } from "mongoose";

export enum CategoryKinds {
  Default = "default",
  Custom = "custom",
}

export enum CategoryTypeEnum {
  Income = "income",
  Expense = "expense",
}

export interface CategoryType {
  title: string;
  type: CategoryKinds;
  categoryType: CategoryTypeEnum;
  createdBy?: Types.ObjectId;
  deletedBy: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryRequest {
  title: string;
  categoryType: CategoryTypeEnum;
}
