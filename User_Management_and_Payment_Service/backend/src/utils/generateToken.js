const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: String(process.env.JWT_EXPIRES_IN || '1d').replace(/['"]/g, '')
        },
    );
};

module.exports = generateToken;