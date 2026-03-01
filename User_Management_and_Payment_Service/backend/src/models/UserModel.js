const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const hideSensitiveFields = require('../plugins/userPlugins');
const deliveryPersonFields = require('./DeliveryPerson');
const groceryStoreOwnerFields = require('./GroceryStoreOwner');
const commonUserFields = require('./userCommonSchema');

const userSchema = new mongoose.Schema({
    //common fields for all users
    ...commonUserFields,
    
    // Delivery person specific fields
    ...deliveryPersonFields,
    
    // Grocery Store owner specific fields
    ...groceryStoreOwnerFields,
}, {
    timestamps: true
});

// Method to hide password in API responses
userSchema.plugin(hideSensitiveFields);

// Hash password before save
// userSchema.pre('save', async function(next) {
//     if(!this.isModified('password')){
//         return next();
//     }
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });

// Method to compare password during login
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return bcrypt.compare(candidatePassword, commonUserFields.password);
// };

module.exports = mongoose.model('User', userSchema);