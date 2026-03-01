const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const generateAccessToken = require('../utils/generateToken');
const { password } = require('../models/userCommonSchema');

//register new user
const registerUser = async(data) => {
    const { 
       name,
        email,
        password,
        phoneNo,
        address,
        role,
        businessName,
        businessAddress,
        taxId,
        businessPhoneNo,
        ItemTypes,
        vehicleType,
        licensePlate,
        currentLocation,
        isAvailable,
        currentOrders
    } = data;

    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new Error('User already exists with the provided email address');
    };

    const hashedPassword = await bcrypt.hash(password , 10);

    const user = new User ({
        name, 
        email, 
        password:hashedPassword, 
        phoneNo, 
        address, 
        role: role || 'customer',
        isVerified: true,
        businessName,
        businessAddress,
        taxId,
        businessPhoneNo,
        ItemTypes,
        vehicleType,
        licensePlate,
        currentLocation,
        isAvailable,
        currentOrders
    });

    await user.save();

    const token = generateAccessToken(user);

    return { 
        user, 
        token 
    };
};

//login
const loginUser = async({email, password}) => {
    const user = await User.findOne({email});
    if(!user || !user.isActive){
        throw new Error('Invalid user account');
    }

    const matchUser = await bcrypt.compare(password, user.password);
    if(!matchUser){
        throw new Error('Invalid user account');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateAccessToken(user);
    return {
        user,
        token
    };
};


module.exports = { 
    registerUser,
    loginUser
};