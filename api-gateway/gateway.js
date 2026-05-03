const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// ── Your 4 services with correct ports ───────────────────────
const SERVICES = {
  delivery: process.env.DELIVERY_SERVICE_URL || 'http://localhost:5005',
  grocery:  process.env.GROCERY_SERVICE_URL  || 'http://localhost:5000',
  order:    process.env.ORDER_SERVICE_URL     || 'http://localhost:5004',
  user:     process.env.USER_SERVICE_URL      || 'http://localhost:5003',
};

// ── Routes ────────────────────────────────────────────────────
app.use('/api/delivery', createProxyMiddleware({
  target: SERVICES.delivery,
  changeOrigin: true,
  pathRewrite: { '^/api/delivery': '' },
}));

app.use('/api/grocery', createProxyMiddleware({
  target: SERVICES.grocery,
  changeOrigin: true,
  pathRewrite: { '^/api/grocery': '' },
}));

app.use('/api/orders', createProxyMiddleware({
  target: SERVICES.order,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '' },
}));

app.use('/api/users', createProxyMiddleware({
  target: SERVICES.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
}));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    services: {
      delivery: { url: SERVICES.delivery, route: '/api/delivery' },
      grocery:  { url: SERVICES.grocery,  route: '/api/grocery'  },
      order:    { url: SERVICES.order,    route: '/api/orders'   },
      user:     { url: SERVICES.user,     route: '/api/users'    },
    }
  });
});

// ── 404 fallback ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found in gateway' });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nAPI Gateway running on http://localhost:${PORT}`);
  console.log('\nRoutes:');
  console.log('  /api/delivery  →  Delivery_Management              (port 5005)');
  console.log('  /api/grocery   →  Grocery_Store_Management         (port 5000)');
  console.log('  /api/orders    →  Order_and_Notification_Management (port 5004)');
  console.log('  /api/users     →  User_Management_and_Payment      (port 5003)');
});