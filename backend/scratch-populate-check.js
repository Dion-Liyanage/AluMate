const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { join } = require('path');

dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Define schemas to match NestJS
const designSchema = new mongoose.Schema({
  designCode: String,
  title: String,
  description: String,
  category: String,
});
const Design = mongoose.model('Design', designSchema);

const orderSchema = new mongoose.Schema({
  orderId: String,
  designType: String,
  catalogueDesignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
});
const Order = mongoose.model('Order', orderSchema);

async function testPopulate() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const order = await Order.findOne({ orderId: 'ALU-ORD-2026-6949' }).populate('catalogueDesignId');
    console.log('Populated order:', JSON.stringify(order, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testPopulate();
