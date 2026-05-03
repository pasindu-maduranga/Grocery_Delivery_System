const mongoose = require('mongoose');
const dns = require('dns');

// Force reliable DNS resolvers for Atlas SRV lookups when local DNS is broken.
dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }catch(error){
        console.error('MongoDB connection failed',error);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB;

