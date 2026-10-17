import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import transactionRoutes from "./routes/transaction.route";

// create server instance
const app: Application = express();

// middleware to read body data
app.use(express.json());

// to read cookies
app.use(cookieParser());

// use routes
app.use("/api/auth", authRoutes);

// transaction routes
app.use("/api/transaction", transactionRoutes);

// error handler middleware
app.use(errorHandler);

export default app;
