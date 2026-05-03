const deliveryTripController = require('../deliveryTripController');
const DeliveryTrip = require('../../models/DeliveryTrip');
const DeliveryPartner = require('../../models/DeliveryPartner');

jest.mock('../../models/DeliveryTrip');
jest.mock('../../models/DeliveryPartner');

describe('Delivery Trip Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 'user1', userId: 'user1' },
      io: { emit: jest.fn() }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('assignTrip', () => {
    it('should create a new trip and emit socket event', async () => {
      const tripData = {
        orderId: 'order1',
        deliveryPartnerId: 'partner1',
        customerDetails: { name: 'John', address: '123 Main St' },
        financials: { totalCost: 500, riderEarning: 50 }
      };

      const savedTrip = { _id: 'trip1', ...tripData };
      const mockSave = jest.fn().mockResolvedValue(savedTrip);

      DeliveryTrip.mockImplementation(() => ({
        save: mockSave,
        ...tripData
      }));

      req.body = tripData;
      await deliveryTripController.assignTrip(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(req.io.emit).toHaveBeenCalledWith('new_order_partner1', expect.any(Object));
    });

    it('should return 500 on error', async () => {
      const error = new Error('DB Error');
      DeliveryTrip.mockImplementationOnce(() => {
        throw error;
      });

      req.body = { orderId: 'order1', deliveryPartnerId: 'partner1' };
      await deliveryTripController.assignTrip(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Server error' }));
    });
  });

  describe('updateTripStatus', () => {
    it('should update trip status to Accepted', async () => {
      const trip = { _id: 'trip1', status: 'pending', timestamps: {}, financials: {} };
      DeliveryTrip.findByIdAndUpdate = jest.fn().mockResolvedValue(trip);

      req.params.id = 'trip1';
      req.body = { status: 'Accepted' };
      await deliveryTripController.updateTripStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(trip);
    });

    it('should update trip status to PickedUp', async () => {
      const trip = { _id: 'trip1', status: 'Accepted', timestamps: {} };
      DeliveryTrip.findByIdAndUpdate = jest.fn().mockResolvedValue(trip);

      req.params.id = 'trip1';
      req.body = { status: 'PickedUp' };
      await deliveryTripController.updateTripStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(trip);
    });

    it('should update trip status to Delivered', async () => {
      const trip = {
        _id: 'trip1',
        status: 'PickedUp',
        deliveryPartnerId: 'partner1',
        financials: { riderEarning: 50 },
        timestamps: {}
      };
      DeliveryTrip.findByIdAndUpdate = jest.fn().mockResolvedValue(trip);
      DeliveryPartner.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'partner1' });

      req.params.id = 'trip1';
      req.body = { status: 'Delivered' };
      await deliveryTripController.updateTripStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(trip);
    });

    it('should return 500 on error', async () => {
      DeliveryTrip.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('DB Error'));

      req.params.id = 'trip1';
      req.body = { status: 'Accepted' };
      await deliveryTripController.updateTripStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllTrips', () => {
    it('should return all trips', async () => {
      const trips = [
        { _id: 'trip1', orderId: 'order1', status: 'Delivered' },
        { _id: 'trip2', orderId: 'order2', status: 'Accepted' }
      ];

      DeliveryTrip.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(trips)
      });

      await deliveryTripController.getAllTrips(req, res);

      expect(res.json).toHaveBeenCalledWith(trips);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('DB Error');
      DeliveryTrip.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(error)
      });

      await deliveryTripController.getAllTrips(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('payTripToPartner', () => {
    it('should process payment successfully', async () => {
      const trip = {
        _id: 'trip1',
        deliveryPartnerId: 'partner1',
        financials: { paymentStatus: 'Unpaid', riderEarning: 100 },
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTrip.findById = jest.fn().mockResolvedValue(trip);
      DeliveryPartner.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'partner1' });

      req.params.id = 'trip1';
      await deliveryTripController.payTripToPartner(req, res);

      expect(trip.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Payment successful via Stripe' }));
    });

    it('should return 404 if trip not found', async () => {
      DeliveryTrip.findById = jest.fn().mockResolvedValue(null);

      req.params.id = 'trip1';
      await deliveryTripController.payTripToPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if already paid', async () => {
      const trip = {
        _id: 'trip1',
        financials: { paymentStatus: 'Paid' }
      };
      DeliveryTrip.findById = jest.fn().mockResolvedValue(trip);

      req.params.id = 'trip1';
      await deliveryTripController.payTripToPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Already paid' });
    });

    it('should handle errors', async () => {
      DeliveryTrip.findById = jest.fn().mockRejectedValue(new Error('DB Error'));

      req.params.id = 'trip1';
      await deliveryTripController.payTripToPartner(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});