const session = require('express-session');

module.exports = (app) => {
    app.use(
        session({
            secret: process.env.JWT_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false}
        })
    );
}