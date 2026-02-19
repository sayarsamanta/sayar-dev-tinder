const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(
    "mongodb+srv://sayar_db_user:TYIJ2oVuMTPl9nNP@sayarnode.ruf7bk7.mongodb.net/sayarDevTinder"
  );
}

module.exports = main;
