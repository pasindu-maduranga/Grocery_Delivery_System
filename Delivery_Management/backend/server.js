const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();

// Connect database
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const autoAssignmentRoutes = require('./src/routes/autoAssignmentRoutes');

// Mount routes
app.use('/api/delivery', deliveryRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/auto-assignment', autoAssignmentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Delivery Service Running');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Delivery Service running on port ${PORT}`);
});