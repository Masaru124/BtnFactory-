const mongoose = require("mongoose");
const User = require("../models/User");
const { MONGODB_URI } = require("../config");

async function fixAdminUserRoles() {
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
    user.roles = ["admin"];
    await user.save();
    console.log('User "admin" roles forcibly set to ["admin"]');
    process.exit(0);
  } catch (error) {
    console.error("Error fixing admin user roles:", error);
    process.exit(1);
  }
}

fixAdminUserRoles();
