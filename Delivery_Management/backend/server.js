const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();

// CONNECT DATABASE
connectDB();

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true); // Allow all for now
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const partnerRoutes = require('./src/routes/partnerRoutes');
const tripRoutes = require('./src/routes/tripRoutes');

app.use('/api/delivery-partners', partnerRoutes);
app.use('/api/delivery-trips', tripRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Delivery Partner & Trip Service Running');
});

// Create HTTP server + Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true
  }
});

// Make io accessible in controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('driver_online', (data) => {
      // Handle real time map updates if frontend sends it directly through socket
      socket.broadcast.emit('driver_location_update', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Delivery Service running on port ${PORT}`);
  });
}

module.exports = app;