require('dotenv').config();
const path = require('path');
const express = require('express');
const connectDB = require('./src/config/db');
const routes = require('./src/routes/indexRoutes');
const sessionSetup = require('./src/services/sessionSetup');
const passport = require('./src/utils/passportUtils');
const cors = require('cors');
const fs = require('fs');

connectDB();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '') .split(',') .map(o => o.trim()) .filter(Boolean); const corsOptions = { origin: (origin, callback) => { if (!origin) return callback(null, true); // allow non-browser tools if (allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error(CORS blocked for origin: ${origin})); }, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] };

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
console.log("ALLOWED ORIGINS:", allowedOrigins);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uploadsRoot = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsRoot, 'avatars');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

sessionSetup(app);

app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('User Management and Payment Service is running');
});

routes(app);


const PORT = process.env.PORT || 5003
if (!process.env.VERCEL) {
    app.listen(PORT,() => {
        console.log(`Listening on PORT ${PORT} : http://localhost:${PORT}`);
    });
}

module.exports = app;
