const app = require("./src/app");

const conncetDB = require("./src/db/db");

//connect to database
conncetDB();

// run server || start server
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
