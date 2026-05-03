const userService = require('../services/userService');
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');

jest.mock('../models/UserModel');
jest.mock('bcryptjs');

describe('User Service', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      _id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      phoneNo: '1234567890',
      address: 'Test Address',
      password: 'hashedPassword123',
      avatar: null,
      location: {},
      save: jest.fn().mockResolvedValue(true),
    };
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    test('should update allowed fields', async () => {
      const updates = { name: 'Jane Doe', email: 'jane@example.com' };
      const result = await userService.updateProfile(mockUser, updates);

      expect(mockUser.name).toBe('Jane Doe');
      expect(mockUser.email).toBe('jane@example.com');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    test('should handle phone alias', async () => {
      const updates = { phone: '9876543210' };
      await userService.updateProfile(mockUser, updates);

      expect(mockUser.phoneNo).toBe('9876543210');
    });

    test('should handle phoneNumber alias', async () => {
      const updates = { phoneNumber: '5551234567' };
      await userService.updateProfile(mockUser, updates);

      expect(mockUser.phoneNo).toBe('5551234567');
    });

    test('should throw error if no valid fields', async () => {
      const updates = { invalidField: 'value', role: 'admin' };
      await expect(userService.updateProfile(mockUser, updates)).rejects.toThrow(
        'No valid fields to update'
      );
    });

    test('should ignore unauthorized fields', async () => {
      const updates = { name: 'Jane', password: 'newPassword', role: 'admin' };
      await userService.updateProfile(mockUser, updates);

      expect(mockUser.name).toBe('Jane');
      expect(mockUser.password).toBe('hashedPassword123');
      expect(mockUser.role).toBeUndefined();
    });

    test('should update address', async () => {
      const updates = { address: 'New Address' };
      await userService.updateProfile(mockUser, updates);

      expect(mockUser.address).toBe('New Address');
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should handle empty body', async () => {
      await expect(userService.updateProfile(mockUser, {})).rejects.toThrow(
        'No valid fields to update'
      );
    });

    test('should handle null body', async () => {
      await expect(userService.updateProfile(mockUser, null)).rejects.toThrow(
        'No valid fields to update'
      );
    });
  });

  describe('updatePassword', () => {
    test('should update password if current password matches', async () => {
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      const result = await userService.updatePassword(mockUser, 'oldPassword', 'newPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashedPassword123');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUser.password).toBe('newHashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should throw error if current password is incorrect', async () => {
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        userService.updatePassword(mockUser, 'wrongPassword', 'newPassword')
      ).rejects.toThrow('Current password is incorrect');
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should hash new password with correct salt rounds', async () => {
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await userService.updatePassword(mockUser, 'oldPassword', 'newPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
  });

  describe('updateLocation', () => {
    test('should update location with all fields', async () => {
      const result = await userService.updateLocation(mockUser, 6.9147, 79.8612, 'Colombo');

      expect(mockUser.location.latitude).toBe(6.9147);
      expect(mockUser.location.longitude).toBe(79.8612);
      expect(mockUser.location.address).toBe('Colombo');
      expect(mockUser.location.lastUpdated).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser.location);
    });

    test('should use default address if not provided', async () => {
      const result = await userService.updateLocation(mockUser, 6.9147, 79.8612);

      expect(mockUser.location.address).toBe('Location updated');
      expect(mockUser.location.latitude).toBe(6.9147);
      expect(mockUser.location.longitude).toBe(79.8612);
    });

    test('should set lastUpdated timestamp', async () => {
      const beforeUpdate = new Date();
      await userService.updateLocation(mockUser, 6.9147, 79.8612, 'Colombo');
      const afterUpdate = new Date();

      expect(mockUser.location.lastUpdated).toBeDefined();
      expect(mockUser.location.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(mockUser.location.lastUpdated.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    test('should throw error if latitude missing', async () => {
      await expect(userService.updateLocation(mockUser, null, 79.8612)).rejects.toThrow(
        'Latitude and longitude are required'
      );
    });

    test('should throw error if longitude missing', async () => {
      await expect(userService.updateLocation(mockUser, 6.9147, null)).rejects.toThrow(
        'Latitude and longitude are required'
      );
    });

    test('should throw error if both latitude and longitude missing', async () => {
      await expect(userService.updateLocation(mockUser, null, null)).rejects.toThrow(
        'Latitude and longitude are required'
      );
    });

    test('should handle zero coordinates', async () => {
      await expect(userService.updateLocation(mockUser, 0, 0)).rejects.toThrow(
        'Latitude and longitude are required'
      );
    });

    test('should handle negative coordinates', async () => {
      const result = await userService.updateLocation(mockUser, -6.9147, -79.8612, 'Test');

      expect(mockUser.location.latitude).toBe(-6.9147);
      expect(mockUser.location.longitude).toBe(-79.8612);
    });
  });
});