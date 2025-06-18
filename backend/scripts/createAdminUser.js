const mongoose = require('mongoose');
const User = require('../models/User');
const { MONGODB_URI } = require('../config');

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const existingAdmin = await User.findOne({ roles: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      process.exit(0);
    }
    const adminUser = new User({
      username: 'admin',
      password: 'admin123', // Plain text password, change as needed
      roles: ['admin'],
      departments: ['Production'],
    });
    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
