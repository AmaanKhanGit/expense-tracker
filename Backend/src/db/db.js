const mongoose = require("mongoose");

async function conncetDB() {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("connected to database!");
}

module.exports = conncetDB;
