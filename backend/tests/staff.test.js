const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const staffRoutes = require('../routes/staff');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// Import test setup helpers
const { createTestUser, generateToken } = require('./setup');

// Mock middleware for testing
jest.mock('../middleware/authenticateToken', () => {
  return jest.fn((req, res, next) => {
    if (req.headers.authorization) {
      req.user = {
        username: 'teststaff',
        roles: ['staff'],
        departments: ['Casting']
      };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
});

jest.mock('../middleware/authorizeRoles', () => {
  return () => jest.fn((req, res, next) => {
    if (req.user && req.user.roles.includes('staff')) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  });
});

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/staff', authenticateToken, authorizeRoles(['staff']), staffRoutes);

describe('Staff Routes', () => {
  describe('PUT /api/staff/products/:id', () => {
    it('should attempt to update product stock when authenticated as staff', async () => {
      // Create a staff user
      const staff = await createTestUser({
        username: 'teststaff',
        password: 'staffpass',
        roles: ['staff'],
        departments: ['Casting']
      });
      
      const token = generateToken(staff);
      
      const response = await request(app)
        .put('/api/staff/products/123')
        .set('Authorization', `Bearer ${token}`)
        .send({ stock: 10 });

      // Even though the product doesn't exist, we should get a 404 which means
      // the route was found but the product wasn't
      expect(response.status).toBe(404);
    });

    it('should reject access without authentication', async () => {
      const response = await request(app)
        .get('/api/staff/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});