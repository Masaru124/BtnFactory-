const mongoose = require("mongoose");
const User = require("../models/User");
const { MONGODB_URI } = require("../config");

async function listAdminUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const users = await User.find({ username: "admin" });
    if (users.length === 0) {
      console.log('No users with username "admin" found.');
    } else {
      users.forEach((user) => {
        console.log(`User: ${user.username}, Roles: ${user.roles}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error("Error listing admin users:", error);
    process.exit(1);
  }
}

listAdminUsers();
