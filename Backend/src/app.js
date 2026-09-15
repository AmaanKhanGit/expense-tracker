require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middlewares/error.middleware");

// create server instance
const app = express();

// middleware to read body data
app.use(express.json());

// to read cookies
app.use(cookieParser());

// use routers

app.use("/api/auth", authRoutes);

// error handler middleware
app.use(errorHandler);

module.exports = app;
