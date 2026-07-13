const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Import all models
try {
  console.log('Loading models...');
  const User = require('./models/User');
  console.log('✓ User Model Loaded');
  const Category = require('./models/Category');
  console.log('✓ Category Model Loaded');
  const Product = require('./models/Product');
  console.log('✓ Product Model Loaded');
  const Review = require('./models/Review');
  console.log('✓ Review Model Loaded');
  const Wishlist = require('./models/Wishlist');
  console.log('✓ Wishlist Model Loaded');
  const Cart = require('./models/Cart');
  console.log('✓ Cart Model Loaded');
  const Address = require('./models/Address');
  console.log('✓ Address Model Loaded');
  const Order = require('./models/Order');
  console.log('✓ Order Model Loaded');

  console.log('\nAll models loaded successfully! Testing DB connection and schema registration...');
  
  const testModels = async () => {
    await connectDB();
    console.log('✓ Mongoose database connection test succeeded');
    
    // Check if models are registered in mongoose instance
    const registeredModels = Object.keys(mongoose.models);
    console.log('Registered Models:', registeredModels);
    
    if (registeredModels.length === 8) {
      console.log('\n🎉 SUCCESS: All 8 models registered successfully!');
      process.exit(0);
    } else {
      console.error(`\n❌ ERROR: Expected 8 registered models, but found ${registeredModels.length}`);
      process.exit(1);
    }
  };
  
  testModels();
} catch (error) {
  console.error('\n❌ ERROR loading or compiling models:', error.message);
  console.error(error.stack);
  process.exit(1);
}
