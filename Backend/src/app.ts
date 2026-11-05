import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";
import analyticsRoutes from "./routes/analytics.routes";
import budgetRoutes from "./routes/budget.routes";

// create server instance
const app: Application = express();

// middleware to read body data
app.use(express.json());

// to read cookies
app.use(cookieParser());

// use routes
app.use("/api/auth", authRoutes);

// transaction routes
app.use("/api/transactions", transactionRoutes);

// category routes
app.use("/api/category", categoryRoutes);

// analytics routes
app.use("/api/analytics", analyticsRoutes);

// budget routes
app.use("/api/budget", budgetRoutes);

// error handler middleware
app.use(errorHandler);

export default app;
