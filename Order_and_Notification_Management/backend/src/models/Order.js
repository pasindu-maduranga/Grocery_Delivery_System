const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type:     String,
      required: [true, 'Product ID is required'],
    },
    productName: {
      type:     String,
      required: [true, 'Product name is required'],
      trim:     true,
    },
    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type:     Number,
      required: [true, 'Unit price is required'],
      min:      [0, 'Price cannot be negative'],
    },
    subtotal: {
      type: Number, // quantity × unitPrice — calculated in pre-save hook
    },
  },
  { _id: false }
);

const PricingSchema = new mongoose.Schema(
  {
    subtotal:    { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 5.99 },
    discount:    { type: Number, default: 0 },
    tax:         { type: Number, default: 0 },
    total:       { type: Number, default: 0 },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true },
    city:   { type: String, required: true, trim: true },
    state:  { type: String, required: true, trim: true },
    zip:    { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const TimelineEntrySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    note:      { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
//  ORDER STATUS CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_STATUS = {
  PENDING:          'PENDING',
  PAYMENT_PENDING:  'PAYMENT_PENDING',
  CONFIRMED:        'CONFIRMED',
  PREPARING:        'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED:        'DELIVERED',
  CANCELLED:        'CANCELLED',
};

const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PAYMENT_PENDING,
  ORDER_STATUS.CONFIRMED,
];

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN ORDER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type:    String,
      unique:  true,   // ← already creates an index automatically
      default: () => `ORD-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
    },

    userId: {
      type:     String,
      required: [true, 'User ID is required'],
      index:    true,  // ← single-field index defined inline
    },
    userEmail: {
      type:     String,
      required: [true, 'User email is required'],
    },

    userSnapshot: {
      name:  { type: String },
      email: { type: String },
      phone: { type: String },
    },

    restaurantId: { type: String },
    restaurantSnapshot: {
      name:          { type: String },
      logo:          { type: String },
      address:       { type: String },
      contactNumber: { type: String },
    },

    items:   { type: [OrderItemSchema], required: true },
    pricing: { type: PricingSchema,    default: () => ({}) },

    address:         { type: String },
    addressLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    phone:         { type: String },
    paymentMethod: { type: String, default: 'cod' },
    deliveryType:  { type: String, default: 'standard' },
    instructions:  { type: String, default: '' },
    shippingFee:   { type: Number, default: 0 },
    discount:      { type: Number, default: 0 },

    status: {
      type:    String,
      enum:    Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index:   true,   // ← single-field index defined inline
    },

    paymentId:     { type: String, default: null },
    paymentStatus: { type: String, default: null },
    deliveryId:    { type: String, default: null },

    riderId: { type: String, default: null },
    riderSnapshot: {
      name:  { type: String, default: null },
      phone: { type: String, default: null },
    },
    riderStatus: { type: String, default: null },

    deliveryAddress: { type: AddressSchema },

    timeline: {
      type:    [TimelineEntrySchema],
      default: [],
    },

    estimatedDelivery: { type: Date, default: null },
    notes:             { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  INDEXES
//  Only compound indexes go here — single-field indexes are defined inline above
// ─────────────────────────────────────────────────────────────────────────────

OrderSchema.index({ userId: 1, createdAt: -1 }); // user's order history sorted by date

// ─────────────────────────────────────────────────────────────────────────────
//  PRE-SAVE HOOK — auto-calculate all pricing
// ─────────────────────────────────────────────────────────────────────────────

OrderSchema.pre('save', function (next) {
  // Step 1: each item's subtotal
  this.items.forEach((item) => {
    item.subtotal = parseFloat((item.quantity * item.unitPrice).toFixed(2));
  });

  // Step 2: sum item subtotals
  const itemsTotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.pricing.subtotal = parseFloat(itemsTotal.toFixed(2));

  // Step 3: tax (8%)
  const TAX_RATE = 0.08;
  this.pricing.tax = parseFloat((this.pricing.subtotal * TAX_RATE).toFixed(2));

  // Step 4: apply shippingFee + discount overrides
  if (this.shippingFee != null) this.pricing.deliveryFee = this.shippingFee;
  if (this.discount    != null) this.pricing.discount    = this.discount;

  // Step 5: grand total
  this.pricing.total = parseFloat((
    this.pricing.subtotal +
    this.pricing.deliveryFee +
    this.pricing.tax -
    this.pricing.discount
  ).toFixed(2));

  next();
});

// ─────────────────────────────────────────────────────────────────────────────
//  INSTANCE METHOD — append status change to timeline
// ─────────────────────────────────────────────────────────────────────────────

OrderSchema.methods.addTimeline = function (status, note = '') {
  this.timeline.push({ status, note, timestamp: new Date() });
  this.status = status;
};

// ─────────────────────────────────────────────────────────────────────────────
//  VIRTUAL — total item count (not stored in DB)
// ─────────────────────────────────────────────────────────────────────────────

OrderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = { Order, ORDER_STATUS, CANCELLABLE_STATUSES };