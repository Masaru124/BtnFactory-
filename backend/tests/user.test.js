const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../routes/user');
const authenticateToken = require('../middleware/authenticateToken');

// Import test setup helpers
const { createTestUser, generateToken } = require('./setup');

// Mock middleware for testing
jest.mock('../middleware/authenticateToken', () => {
  return jest.fn((req, res, next) => {
    if (req.headers.authorization) {
      req.user = {
        username: 'testuser',
        roles: ['user'],
        departments: ['pending']
      };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
});

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/user', authenticateToken, userRoutes);

describe('User Routes', () => {
  describe('GET /api/user/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Create a test user
      const user = await createTestUser();
      const token = generateToken(user);
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username');
      expect(response.body.username).toBe('testuser');
    });

    it('should reject access without authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});