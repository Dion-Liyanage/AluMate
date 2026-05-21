const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { join } = require('path');

dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDb() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get order list
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find({}).toArray();
    console.log(`Found ${orders.length} orders:`);
    orders.forEach(o => {
      console.log(`Order ID: ${o.orderId}, designType: ${o.designType}, catalogueDesignId: ${o.catalogueDesignId} (type: ${typeof o.catalogueDesignId})`);
    });

    const designs = await db.collection('designs').find({}).toArray();
    console.log(`\nFound ${designs.length} designs:`);
    designs.forEach(d => {
      console.log(`Design ID: ${d._id}, code: ${d.designCode}, title: ${d.title}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDb();
