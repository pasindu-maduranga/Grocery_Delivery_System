const orderController = require('../orderController');
const Order = require('../../models/Order');
const Driver = require('../../models/Driver');

jest.mock('../../models/Order');
jest.mock('../../models/Driver');

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: { id: 'u1', username: 'admin' }, headers: { authorization: 'Bearer token' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('receiveOrder', () => {
    it('should create or update an order and return 201', async () => {
      Order.findOneAndUpdate.mockResolvedValue({ orderId: 'o1' });
      req.body = { orderId: 'o1', customerId: 'u1' };
      await orderController.receiveOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { orderId: 'o1' } });
    });

    it('should handle duplicate order error', async () => {
      const err = new Error('Duplicate');
      err.code = 11000;
      Order.findOneAndUpdate.mockRejectedValue(err);
      await orderController.receiveOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order already exists' });
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      Order.countDocuments.mockResolvedValue(1);
      Order.find.mockReturnValue({ sort: () => ({ skip: () => ({ limit: () => [{ orderId: 'o1' }] }) }) });
      req.query = {};
      await orderController.getAllOrders(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }));
    });
  });

  describe('getMyOrders', () => {
    it('should return user orders', async () => {
      Order.find.mockReturnValue({ sort: () => [{ orderId: 'o1' }] });
      await orderController.getMyOrders(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ orderId: 'o1' }] });
    });
  });

  describe('getOrderById', () => {
    it('should return order if found', async () => {
      Order.findById.mockResolvedValue({ _id: 'o1' });
      req.params.id = 'o1';
      await orderController.getOrderById(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'o1' } });
    });
    it('should return 404 if not found', async () => {
      Order.findById.mockResolvedValue(null);
      req.params.id = 'o1';
      await orderController.getOrderById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status and return order', async () => {
      const save = jest.fn().mockResolvedValue(true);
      Order.findById.mockResolvedValue({ statusHistory: [], save });
      req.params.id = 'o1';
      req.body = { status: 'confirmed' };
      await orderController.updateOrderStatus(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Object) }));
    });

    it('should return 400 for invalid status', async () => {
      req.body = { status: 'invalid' };
      await orderController.updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 404 if order not found', async () => {
      Order.findById.mockResolvedValue(null);
      req.params.id = 'o1';
      req.body = { status: 'confirmed' };
      await orderController.updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
    });
  });

  describe('getOrderStats', () => {
    it('should return order stats', async () => {
      Order.countDocuments.mockResolvedValue(1);
      Order.aggregate.mockResolvedValue([{ total: 100 }]);
      await orderController.getOrderStats(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Object) }));
    });
  });

  describe('deleteOrder', () => {
    it('should delete order if found', async () => {
      Order.findByIdAndDelete.mockResolvedValue({ _id: 'o1' });
      req.params.id = 'o1';
      await orderController.deleteOrder(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order deleted' });
    });
    it('should return 404 if not found', async () => {
      Order.findByIdAndDelete.mockResolvedValue(null);
      req.params.id = 'o1';
      await orderController.deleteOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
    });
  });

  describe('getReadyOrders', () => {
    it('should return ready orders', async () => {
      Order.find.mockReturnValue({ sort: () => [{ orderId: 'o1' }] });
      await orderController.getReadyOrders(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ orderId: 'o1' }] });
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return available drivers', async () => {
      Driver.find.mockReturnValue({ select: () => [{ _id: 'd1' }] });
      await orderController.getAvailableDrivers(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ _id: 'd1' }] });
    });
  });
});