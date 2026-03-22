const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');

const updateProfile = async (user, body) => {

    const updates = Object.keys(body);
    const allowedUpdates = ['name', 'email', 'phoneNo', 'address'];

    const isValidOperation = updates.every(update =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        throw new Error('Invalid updates');
    }

    updates.forEach(update => {
        user[update] = body[update];
    });

    await user.save();

    return user;
};


const updatePassword = async (user, currentPassword, newPassword) => {

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return true;
};


const uploadAvatar = async (user, file) => {

    if (!file) {
        throw new Error('No file uploaded');
    }

    user.avatar = file.path || file.location;

    await user.save();

    return user.avatar;
};

const updateLocation = async (user, latitude, longitude, address) => {
    if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
    }

    user.location = {
        latitude,
        longitude,
        address: address || 'Location updated',
        lastUpdated: new Date()
    };

    await user.save();

    return user.location;
};


module.exports = {
    updateProfile,
    updatePassword,
    uploadAvatar,
    updateLocation
};