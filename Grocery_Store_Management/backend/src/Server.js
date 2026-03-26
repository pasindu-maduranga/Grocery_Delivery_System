require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectCloudinary } = require('./Config/cloudinary');

const authRoutes = require('./Routes/auth');
const roleRoutes = require('./Routes/roles');
const { userRouter } = require('./Routes/systemUsers');
const moduleRoutes = require('./Routes/modules');
const supplierRoutes = require('./Routes/suppliers');
const groceryItemRoutes = require('./Routes/groceryItems');
const grocerySubmissionRoutes = require('./Routes/grocerySubmissions');
const inventoryRoutes = require('./Routes/inventory');
const notificationRoutes = require('./Routes/notifications');
const paymentRoutes = require('./Routes/payments');
const storefrontRoutes = require('./Routes/storefront');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL || origin === process.env.CUSTOMER_FRONTEND_URL || origin === process.env.customer-frontend-url || origin === process.env.frontend-url ) {
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

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/system-users', userRouter);
app.use('/api/modules', moduleRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/grocery-items', groceryItemRoutes);
app.use('/api/grocery-submissions', grocerySubmissionRoutes);
app.use('/api/inventory',inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/storefront', storefrontRoutes);

app.get('/', (req, res) => {
    res.send('Grocery Management Service is running');
});

app.get('/api/health', (req, res) => res.json({ status: 'oks' }));
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectCloudinary();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

module.exports = app;
