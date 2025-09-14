const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/User');
const adminRoutes = require('../routes/admin');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// Import test setup helpers
const { createTestUser, generateToken } = require('./setup');

// Mock middleware for testing
jest.mock('../middleware/authenticateToken', () => {
  return jest.fn((req, res, next) => {
    if (req.headers.authorization) {
      req.user = {
        username: 'testadmin',
        roles: ['admin'],
        departments: ['Raw Material']
      };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
});

jest.mock('../middleware/authorizeRoles', () => {
  return () => jest.fn((req, res, next) => {
    if (req.user && req.user.roles.includes('admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  });
});

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/admin', authenticateToken, authorizeRoles(['admin']), adminRoutes);

describe('Admin Routes', () => {
  describe('POST /api/admin/users', () => {
    it('should create a new user when admin is authenticated', async () => {
      // Create admin user
      const admin = await createTestUser({
        username: 'testadmin',
        password: 'adminpass',
        roles: ['admin']
      });
      
      const token = generateToken(admin);
      
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newstaffuser',
          password: 'staffpass',
          roles: ['staff'],
          departments: ['Casting']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User created');

      // Verify user was created
      const user = await User.findOne({ username: 'newstaffuser' });
      expect(user).toBeTruthy();
      expect(user.roles).toContain('staff');
      expect(user.departments).toContain('Casting');
    });

    it('should reject user creation without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .send({
          username: 'unauthuser',
          password: 'password',
          roles: ['user'],
          departments: ['Polish']
        });

      expect(response.status).toBe(401);
    });

    it('should reject user creation with invalid roles', async () => {
      const admin = await createTestUser({
        username: 'testadmin2',
        password: 'adminpass',
        roles: ['admin']
      });
      
      const token = generateToken(admin);
      
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'invalidroleuser',
          password: 'password',
          roles: ['invalid'],
          departments: ['Polish']
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid roles');
    });
  });
});