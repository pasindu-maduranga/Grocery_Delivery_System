const { registerUser, loginUser, forgotPassword, resetPassword } = require('../services/authService');
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
        const { latitude, longitude, address, ...loginCredentials } = req.body;
        
        const result = await loginUser(loginCredentials);
        
        // Update user location if provided
        if (latitude && longitude && result.user) {
            result.user.location = {
                latitude,
                longitude,
                address: address || 'Login location',
                lastUpdated: new Date()
            };
            await result.user.save();
        }
        
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

//google sign-in
const googleCallback = async(req,res) => {
    const token = req.user.token;
    if (process.env.FRONTEND_URL) {
        res.redirect(
            `${process.env.FRONTEND_URL}/login?token=${token}`
        );
    } else {
        res.json({ 
            success: true, 
            token, 
            user: req.user.user 
        });
    }
};

//forgot password
const forgotAppPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json(
        { 
            success: false, 
            message: 'Valid email is required' 
        });
    }

    const result = await forgotPassword(email);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(400).json(
        { 
            success: false, 
            message: err.message 
        });
  }
};

//reset password
const resetUserPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json(
        { 
            success: false, 
            message: 'Email, token and new password required' 
        });
    }

    const result = await resetPassword({ 
            email, 
            token, 
            newPassword: password 
        });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(400).json(
        { 
            success: false, 
            message: err.message 
        });
  }
};


module.exports = { 
    registerNewUser,
    userLogin,
    googleCallback,
    forgotAppPassword,
    resetUserPassword
};