const mongoose = require("mongoose");

async function conncetDB() {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("connceted to database!");
}

module.exports = conncetDB;
