const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || process.env.POSTGRES_URL || '';
const isNeonConnection = connectionString.includes('neon.tech') || connectionString.includes('sslmode=require');

const pool = new Pool({
  connectionString,
  ssl: isNeonConnection ? { rejectUnauthorized: false } : false
});

class QueryBuilder {
  constructor(executeFn) {
    this.executeFn = executeFn;
    this.sortOption = null;
    this.skipValue = 0;
    this.limitValue = null;
    this.selectFields = null;
  }

  sort(sortOption) {
    this.sortOption = sortOption;
    return this;
  }

  skip(value) {
    this.skipValue = value;
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  then(resolve, reject) {
    return this.executeFn(this).then(resolve, reject);
  }

  catch(reject) {
    return this.executeFn(this).catch(reject);
  }
}

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(30),
      address JSONB DEFAULT '{}'::jsonb,
      role VARCHAR(20) DEFAULT 'user',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS part_brands (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS car_brands (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS parts (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      part_brand_id BIGINT REFERENCES part_brands(id) ON DELETE SET NULL,
      car_brand_id BIGINT REFERENCES car_brands(id) ON DELETE SET NULL,
      price NUMERIC(10, 2) NOT NULL,
      original_price NUMERIC(10, 2),
      image VARCHAR(500) NOT NULL,
      images JSONB DEFAULT '[]'::jsonb,
      category VARCHAR(50) NOT NULL,
      badge VARCHAR(20),
      rating NUMERIC(2, 1) DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE parts
    ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      items JSONB DEFAULT '[]'::jsonb,
      shipping_address JSONB DEFAULT '{}'::jsonb,
      payment_method VARCHAR(50) NOT NULL,
      payment_status VARCHAR(30) DEFAULT 'pending',
      subtotal NUMERIC(10, 2) NOT NULL,
      shipping_cost NUMERIC(10, 2) DEFAULT 0,
      discount NUMERIC(10, 2) DEFAULT 0,
      total_amount NUMERIC(10, 2) NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      tracking_number VARCHAR(100),
      note TEXT,
      paid_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    await createTables();
    console.log(`✅ Neon PostgreSQL Connected: ${result.rows[0].now}`);
  } catch (error) {
    console.error(`❌ PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
  QueryBuilder
};
