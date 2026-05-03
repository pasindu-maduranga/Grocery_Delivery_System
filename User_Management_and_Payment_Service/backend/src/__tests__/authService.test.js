const authService = require('../services/authService');
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailUtils');
const generateAccessToken = require('../utils/generateToken');
const axios = require('axios');

jest.mock('../models/UserModel');
jest.mock('bcryptjs');
jest.mock('../utils/emailUtils');
jest.mock('../utils/generateToken');
jest.mock('axios');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phoneNo: '1234567890',
        address: 'Test Address',
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = { ...userData, _id: 'user1', isVerified: true };
      User.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(mockUser),
        ...mockUser,
      }));
      generateAccessToken.mockReturnValue('token123');

      const result = await authService.registerUser(userData);

      expect(result.user).toBeDefined();
      expect(result.token).toBe('token123');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    test('should throw error if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      User.findOne.mockResolvedValue({ email: 'john@example.com' });

      await expect(authService.registerUser(userData)).rejects.toThrow(
        'User already exists with the provided email address'
      );
    });
  });

  describe('loginUser', () => {
    test('should login user successfully', async () => {
      const credentials = { email: 'john@example.com', password: 'password123' };
      const mockUser = {
        _id: 'user1',
        email: 'john@example.com',
        password: 'hashedPassword',
        isActive: true,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateAccessToken.mockReturnValue('token123');

      const result = await authService.loginUser(credentials);

      expect(result.user).toBe(mockUser);
      expect(result.token).toBe('token123');
      expect(mockUser.lastLogin).toBeDefined();
    });

    test('should throw error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.loginUser({ email: 'john@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid user account'
      );
    });

    test('should throw error if user is inactive', async () => {
      const mockUser = { isActive: false };
      User.findOne.mockResolvedValue(mockUser);

      await expect(authService.loginUser({ email: 'john@example.com', password: 'password123' })).rejects.toThrow(
        'Invalid user account'
      );
    });
  });

  describe('forgotPassword', () => {
    test('should send password reset email', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'john@example.com',
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue(true);

      const result = await authService.forgotPassword('john@example.com');

      expect(sendEmail).toHaveBeenCalled();
      expect(mockUser.resetPasswordToken).toBeDefined();
      expect(mockUser.resetPasswordExpires).toBeDefined();
      expect(result.message).toBe('Email sent');
    });

    test('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.forgotPassword('nonexistent@example.com')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      const resetData = {
        email: 'john@example.com',
        token: 'resetToken123',
        newPassword: 'newPassword123',
      };

      const mockUser = {
        email: 'john@example.com',
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      const result = await authService.resetPassword(resetData);

      expect(mockUser.password).toBe('hashedNewPassword');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(result.message).toBe('Password updated');
    });

    test('should throw error for invalid token', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.resetPassword({
        email: 'john@example.com',
        token: 'invalidToken',
        newPassword: 'newPassword123',
      })).rejects.toThrow('Invalid or expired token');
    });
  });
});