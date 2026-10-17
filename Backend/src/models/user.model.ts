import mongoose, { Model, Schema } from "mongoose";
import { IUserDocument } from "../types/user.type";

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationTokenHash: {
      type: String,
      default: null,
    },

    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const userModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "user",
  userSchema,
);

export default userModel;
