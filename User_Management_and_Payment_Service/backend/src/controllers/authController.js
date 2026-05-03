const { registerUser, createDriver, loginUser, forgotPassword, resetPassword } = require('../services/authService');
const filteredUserFields = require('./filterUserController');

// Register new customer
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
        res.status(400).json({ success: false, message: error.message });
    }
};

// Admin creating driver account
const adminCreateDriver = async (req, res) => {
  try {
    const result = await createDriver(req.body);
    res.status(201).json({
      success: true,
      message: 'Driver profile created and email sent successfully',
      user: filteredUserFields(result.user)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Login
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
        res.status(400).json({ success: false, message: error.message });
    }
};

// Google Callback
const googleCallback = async(req,res) => {
    const token = req.user.token;
    if (process.env.FRONTEND_URL) {
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } else {
        res.json({ success: true, token, user: req.user.user });
    }
};

// Forgot Password
const forgotAppPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Reset Password
const resetUserPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const result = await resetPassword({ email, token, newPassword: password });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { 
    registerNewUser,
    adminCreateDriver,
    userLogin,
    googleCallback,
    forgotAppPassword,
    resetUserPassword
};