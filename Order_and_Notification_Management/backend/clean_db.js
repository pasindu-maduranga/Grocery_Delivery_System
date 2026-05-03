const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://pasindumaduranga:pasi20020302@ecommercenew.boyfy.mongodb.net/Grocery_management_system?retryWrites=true&w=majority&appName=Ecommercenew')
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    const res = await db.collection('orders').deleteMany({ customerName: { $exists: false } });
    console.log(`Deleted ${res.deletedCount} rogue orders without customerName.`);
    await mongoose.disconnect();
  })
  .catch(err => console.error(err));
