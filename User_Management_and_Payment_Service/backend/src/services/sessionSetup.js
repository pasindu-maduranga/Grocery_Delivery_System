const session = require('express-session');

module.exports = (app) => {
    app.use(
        session({
            secret: process.env.JWT_SECRET || 'rapidcart_session_secret_2026',
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false}
        })
    );
}