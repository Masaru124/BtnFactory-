const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;

// Connect to the in-memory database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and close the db connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Helper function to create a test user
async function createTestUser(userData = {}) {
  const defaultUser = {
    username: 'testuser',
    password: 'password123',
    roles: ['user'],
    departments: ['Raw Material']
  };
  
  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
}

// Helper function to generate a valid JWT token
function generateToken(user) {
  return jwt.sign(
    {
      username: user.username,
      roles: user.roles,
      departments: user.departments
    },
    JWT_SECRET
  );
}

module.exports = {
  createTestUser,
  generateToken
};