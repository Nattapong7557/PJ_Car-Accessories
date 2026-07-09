const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB, pool } = require('./db');

dotenv.config();

const products = [
  {
    name: 'ล้อแม็ก Flowforming 18 นิ้ว Multi-Spoke',
    brand: 'RAYS',
    carBrand: 'BMW',
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
    carBrand: 'Mercedes-Benz',
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
    carBrand: 'Toyota',
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
    carBrand: 'Honda',
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
    carBrand: 'BMW',
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
    carBrand: 'Toyota',
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
    carBrand: 'BMW',
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
    carBrand: 'Honda',
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
    carBrand: 'Nissan',
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
    carBrand: 'Toyota',
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

const normalizeSlug = (text) => {
  return text.toString().trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
};

const getBrandId = async (table, name) => {
  if (!name) return null;
  const slug = normalizeSlug(name);
  const { rows } = await pool.query(`SELECT id FROM ${table} WHERE name = $1 OR slug = $2 LIMIT 1`, [name, slug]);
  return rows[0] ? rows[0].id : null;
};

const seedDB = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to Neon PostgreSQL');

    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM parts');
    await pool.query('DELETE FROM part_brands');
    await pool.query('DELETE FROM car_brands');

    console.log('🗑️  Cleared existing data');

    const partBrands = ['RAYS', 'ADRO', 'AKRAPOVIČ', 'DEPO', 'EVENTURI', 'KW'];
    const carBrands = ['BMW', 'Mercedes-Benz', 'Toyota', 'Honda', 'Nissan'];

    for (const name of partBrands) {
      const slug = normalizeSlug(name);
      await pool.query(
        'INSERT INTO part_brands (name, slug, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        [name, slug]
      );
    }

    for (const name of carBrands) {
      const slug = normalizeSlug(name);
      await pool.query(
        'INSERT INTO car_brands (name, slug, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        [name, slug]
      );
    }

    for (const item of products) {
      const partBrandId = await getBrandId('part_brands', item.brand);
      const carBrandId = await getBrandId('car_brands', item.carBrand);

      await pool.query(
        `INSERT INTO parts
         (name, description, price, original_price, image, images, category, badge, rating, reviews, stock, is_active, part_brand_id, car_brand_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
        [
          item.name,
          item.description,
          item.price,
          item.originalPrice,
          item.image,
          JSON.stringify(item.images || []),
          item.category,
          item.badge,
          item.rating,
          item.reviews,
          item.stock,
          true,
          partBrandId,
          carBrandId
        ]
      );
    }

    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    await pool.query(
      `INSERT INTO users (name, email, password, phone, address, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        adminUser.name,
        adminUser.email,
        hashedPassword,
        adminUser.phone,
        JSON.stringify({}),
        adminUser.role,
        true
      ]
    );

    console.log(`📦 Seeded ${products.length} products`);
    console.log(`👤 Created admin user: ${adminUser.email}`);
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
