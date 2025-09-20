require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createStaffUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if staff user already exists
    const existingStaff = await User.findOne({ username: 'staff' });
    if (existingStaff) {
      console.log('Staff user already exists');
      return;
    }
    
    // Create staff user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('staff123', salt);
    
    const staffUser = new User({
      username: 'staff',
      password: hashedPassword,
      roles: ['staff'],
      departments: ['Raw Material', 'Casting', 'Turning', 'Polish', 'Packing']
    });
    
    await staffUser.save();
    console.log('✅ Staff user created successfully');
  } catch (error) {
    console.error('Error creating staff user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createStaffUser();