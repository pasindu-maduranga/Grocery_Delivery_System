const mongoose = require('mongoose');
const hideSensitiveFields = require('../plugins/userPlugins');
const deliveryPersonFields = require('./DeliveryPerson');
const groceryStoreOwnerFields = require('./GroceryStoreOwner');
const commonUserFields = require('./userCommonSchema');

const userSchema = new mongoose.Schema({
    //common fields for all users
    ...commonUserFields,
    
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