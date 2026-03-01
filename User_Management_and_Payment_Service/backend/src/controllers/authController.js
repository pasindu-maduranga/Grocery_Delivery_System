const { registerUser, loginUser } = require('../services/authService');
const filteredUserFields = require('./filterUserController');

//register new user
const registerNewUser = async(req, res) => {
    try{
        const result = await registerUser(req.body);
        res.status(201).json ({
            success: true,
            message: 'Account created successfully',
            user: filteredUserFields(result.user),
            token: result.token,
        });
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

//login
const userLogin = async(req, res) => {
    try{
        const result = await loginUser(req.body);
        res.status(201).json ({
            success: true,
            message: 'User login successful',
            ...result
        });
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { 
    registerNewUser,
    userLogin
};