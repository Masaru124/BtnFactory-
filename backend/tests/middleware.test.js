const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should pass with valid token', () => {
      const user = { username: 'testuser', roles: ['user'] };
      const token = jwt.sign(user, JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(user);
    });

    it('should return 401 with no token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token format', () => {
      req.headers.authorization = 'InvalidToken';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 with invalid token', () => {
      req.headers.authorization = 'Bearer invalidtoken';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    beforeEach(() => {
      req.user = { username: 'testuser', roles: ['user'] };
    });

    it('should pass if user has required role', () => {
      const middleware = authorizeRoles(['user']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass if user has one of the required roles', () => {
      req.user.roles = ['user', 'staff'];
      const middleware = authorizeRoles(['admin', 'staff']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      const middleware = authorizeRoles(['admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user object is missing', () => {
      delete req.user;
      const middleware = authorizeRoles(['user']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: No user or roles found' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});