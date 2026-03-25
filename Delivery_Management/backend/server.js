const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();

// ✅ CONNECT DATABASE
connectDB();

// ✅ CORS — unified project-standard CORS options
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

// ✅ Routes
const deliveryRoutes        = require('./src/routes/deliveryRoutes');
const driverRoutes          = require('./src/routes/driverRoutes');
const assignmentRoutes      = require('./src/routes/assignmentRoutes');
const autoAssignmentRoutes  = require('./src/routes/autoAssignmentRoutes');

app.use('/api/deliveries',  deliveryRoutes);
app.use('/api/drivers',     driverRoutes);
app.use('/api/assignment',  assignmentRoutes);
app.use('/api',             autoAssignmentRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Delivery Service Running');
});

// ✅ Create HTTP server + Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }
});

// ✅ Make io accessible in controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Make io globally accessible for autoAssignmentService
global.io = io;

// ✅ Socket.io events — matches driverController.js
const driverService = require('./src/services/driverService');

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Driver joins their personal room
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined room: ${room}`);
  });

  // Driver goes online
  socket.on('driver_online', async ({ driverId, location }) => {
    try {
      await driverService.updateAvailability(driverId, true);
      await driverService.updateLocation(driverId, location.longitude, location.latitude);
      socket.join(`driver_${driverId}`);
      socket.emit('online_status', { status: 'online', driverId });
      console.log(`[Socket] Driver ${driverId} is now online`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to go online' });
    }
  });

  // Driver goes offline
  socket.on('driver_offline', async ({ driverId }) => {
    try {
      await driverService.updateAvailability(driverId, false);
      socket.leave(`driver_${driverId}`);
      socket.emit('online_status', { status: 'offline', driverId });
      console.log(`[Socket] Driver ${driverId} is now offline`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to go offline' });
    }
  });

  // Driver accepts or rejects an order
  socket.on('order_response', async ({ driverId, orderId, response }) => {
    try {
      if (response === 'accepted') {
        await driverService.acceptOrder(driverId, orderId);
      } else {
        await driverService.rejectOrder(driverId, orderId);
      }
      console.log(`[Socket] Driver ${driverId} ${response} order ${orderId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to process order response' });
    }
  });

  // Driver location update
  socket.on('location_update', async ({ driverId, location }) => {
    try {
      await driverService.updateLocation(driverId, location.longitude, location.latitude);
    } catch (error) {
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Delivery Service running on port ${PORT}`);
  });
}

module.exports = app;