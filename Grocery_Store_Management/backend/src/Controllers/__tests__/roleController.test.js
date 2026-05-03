const roleController = require('../roleController');
const Role = require('../../Models/Role');
const Screen = require('../../Models/Screen');
const SystemUser = require('../../Models/SystemUser');

jest.mock('../../Models/Role');
jest.mock('../../Models/Screen');
jest.mock('../../Models/SystemUser');

describe('Role Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  test('getAllRoles returns roles', async () => {
    Role.find.mockReturnValue({ select: () => ({ populate: () => [{ name: 'Admin' }] }) });
    await roleController.getAllRoles(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('getRoleById returns role', async () => {
    Role.findById.mockReturnValue({ populate: () => ({ name: 'Admin' }) });
    req.params.id = 'role1';
    await roleController.getRoleById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('createRole creates a new role', async () => {
    Role.findOne.mockResolvedValue(null);
    Role.create.mockResolvedValue({ name: 'NewRole' });
    req.body = { name: 'NewRole', description: 'desc' };
    await roleController.createRole(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('updateRole updates a role', async () => {
    Role.findById.mockResolvedValue({ isSuperAdmin: false, save: jest.fn(), name: 'Role', description: 'desc' });
    req.params.id = 'role1';
    req.body = { name: 'Role', description: 'desc', isActive: true };
    await roleController.updateRole(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('deleteRole deactivates a role', async () => {
    const save = jest.fn();
    Role.findById.mockResolvedValue({ isSuperAdmin: false, _id: 'role1', save });
    SystemUser.countDocuments = jest.fn().mockResolvedValue(0);
    req.params.id = 'role1';
    await roleController.deleteRole(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});