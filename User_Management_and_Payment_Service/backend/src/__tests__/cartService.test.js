const cartService = require('../services/cartService');
const Cart = require('../models/CartModel');

jest.mock('../models/CartModel');

describe('Cart Service', () => {
  const userId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    test('should return existing cart', async () => {
      const mockCart = { _id: 'cart1', userId, items: [] };
      Cart.findOne.mockResolvedValue(mockCart);

      const result = await cartService.getCart(userId);

      expect(result).toBe(mockCart);
      expect(Cart.findOne).toHaveBeenCalledWith({ userId });
    });

    test('should create new cart if not exists', async () => {
      Cart.findOne.mockResolvedValueOnce(null);
      const mockCart = { _id: 'cart1', userId, items: [] };
      Cart.create.mockResolvedValue(mockCart);

      const result = await cartService.getCart(userId);

      expect(Cart.create).toHaveBeenCalledWith({ userId, items: [] });
      expect(result).toBe(mockCart);
    });
  });

  describe('addItem', () => {
    test('should add new item to cart', async () => {
      const mockCart = { _id: 'cart1', userId, items: [], save: jest.fn() };
      Cart.findOne.mockResolvedValue(mockCart);

      const productData = {
        productId: 'prod1',
        name: 'Apple',
        price: 100,
        image: 'apple.jpg',
        category: 'Fruits',
        unit: 'kg',
        qty: 2,
      };

      await cartService.addItem(userId, productData);

      expect(mockCart.items.length).toBe(1);
      expect(mockCart.items[0].productId).toBe('prod1');
      expect(mockCart.items[0].qty).toBe(2);
      expect(mockCart.save).toHaveBeenCalled();
    });

    test('should increment quantity if product exists', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [{ productId: 'prod1', name: 'Apple', qty: 2 }],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      const productData = { productId: 'prod1', name: 'Apple', price: 100, qty: 3 };

      await cartService.addItem(userId, productData);

      expect(mockCart.items[0].qty).toBe(5);
    });

    test('should throw error for invalid price', async () => {
      const productData = { productId: 'prod1', name: 'Apple', price: 'invalid' };

      await expect(cartService.addItem(userId, productData)).rejects.toThrow(
        'productId, name, and valid price are required'
      );
    });

    test('should throw error for invalid quantity', async () => {
      const productData = {
        productId: 'prod1',
        name: 'Apple',
        price: 100,
        qty: -1,
      };

      await expect(cartService.addItem(userId, productData)).rejects.toThrow(
        'Quantity must be a positive integer'
      );
    });

    test('should use default quantity of 1', async () => {
      const mockCart = { _id: 'cart1', userId, items: [], save: jest.fn() };
      Cart.findOne.mockResolvedValue(mockCart);

      const productData = { productId: 'prod1', name: 'Apple', price: 100 };

      await cartService.addItem(userId, productData);

      expect(mockCart.items[0].qty).toBe(1);
    });
  });

  describe('updateItemQty', () => {
    test('should update item quantity', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [{ productId: 'prod1', qty: 2 }],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await cartService.updateItemQty(userId, 'prod1', 5);

      expect(mockCart.items[0].qty).toBe(5);
      expect(mockCart.save).toHaveBeenCalled();
    });

    test('should remove item if qty <= 0', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [{ productId: 'prod1', qty: 2 }],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await cartService.updateItemQty(userId, 'prod1', 0);

      expect(mockCart.items.length).toBe(0);
    });

    test('should throw error if item not found', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await expect(cartService.updateItemQty(userId, 'prod1', 5)).rejects.toThrow(
        'Item not found in cart'
      );
    });
  });

  describe('applyCoupon', () => {
    test('should apply valid coupon', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [{ productId: 'prod1', qty: 1 }],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await cartService.applyCoupon(userId, 'FRESH10');

      expect(mockCart.couponCode).toBe('FRESH10');
      expect(mockCart.discount).toBe(10);
      expect(mockCart.save).toHaveBeenCalled();
    });

    test('should throw error for invalid coupon', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [{ productId: 'prod1', qty: 1 }],
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await expect(cartService.applyCoupon(userId, 'INVALID')).rejects.toThrow(
        'Invalid or expired coupon code'
      );
    });

    test('should throw error for empty cart', async () => {
      const mockCart = { _id: 'cart1', userId, items: [] };
      Cart.findOne.mockResolvedValue(mockCart);

      await expect(cartService.applyCoupon(userId, 'FRESH10')).rejects.toThrow(
        'Cannot apply coupon to an empty cart'
      );
    });
  });

  describe('removeCoupon', () => {
    test('should remove coupon', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        couponCode: 'FRESH10',
        discount: 10,
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await cartService.removeCoupon(userId);

      expect(mockCart.couponCode).toBeNull();
      expect(mockCart.discount).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    test('should clear all items and coupon', async () => {
      const mockCart = {
        _id: 'cart1',
        userId,
        items: [{ productId: 'prod1', qty: 2 }],
        couponCode: 'FRESH10',
        discount: 10,
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(mockCart);

      await cartService.clearCart(userId);

      expect(mockCart.items).toEqual([]);
      expect(mockCart.couponCode).toBeNull();
      expect(mockCart.discount).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });

  describe('updateLocation', () => {
    test('should update location', async () => {
      const mockCart = { _id: 'cart1', userId, save: jest.fn() };
      Cart.findOne.mockResolvedValue(mockCart);

      await cartService.updateLocation(userId, true);

      expect(mockCart.isWithinColombo).toBe(true);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });
});