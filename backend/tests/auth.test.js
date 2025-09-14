const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('../models/User');
const authRoutes = require('../routes/auth');

// Import test setup helpers
const { createTestUser } = require('./setup');

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a test user
      await createTestUser({
        username: 'loginuser',
        password: 'password123'
      });

      // Attempt to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('roles');
      expect(response.body.roles).toContain('user');
    });

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid username or password');
    });

    it('should reject login with invalid password', async () => {
      // Create a test user
      await createTestUser({
        username: 'passworduser',
        password: 'correctpassword'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'passworduser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid username or password');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'newpassword'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User registered successfully');

      // Verify user was created in the database
      const user = await User.findOne({ username: 'newuser' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('newuser');
      // In a real app, we would check that the password is hashed
      // but for this test, we'll check that it matches what we sent
      expect(user.password).toBe('newpassword');
    });

    it('should reject registration with existing username', async () => {
      // Create a test user first
      await createTestUser({
        username: 'existinguser',
        password: 'password123'
      });

      // Try to register with the same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'newpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Username already exists');
    });
  });
});