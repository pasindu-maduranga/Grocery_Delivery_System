const mongoose = require('mongoose');
const hideSensitiveFields = require('../plugins/userPlugins');
const commonUserFields = require('./UserCommonSchema');

const userSchema = new mongoose.Schema({
    //common fields for all users
    ...commonUserFields,
    
    // Location tracking
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
        lastUpdated: { type: Date }
    },
    // Delivery person specific fields
    // ...deliveryPersonFields,
    
    // Grocery Store owner specific fields
    // ...groceryStoreOwnerFields,
}, {
    timestamps: true
});

// Method to hide password in API responses
userSchema.plugin(hideSensitiveFields);

module.exports = mongoose.model('User', userSchema);