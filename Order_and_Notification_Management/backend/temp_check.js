const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://pasindumaduranga:pasi20020302@ecommercenew.boyfy.mongodb.net/Grocery_management_system?retryWrites=true&w=majority&appName=Ecommercenew')
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find({ customerName: { $exists: false } }).toArray();
    console.log(`Found ${orders.length} orders without customerName.`);
    if (orders.length > 0) {
      console.log(orders[0]); // Print the first one
    }
    await mongoose.disconnect();
  })
  .catch(err => console.error(err));
