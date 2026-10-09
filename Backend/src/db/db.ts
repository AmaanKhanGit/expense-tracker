import mongoose from "mongoose";

export async function conncetDB(): Promise<void> {
  const dbUri = process.env.DATABASE_URI;
  if (!dbUri) {
    throw new Error("DATABASE_URI environment variable is missing");
  }
  await mongoose.connect(dbUri);
  console.log("connected to database!");
}

export default conncetDB;
