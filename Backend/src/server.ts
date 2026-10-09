import "dotenv/config";
import app from "./app";
import conncetDB from "./db/db";

const PORT = process.env.PORT || 3000;

// connect to database
conncetDB();

// run server || start server
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
