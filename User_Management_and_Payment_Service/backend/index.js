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

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith('http://localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
sessionSetup(app);

app.use(passport.initialize());
app.use(passport.session());

routes(app);

const PORT = process.env.PORT || 5003
if (!process.env.VERCEL) {
    app.listen(PORT,() => {
        console.log(`Listening on PORT ${PORT} : http://localhost:${PORT}`);
    });
}

module.exports = app;
