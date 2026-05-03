const deliveryPartnerController = require('../deliveryPartnerController');
const DeliveryPartner = require('../../models/DeliveryPartner');
const Role = require('../../models/Role');
const nodemailer = require('nodemailer');

jest.mock('../../models/DeliveryPartner');
jest.mock('../../models/Role');
jest.mock('nodemailer');

process.env.JWT_SECRET = 'test_secret';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'password';

// Mock nodemailer transporter
const mockSendMail = jest.fn().mockResolvedValue(true);
nodemailer.createTransport.mockReturnValue({
  sendMail: mockSendMail
});

describe('Delivery Partner Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 'admin1', userId: 'admin1' },
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('registerPartner', () => {
    it('should register a new delivery partner', async () => {
      const newPartner = {
        _id: 'partner1',
        name: 'John Doe',
        email: 'john@example.com',
        accountStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryPartner.findOne = jest.fn().mockResolvedValue(null);
      DeliveryPartner.mockImplementation(() => newPartner);

      req.body = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phone: '1234567890',
        nic: 'NIC123',
        location: { lat: 6.9271, lng: 80.7789 },
        vehicle: { type: 'bike', licensePlate: 'ABC123' }
      };

      await deliveryPartnerController.registerPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 400 if email already exists', async () => {
      DeliveryPartner.findOne = jest.fn().mockResolvedValue({ email: 'john@example.com' });

      req.body = { email: 'john@example.com', username: 'johndoe' };
      await deliveryPartnerController.registerPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('already exists') }));
    });

    it('should handle server error gracefully', async () => {
      DeliveryPartner.findOne = jest.fn().mockRejectedValue(new Error('DB Error'));

      req.body = { email: 'test@example.com' };
      await deliveryPartnerController.registerPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('rejectPartner', () => {
    it('should reject a partner and send email', async () => {
      const partner = {
        _id: 'partner1',
        name: 'John Doe',
        email: 'john@example.com',
        accountStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryPartner.findById = jest.fn().mockResolvedValue(partner);

      req.params.id = 'partner1';
      req.body = { approvalNote: 'Does not meet criteria' };
      await deliveryPartnerController.rejectPartner(req, res);

      expect(partner.accountStatus).toBe('rejected');
      expect(partner.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if partner not found', async () => {
      DeliveryPartner.findById = jest.fn().mockResolvedValue(null);

      req.params.id = 'partner1';
      await deliveryPartnerController.rejectPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status', async () => {
      const partner = {
        _id: 'partner1',
        isActive: true,
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryPartner.findById = jest.fn().mockResolvedValue(partner);

      req.params.id = 'partner1';
      await deliveryPartnerController.toggleActive(req, res);

      expect(partner.isActive).toBe(false);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, isActive: false }));
    });

    it('should return 404 if partner not found', async () => {
      DeliveryPartner.findById = jest.fn().mockResolvedValue(null);

      req.params.id = 'partner1';
      await deliveryPartnerController.toggleActive(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('toggleLock', () => {
    it('should toggle lock status', async () => {
      const partner = {
        _id: 'partner1',
        isLocked: false,
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryPartner.findById = jest.fn().mockResolvedValue(partner);

      req.params.id = 'partner1';
      await deliveryPartnerController.toggleLock(req, res);

      expect(partner.isLocked).toBe(true);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, isLocked: true }));
    });
  });

  describe('loginPartner', () => {
    it('should login partner and return token', async () => {
      const partner = {
        _id: 'partner1',
        username: 'johndoe',
        password: 'hashedPassword',
        accountStatus: 'approved',
        isActive: true,
        isLocked: false,
        role: { name: 'Driver' },
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ username: 'johndoe', accountStatus: 'approved' })
      };
      DeliveryPartner.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(partner)
        })
      });

      req.body = { username: 'johndoe', password: 'password123' };
      await deliveryPartnerController.loginPartner(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: expect.any(String) }));
    });

    it('should return 404 if partner not found', async () => {
      DeliveryPartner.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      req.body = { username: 'johndoe', password: 'password123' };
      await deliveryPartnerController.loginPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if account not approved', async () => {
      const partner = {
        username: 'johndoe',
        accountStatus: 'pending'
      };
      DeliveryPartner.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(partner)
        })
      });

      req.body = { username: 'johndoe', password: 'password123' };
      await deliveryPartnerController.loginPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 403 if account is locked', async () => {
      const partner = {
        username: 'johndoe',
        accountStatus: 'approved',
        isActive: true,
        isLocked: true
      };
      DeliveryPartner.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(partner)
        })
      });

      req.body = { username: 'johndoe', password: 'password123' };
      await deliveryPartnerController.loginPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Account locked. Contact Admin.' }));
    });
  });

  describe('getAllPartners', () => {
    it('should return all partners', async () => {
      const partners = [
        { _id: 'partner1', name: 'John Doe', accountStatus: 'approved' },
        { _id: 'partner2', name: 'Jane Doe', accountStatus: 'pending' }
      ];

      DeliveryPartner.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(partners)
          })
        })
      });

      await deliveryPartnerController.getAllPartners(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 2 }));
    });

    it('should filter by status', async () => {
      const partners = [{ _id: 'partner1', accountStatus: 'approved' }];

      DeliveryPartner.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(partners)
          })
        })
      });

      req.query.status = 'approved';
      await deliveryPartnerController.getAllPartners(req, res);

      expect(DeliveryPartner.find).toHaveBeenCalledWith({ accountStatus: 'approved' });
    });
  });

  describe('getAllRoles', () => {
    it('should return all active roles', async () => {
      const roles = [
        { _id: 'role1', name: 'Driver', isActive: true },
        { _id: 'role2', name: 'Admin', isActive: true }
      ];
      Role.find = jest.fn().mockResolvedValue(roles);

      await deliveryPartnerController.getAllRoles(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: roles }));
    });
  });

  describe('updateLocationAndStatus', () => {
    it('should update partner location and status', async () => {
      const partner = {
        _id: 'partner1',
        status: { isOnline: true, currentLatitude: 6.9271, currentLongitude: 80.7789 }
      };

      DeliveryPartner.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(partner)
      });

      req.user = { id: 'partner1' };
      req.body = { isOnline: true, latitude: 6.9271, longitude: 80.7789 };
      await deliveryPartnerController.updateLocationAndStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(partner);
    });
  });

  describe('getNearbyOnlinePartners', () => {
    it('should return nearby online approved partners', async () => {
      const partners = [
        { _id: 'partner1', name: 'John Doe', 'status.isOnline': true }
      ];

      DeliveryPartner.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(partners)
      });

      await deliveryPartnerController.getNearbyOnlinePartners(req, res);

      expect(res.json).toHaveBeenCalledWith(partners);
      expect(DeliveryPartner.find).toHaveBeenCalledWith({
        'status.isOnline': true,
        accountStatus: 'approved',
        isActive: true
      });
    });
  });
});