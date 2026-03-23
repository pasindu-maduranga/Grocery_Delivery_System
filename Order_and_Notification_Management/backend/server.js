require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./src/config/db');

connectDB();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL || origin === process.env.CUSTOMER_FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

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
