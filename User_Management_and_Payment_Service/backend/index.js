require('dotenv').config();
const path = require('path');
const express = require('express');
const connectDB = require('./src/config/db');
const routes = require('./src/routes/indexRoutes');
const sessionSetup = require('./src/services/sessionSetup');
const passport = require('./src/utils/passportUtils');
const cors = require('cors');

connectDB();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser tools (e.g. Postman/curl) and configured browser origins.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
sessionSetup(app);

app.use(passport.initialize());
app.use(passport.session());

routes(app);

const PORT = process.env.PORT || 5004
if (!process.env.VERCEL) {
    app.listen(PORT,() => {
        console.log(`Listening on PORT ${PORT} : http://localhost:${PORT}`);
    });
}

module.exports = app;
