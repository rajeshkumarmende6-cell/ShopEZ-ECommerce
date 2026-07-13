const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');
const Cart = require('./models/Cart');
const Address = require('./models/Address');
const Order = require('./models/Order');
const Promotion = require('./models/Promotion');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await Wishlist.deleteMany();
    await Cart.deleteMany();
    await Address.deleteMany();
    await Order.deleteMany();
    await Promotion.deleteMany();
    console.log('✓ Database cleared.');

    // 1. Create Default Users
    console.log('Seeding users...');
    const adminUser = await User.create({
      name: 'Admin ShopEZ',
      email: 'rajeshkumarmende6@gmail.com',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });

    const standardUser = await User.create({
      name: 'John Doe',
      email: 'user@shopez.com',
      password: 'password123',
      role: 'user',
      isVerified: true
    });
    console.log('✓ Users seeded successfully.');

    // Seed default addresses
    console.log('Seeding default addresses...');
    await Address.create({
      user: adminUser._id,
      fullName: 'Admin ShopEZ',
      phoneNumber: '9876543210',
      streetAddress: '123 Shoppers Street, Suite 500',
      city: 'Tech City',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      isDefault: true
    });

    await Address.create({
      user: standardUser._id,
      fullName: 'John Doe',
      phoneNumber: '9876543211',
      streetAddress: '456 Buyers Avenue, Block B',
      city: 'Commerce Hub',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      isDefault: true
    });
    console.log('✓ Addresses seeded successfully.');

    // 2. Create Categories
    console.log('Seeding categories...');
    const categoriesData = [
      {
        name: 'Electronics',
        description: 'Latest high-tech gadgets, headphones, and mobile devices.',
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Footwear',
        description: 'Athletic, formal, and casual premium sneakers.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Apparel',
        description: 'Stylish designers collection clothing and streetwear.',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Watches',
        description: 'Precision timing chronographs and elegant wristwear.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Fitness',
        description: 'Active gym equipment, accessories, and wear.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80'
      }
    ];

    const seededCategories = [];
    for (const cat of categoriesData) {
      const doc = await Category.create(cat);
      seededCategories.push(doc);
    }
    console.log('✓ Categories seeded successfully.');

    // Map categories by name for easy product assignment
    const catMap = {};
    seededCategories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // 3. Create Products
    console.log('Seeding products...');
    const productsData = [
      {
        name: 'AeroBuds Pro Max',
        description: 'Industry-leading noise cancelling wireless headphones. Equipped with dynamic high fidelity drivers, 40 hours battery life, and spatial audio support.',
        price: 149.99,
        discountPrice: 99.99,
        brand: 'Sony',
        stock: 25,
        ratings: 4.8,
        numOfReviews: 2,
        isFeatured: true,
        isBestSeller: true,
        category: catMap['Electronics'],
        user: adminUser._id,
        images: [{ public_id: 'aerobuds', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Chrono Sport Watch',
        description: 'Robust classic athletic wrist chronograph. Water resistant up to 100 meters, premium black leather strap, scratch-resistant sapphire glass cover.',
        price: 249.99,
        discountPrice: 199.99,
        brand: 'Fossil',
        stock: 15,
        ratings: 4.6,
        numOfReviews: 1,
        isFeatured: true,
        isBestSeller: false,
        category: catMap['Watches'],
        user: adminUser._id,
        images: [{ public_id: 'chronowatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Volt Sneakers V2',
        description: 'Ergonomic high-rebound athletic training footwear. Offers optimal heel cushions, breathable mesh fabric, and durable carbon-rubber soles.',
        price: 120.00,
        discountPrice: 0,
        brand: 'Nike',
        stock: 50,
        ratings: 4.9,
        numOfReviews: 3,
        isFeatured: true,
        isBestSeller: true,
        category: catMap['Footwear'],
        user: adminUser._id,
        images: [{ public_id: 'voltsneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Sleek Leather Wallet',
        description: 'Ultra-slim bifold genuine leather wallet with RFID blocking layer. Comfortably fits up to 12 cards and folding bill compartment.',
        price: 65.00,
        discountPrice: 49.99,
        brand: 'Bellroy',
        stock: 8, // Low stock product (for low stock dashboard banner testing)
        ratings: 4.5,
        numOfReviews: 1,
        isFeatured: false,
        isBestSeller: true,
        category: catMap['Apparel'],
        user: adminUser._id,
        images: [{ public_id: 'sleekwallet', url: 'https://images.unsplash.com/photo-1627124765135-56c607a97750?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Pro Premium Gym Bag',
        description: 'Spacious heavy-duty training bag with dedicated ventilated wet shoe compartment and waterproof side pockets for gym and travel.',
        price: 80.00,
        discountPrice: 69.99,
        brand: 'Adidas',
        stock: 30,
        ratings: 4.7,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: false,
        category: catMap['Fitness'],
        user: adminUser._id,
        images: [{ public_id: 'gymbag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Smart Pro Watch',
        description: 'Next-generation fitness smartwatch tracking heartbeat, sleep patterns, blood oxygen, and outdoor routes via standalone GPS.',
        price: 299.99,
        discountPrice: 249.99,
        brand: 'Samsung',
        stock: 40,
        ratings: 4.4,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: false,
        category: catMap['Watches'],
        user: adminUser._id,
        images: [{ public_id: 'smartwatch', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Pixel Watch Elite',
        description: 'Sleek premium wear tracker displaying calendar notifications, heart rate variability, and stress indexes.',
        price: 349.99,
        discountPrice: 299.99,
        brand: 'Google',
        stock: 12,
        ratings: 4.7,
        numOfReviews: 0,
        isFeatured: true,
        isBestSeller: false,
        category: catMap['Watches'],
        user: adminUser._id,
        images: [{ public_id: 'pixelwatch', url: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Sonic Soundbar 360',
        description: 'Immersive surround sound audio bar with Dolby Atmos compatibility, bluetooth connectivity, and Alexa voice assistant built-in.',
        price: 299.00,
        discountPrice: 249.99,
        brand: 'Bose',
        stock: 20,
        ratings: 4.8,
        numOfReviews: 0,
        isFeatured: true,
        isBestSeller: true,
        category: catMap['Electronics'],
        user: adminUser._id,
        images: [{ public_id: 'sonicsoundbar', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Apex Trail Runners',
        description: 'All-terrain heavy grip tracking shoes with quicklace system, mesh upper shell, and mudguard reinforcement overlays.',
        price: 140.00,
        discountPrice: 0,
        brand: 'Salomon',
        stock: 35,
        ratings: 4.9,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: true,
        category: catMap['Footwear'],
        user: adminUser._id,
        images: [{ public_id: 'trailrunners', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Windbreaker Jacket',
        description: 'Weatherproof outer shield hood jacket containing sustainable recycled polyester and micro-fleece interior insulation layers.',
        price: 110.00,
        discountPrice: 89.99,
        brand: 'Patagonia',
        stock: 15,
        ratings: 4.5,
        numOfReviews: 0,
        isFeatured: true,
        isBestSeller: false,
        category: catMap['Apparel'],
        user: adminUser._id,
        images: [{ public_id: 'windbreaker', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Yoga Mat Ultra',
        description: 'Premium natural rubber alignment mat with high traction grip surfaces, odor resistant layer, and thick impact cushion layer.',
        price: 78.00,
        discountPrice: 0,
        brand: 'Lululemon',
        stock: 5,
        ratings: 4.6,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: false,
        category: catMap['Fitness'],
        user: adminUser._id,
        images: [{ public_id: 'yogamat', url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Minimalist Backpack',
        description: 'Lightweight urban daypack offering a padded laptop sleeve pocket, key clip loops, and signature striped fabric liners.',
        price: 85.00,
        discountPrice: 0,
        brand: 'Herschel',
        stock: 18,
        ratings: 4.7,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: true,
        category: catMap['Apparel'],
        user: adminUser._id,
        images: [{ public_id: 'backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Ultralight Sleeping Bag',
        description: 'Cozy and compact outdoor compression sleeping bag containing 800-fill power down insulation for extreme alpine conditions.',
        price: 199.99,
        discountPrice: 159.99,
        brand: 'Marmot',
        stock: 10,
        ratings: 4.8,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: false,
        category: catMap['Fitness'],
        user: adminUser._id,
        images: [{ public_id: 'sleepingbag', url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Retro Leather Jacket',
        description: 'Genuine cowhide classic rider jacket featuring asymmetric zipper closures, utility zip pockets, and snap-down lapels.',
        price: 450.00,
        discountPrice: 0,
        brand: 'Schott',
        stock: 6,
        ratings: 4.9,
        numOfReviews: 0,
        isFeatured: true,
        isBestSeller: true,
        category: catMap['Apparel'],
        user: adminUser._id,
        images: [{ public_id: 'leatherjacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Aero Wireless Keyboard',
        description: 'Low-profile mechanical tactile switches keyboard with dual wireless connectivity modes and smart customizable backlighting.',
        price: 129.99,
        discountPrice: 99.99,
        brand: 'Logitech',
        stock: 40,
        ratings: 4.6,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: true,
        category: catMap['Electronics'],
        user: adminUser._id,
        images: [{ public_id: 'aerokeyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Titanium Water Bottle',
        description: 'Ultralight high durability single-wall titanium bottle with custom carry loops, perfect for trekking and backpacking.',
        price: 60.00,
        discountPrice: 0,
        brand: 'Snow Peak',
        stock: 25,
        ratings: 4.7,
        numOfReviews: 0,
        isFeatured: false,
        isBestSeller: false,
        category: catMap['Fitness'],
        user: adminUser._id,
        images: [{ public_id: 'titaniumbottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Classic Gold Chronograph',
        description: 'Exquisite solar-charging quartz gold wrist watch with calendar date display, tachymeter ring, and linked bracelet bands.',
        price: 399.00,
        discountPrice: 349.99,
        brand: 'Seiko',
        stock: 8,
        ratings: 4.8,
        numOfReviews: 0,
        isFeatured: true,
        isBestSeller: true,
        category: catMap['Watches'],
        user: adminUser._id,
        images: [{ public_id: 'goldwatch', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80' }]
      },
      {
        name: 'Sport Grip Dumbbells',
        description: 'Ergonomic non-slip neoprene coated hexagonal dumbbells, perfect for home strength training and active conditioning workout routines.',
        price: 180.00,
        discountPrice: 0,
        brand: 'Bowflex',
        stock: 15,
        ratings: 4.8,
        numOfReviews: 0,
        isFeatured: true,
        isBestSeller: false,
        category: catMap['Fitness'],
        user: adminUser._id,
        images: [{ public_id: 'dumbbells', url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80' }]
      }
    ];

    for (const prod of productsData) {
      await Product.create(prod);
    }
    console.log('✓ Products seeded successfully.');

    // Seed default promotions
    console.log('Seeding default promotions...');
    const now = new Date();
    const future30d = new Date();
    future30d.setDate(now.getDate() + 30);
    const future7d = new Date();
    future7d.setDate(now.getDate() + 7);

    await Promotion.create({
      title: 'Mega Electronics Carnival',
      subtitle: 'Up to 50% Off on Premium Gadgets',
      description: 'Upgrade your tech workspace with exclusive deals on premium audio devices, monitors, smartwatches, and computing accessories. High quality meets unbeatable savings.',
      eventType: 'Mega Sale Events',
      desktopBanner: {
        public_id: 'mock_electronics_desktop',
        url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80'
      },
      mobileBanner: {
        public_id: 'mock_electronics_mobile',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
      },
      offerPercentage: 50,
      couponCode: 'TECH50',
      countdownTimer: future7d,
      ctaText: 'Explore Tech Deals',
      ctaUrl: '/products?category=Electronics',
      bgColor: '#0f172a', // Deep Slate
      priority: 10,
      startDate: now,
      endDate: future30d,
      isActive: true
    });

    await Promotion.create({
      title: 'Premium Footwear Fest',
      subtitle: 'Step into Comfort & Athletic Speed',
      description: 'Grab best-selling runners, performance tennis shoes, and street sneakers from elite brands. Limited-time clearance stock, get yours before it is gone.',
      eventType: 'Clearance Sales',
      desktopBanner: {
        public_id: 'mock_shoes_desktop',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
      },
      mobileBanner: {
        public_id: 'mock_shoes_mobile',
        url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'
      },
      offerPercentage: 35,
      couponCode: 'RUN35',
      countdownTimer: future7d,
      ctaText: 'Browse Sneakers',
      ctaUrl: '/products?category=Footwear',
      bgColor: '#1e1b4b', // Deep Royal Blue/Purple
      priority: 5,
      startDate: now,
      endDate: future30d,
      isActive: true
    });
    console.log('✓ Default promotions seeded successfully.');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
