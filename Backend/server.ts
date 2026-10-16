import "dotenv/config";
import app from "./src/app.js";
import conncetDB from "./src/db/db.ts";

const PORT = process.env.PORT || 3000;

// connect to database
conncetDB();

// run server || start server
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
