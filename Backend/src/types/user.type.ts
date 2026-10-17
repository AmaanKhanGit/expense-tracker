import { Document } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationTokenHash?: string | null;
  emailVerificationTokenExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}
