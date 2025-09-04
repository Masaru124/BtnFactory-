const mongoose = require("mongoose");
const User = require("../models/User");
const { MONGODB_URI } = require("../config");

async function setAdminUserRole() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = await User.findOne({ username: "admin" });
    if (!user) {
      console.log("Admin user not found");
      process.exit(1);
    }
    if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
      console.log('User "admin" role updated to admin');
    } else {
      console.log('User "admin" already has admin role');
    }
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin user role:", error);
    process.exit(1);
  }
}

setAdminUserRole();
