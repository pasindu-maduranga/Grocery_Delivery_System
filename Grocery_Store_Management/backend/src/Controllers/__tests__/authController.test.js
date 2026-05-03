const authController = require('../authController');
const SystemUser = require('../../Models/SystemUser');
jest.mock('../../Models/SystemUser');
process.env.JWT_SECRET = 'testsecret';

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  test('login returns token for valid user', async () => {
    SystemUser.findOne.mockReturnValue({ select: () => ({ populate: () => ({
      isActive: true, isLocked: false, comparePassword: jest.fn().mockResolvedValue(true), save: jest.fn(), isSuperAdmin: false, role: { permissions: [] }, _id: 'u1', username: 'user', firstName: 'A', lastName: 'B'
    }) }) });
    req.body = { username: 'user', password: 'pass' };
    await authController.login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});