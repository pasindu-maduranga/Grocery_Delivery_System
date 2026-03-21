const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const orderRoutes =require("./src/routes/orderRoutes.js");
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware.js");
dotenv.config();

const app = express();

// CONNECT DATABASE
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// routes
app.use("/api/orders", orderRoutes);
// Test Route
app.get('/', (req, res) => {
  res.send('order Service Running');
});

// error handling — must be last
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`order Service running on port ${PORT}`);
});