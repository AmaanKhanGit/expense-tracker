require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth.routes");

// create server instance
const app = express();

// middleware to read body data
app.use(express.json());

// use routers

app.use("/api/auth", authRoutes);

module.exports = app;
