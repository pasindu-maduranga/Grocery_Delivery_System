require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/CartModel");
const Order = require("../models/OrderModel");
const axios = require("axios");
const User = require("../models/UserModel");

const GROCERY_SERVICE_URL = process.env.GROCERY_SERVICE_URL || process.env['grocery-service-url'] || 'https://grocery-backend.livelyforest-bef090db.eastus.azurecontainerapps.io/api';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || process.env['order-service-url'] || 'http://localhost:5004/api';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env['frontend-url'] || 'http://localhost:5174';

const paymentStripe = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ userId: req.user._id });
    if (!userCart || userCart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Your cart is empty" });
    }

    const currency = "lkr";

    // Build Stripe line_items from DB cart items
    const lineItems = userCart.items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          images:
            item.image && item.image.startsWith("http") ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // Add delivery fee if applicable
    if (userCart.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(userCart.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Create a pending order in DB first
    const itemsSubtotal = userCart.items.reduce(
      (sum, i) => sum + i.price * i.qty,
      0,
    );
    const orderData = {
      userId: req.user._id,
      items: userCart.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image,
        category: i.category,
        unit: i.unit,
      })),
      subtotal: itemsSubtotal,
      discount: userCart.discount,
      deliveryFee: userCart.deliveryFee,
      totalAmount: userCart.total,
      status: "placed", // or 'pending_payment'
      paymentStatus: "pending",
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: savedOrder._id.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment/cancel`,
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const verifyCheckout = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Session ID missing" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const { orderId, userId } = session.metadata;

      const order = await Order.findById(orderId);
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });

      // Only process if not already paid
      if (order.paymentStatus !== "paid") {
        // Step 1: Deduct stock in Grocery Service
        try {
          await axios.post(
            `${GROCERY_SERVICE_URL}/storefront/deduct`,
            {
              items: order.items.map((i) => ({ id: i.productId, qty: i.qty })),
            },
          );
          console.log("Stock deduction triggered for order:", orderId);
        } catch (err) {
          console.error("Inter-service stock deduction failed:", err.message);
        }

        // Step 2: Update Order Status
        order.paymentStatus = "paid";
        order.paymentId = session.id;
        await order.save();

        // Step 3: Clear User Cart
        await Cart.findOneAndUpdate(
          { userId: userId },
          { $set: { items: [], discount: 0, couponCode: null } },
        );

        // Step 4: Sync Order to Order & Notification Service
        try {
          const user = await User.findById(userId);

          await axios.post(
            `${ORDER_SERVICE_URL}/orders`,
            {
              orderId: order._id.toString(),
              customerId: userId,
              customerName: user ? user.name : "Unknown Customer",
              customerEmail: user ? user.email : "",
              customerPhone: user ? user.phoneNo : "",
              items: order.items.map((i) => ({
                productId: i.productId,
                name: i.name,
                qty: i.qty,
                price: i.price,
                image: i.image,
              })),
              totalAmount: order.totalAmount,
              shippingCost: order.deliveryFee || 0,
              paymentStatus: "paid",
              paymentMethod: "card",
              shippingAddress: { street: user?.address || "" },
            },
          );
          console.log(
            "Order synced to Order & Notification Service:",
            order._id,
          );
        } catch (err) {
          console.error("Inter-service order sync failed:", err.message);
        }
      }

      res.json({
        success: true,
        message: "Payment verified, order updated and cart cleared.",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment not completed." });
    }
  } catch (error) {
    console.error("Verify checkout error:", error);
    res
      .status(500)
      .json({ success: false, error: "Payment verification failed" });
  }
};

module.exports = { 
  paymentStripe, 
  verifyCheckout 
};
