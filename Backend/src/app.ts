import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";

// create server instance
const app: Application = express();

// middleware to read body data
app.use(express.json());

// to read cookies
app.use(cookieParser());

// use routers
app.use("/api/auth", authRoutes);

// error handler middleware
app.use(errorHandler);

export default app;
