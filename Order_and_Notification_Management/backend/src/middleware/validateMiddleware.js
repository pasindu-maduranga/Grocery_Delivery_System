const { ORDER_STATUS } = require('../constants/orderConstants');

// ── Validate create order request body
const validateCreateOrder = (req, res, next) => {
  const errors = [];
  const { items, address } = req.body

 
  if (!address)      errors.push('address is required');

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array');
  } else {
    items.forEach((item, i) => {
      if (!item.productId)                      errors.push(`items[${i}].productId is required`);
      if (!item.name)                           errors.push(`items[${i}].name is required`);
      if (item.price == null)                   errors.push(`items[${i}].price is required`);
      if (!item.quantity || item.quantity < 1)  errors.push(`items[${i}].quantity must be at least 1`);

      if (item.sides && Array.isArray(item.sides)) {
        item.sides.forEach((side, j) => {
          if (!side.name)             errors.push(`items[${i}].sides[${j}].name is required`);
          if (side.price === undefined) errors.push(`items[${i}].sides[${j}].price is required`);
        });
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// ── Validate status update request
const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'status is required' });
  }

  if (!Object.values(ORDER_STATUS).includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value',
      allowed: Object.values(ORDER_STATUS),
    });
  }

  next();
};

// ── Validate payment webhook payload
const validatePaymentWebhook = (req, res, next) => {
  const errors = [];
  const { orderId, paymentId, paymentStatus } = req.body;

  if (!orderId)       errors.push('orderId is required');
  if (!paymentId)     errors.push('paymentId is required');
  if (!paymentStatus) errors.push('paymentStatus is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// ── Validate delivery webhook payload
const validateDeliveryWebhook = (req, res, next) => {
  const errors = [];
  const { orderId, riderId, riderStatus } = req.body;

  if (!orderId)     errors.push('orderId is required');
  if (!riderId)     errors.push('riderId is required');
  if (!riderStatus) errors.push('riderStatus is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = {
  validateCreateOrder,
  validateStatusUpdate,
  validatePaymentWebhook,
  validateDeliveryWebhook,
};