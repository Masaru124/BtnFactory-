const mongoose = require('mongoose');
const User = require('../models/User');
const { MONGODB_URI } = require('../config');

async function migrateUserRoles() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find({});
    for (const user of users) {
      if (user.role && !user.roles) {
        user.roles = [user.role];
        user.role = undefined;
        await user.save();
        console.log(`Migrated user ${user.username} role to roles array.`);
      }
    }
    console.log('Migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateUserRoles();
