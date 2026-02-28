const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000
app.listen(PORT,() => {
    console.log(`Listening on PORT ${PORT} : http://localhost:${PORT}`);
});