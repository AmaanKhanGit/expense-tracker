import { Types } from "mongoose";

export enum CategoryKinds {
  Default = "default",
  Custom = "custom",
}

export interface CategoryType {
  title: string;
  type: CategoryKinds;
  createdBy?: Types.ObjectId;
  deletedBy: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
