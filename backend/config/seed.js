const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config();

const products = [
  {
    name: 'ล้อแม็ก Flowforming 18 นิ้ว Multi-Spoke',
    brand: 'RAYS',
    price: 28000,
    originalPrice: 35000,
    image: 'assets/images/products/wheel.png',
    badge: 'sale',
    category: 'promotion',
    rating: 4.8,
    reviews: 124,
    stock: 50,
    description: 'ล้อแม็ก Flowforming น้ำหนักเบา แข็งแรงทนทาน ขนาด 18 นิ้ว ดีไซน์ Multi-Spoke สีดำด้านขอบเงา'
  },
  {
    name: 'สปอยเลอร์หลัง Carbon Fiber GT Wing',
    brand: 'ADRO',
    price: 18500,
    originalPrice: null,
    image: 'assets/images/products/spoiler.png',
    badge: 'new',
    category: 'new',
    rating: 4.6,
    reviews: 56,
    stock: 30,
    description: 'สปอยเลอร์หลังคาร์บอนไฟเบอร์แท้ ดีไซน์ GT Wing สำหรับรถเก๋ง น้ำหนักเบา เพิ่ม Downforce'
  },
  {
    name: 'ปลายท่อไอเสีย Titanium Burnt Tip',
    brand: 'AKRAPOVIČ',
    price: 12900,
    originalPrice: 15900,
    image: 'assets/images/products/exhaust.png',
    badge: 'hot',
    category: 'bestseller',
    rating: 4.9,
    reviews: 203,
    stock: 80,
    description: 'ปลายท่อไอเสียไทเทเนียม สีไล่เฉดจากความร้อน ให้เสียงทุ้มนุ่ม ติดตั้งง่าย'
  },
  {
    name: 'ไฟหน้า LED DRL Crystal Lens',
    brand: 'DEPO',
    price: 8900,
    originalPrice: null,
    image: 'assets/images/products/headlight.png',
    badge: 'new',
    category: 'new',
    rating: 4.5,
    reviews: 87,
    stock: 40,
    description: 'ชุดไฟหน้า LED พร้อม DRL ดีไซน์ Crystal Lens ให้แสงสว่างคมชัด ประหยัดพลังงาน'
  },
  {
    name: 'ชุดแต่งบอดี้คิท Front Lip Carbon',
    brand: 'EVENTURI',
    price: 22000,
    originalPrice: 28000,
    image: 'assets/images/products/bodykit.png',
    badge: 'sale',
    category: 'promotion',
    rating: 4.7,
    reviews: 92,
    stock: 25,
    description: 'Front Lip คาร์บอนไฟเบอร์แท้ ดีไซน์สปอร์ต เข้ากับรถยนต์ซีดาน เพิ่มความดุดันให้ส่วนหน้า'
  },
  {
    name: 'ชุดช่วงล่างปรับระดับ Coilover Kit',
    brand: 'KW',
    price: 45000,
    originalPrice: 52000,
    image: 'assets/images/products/suspension.png',
    badge: 'hot',
    category: 'bestseller',
    rating: 4.9,
    reviews: 178,
    stock: 15,
    description: 'ชุดช่วงล่าง Coilover ปรับระดับความสูงและความหนืดได้ สำหรับรถเก๋งสมรรถนะสูง'
  },
  {
    name: 'กระจังหน้า Glossy Black Kidney Grille',
    brand: 'AutoParts Pro',
    price: 3500,
    originalPrice: null,
    image: 'assets/images/products/grille.png',
    badge: 'new',
    category: 'new',
    rating: 4.4,
    reviews: 65,
    stock: 100,
    description: 'กระจังหน้าสีดำเงา ดีไซน์ Double Slat เปลี่ยนลุคให้ดูสปอร์ตดุดัน ติดตั้งง่าย'
  },
  {
    name: 'ครอบกระจกมองข้าง Carbon Fiber',
    brand: 'ADRO',
    price: 4200,
    originalPrice: 5500,
    image: 'assets/images/products/mirror.png',
    badge: 'sale',
    category: 'promotion',
    rating: 4.3,
    reviews: 41,
    stock: 60,
    description: 'ครอบกระจกมองข้างคาร์บอนไฟเบอร์แท้ ลายทอ 2x2 สวยงาม น้ำหนักเบา'
  },
  {
    name: 'ดิฟฟิวเซอร์หลัง Carbon Fiber Quad Tip',
    brand: 'EVENTURI',
    price: 19500,
    originalPrice: null,
    image: 'assets/images/products/diffuser.png',
    badge: 'hot',
    category: 'bestseller',
    rating: 4.8,
    reviews: 95,
    stock: 20,
    description: 'ดิฟฟิวเซอร์หลังคาร์บอนไฟเบอร์ ช่องท่อไอเสีย 4 ช่อง ดีไซน์ Aero ช่วยเพิ่มสมรรถนะ'
  },
  {
    name: 'ชุดท่อไอดี Cold Air Intake Carbon',
    brand: 'EVENTURI',
    price: 32000,
    originalPrice: 38000,
    image: 'assets/images/products/intake.png',
    badge: 'sale',
    category: 'promotion',
    rating: 4.7,
    reviews: 156,
    stock: 35,
    description: 'ชุดท่อไอดี Cold Air Intake กล่องคาร์บอนไฟเบอร์ กรองอากาศสีแดง เพิ่มแรงม้าให้เครื่องยนต์'
  }
];

const adminUser = {
  name: 'Admin',
  email: 'admin@autopartspro.th',
  password: 'admin123456',
  role: 'admin',
  phone: '021234567'
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ลบข้อมูลเก่า
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // เพิ่มสินค้า
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Seeded ${createdProducts.length} products`);

    // เพิ่ม admin user
    const createdAdmin = await User.create(adminUser);
    console.log(`👤 Created admin user: ${createdAdmin.email}`);

    console.log('\n✅ Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${adminUser.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedDB();
