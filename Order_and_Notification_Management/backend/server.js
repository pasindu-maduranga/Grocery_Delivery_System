require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./src/config/db');

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000', 'http://localhost:5003', process.env.FRONTEND_URL, process.env.CUSTOMER_FRONTEND_URL].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const orderRoutes = require('./src/routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Health check
app.get('/', (_req, res) => res.json({ service: 'Order & Notification Management', status: 'running' }));

const PORT = process.env.PORT || 5004;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT} : http://localhost:${PORT}`);
  });
}

module.exports = app;
