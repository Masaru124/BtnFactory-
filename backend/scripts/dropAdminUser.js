const mongoose = require("mongoose");
const User = require("../models/User");
const { MONGODB_URI } = require("../config");

async function dropAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const result = await User.deleteOne({ username: "admin" });
    if (result.deletedCount === 1) {
      console.log('Admin user with username "admin" has been deleted.');
    } else {
      console.log('No admin user with username "admin" found.');
    }
    process.exit(0);
  } catch (error) {
    console.error("Error deleting admin user:", error);
    process.exit(1);
  }
}

dropAdminUser();
