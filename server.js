require("dotenv").config();
const app = require("./app");
const colors = require("colors");

app.listen(3000, () => {
  console.log(
    colors.bgBlue.italic.bold("Server is running. Use our API on port: 3000")
  );
});