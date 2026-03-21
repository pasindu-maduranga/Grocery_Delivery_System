const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db'); // ✅ ADD THIS

dotenv.config();

const app = express();

// ✅ CONNECT DATABASE
connectDB();

// Middleware
const cors = require('cors');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL || origin === process.env.CUSTOMER_FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const deliveryRoutes = require('./src/routes/deliveryRoutes');
app.use('/api/delivery', deliveryRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Delivery Service Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Delivery Service running on port ${PORT}`);
  });
}

module.exports = app;