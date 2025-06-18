const mongoose = require('mongoose');
const User = require('../models/User');
const { MONGODB_URI } = require('../config');

async function updateAdminUserRoles() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      console.log('Admin user not found');
      process.exit(1);
    }
    if (!user.roles.includes('admin')) {
      user.roles.push('admin');
      await user.save();
      console.log('Admin role added to user "admin"');
    } else {
      console.log('User "admin" already has admin role');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin user roles:', error);
    process.exit(1);
  }
}

updateAdminUserRoles();
