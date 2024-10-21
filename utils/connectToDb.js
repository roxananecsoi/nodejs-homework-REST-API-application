const mongoose = require("mongoose");
const colors = require("colors");

async function connectToDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://raduroxana07:Lv5ehcv4u84hInlf@cluster0.j9vb4.mongodb.net/db-contacts/contacts"
    );
    console.log(colors.bgGreen.italic.bold("Database connection successful!"));
  } catch (error) {
    console.error(colors.bgRed.italic.bold(error));
    process.exit(1);
  }
}

module.exports = connectToDb;
