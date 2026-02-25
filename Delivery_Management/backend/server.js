const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const deliveryRoutes = require('./src/routes/delivery.routes');
app.use('/api/delivery', deliveryRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Delivery Service Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Delivery Service running on port ${PORT}`);
});
