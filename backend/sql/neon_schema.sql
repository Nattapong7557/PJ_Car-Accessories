-- Drop all existing product-related objects and recreate the normalized schema
DO $$
DECLARE
  obj_kind CHAR;
BEGIN
  SELECT c.relkind
  INTO obj_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'products'
  LIMIT 1;

  IF obj_kind = 'r' OR obj_kind = 'p' THEN
    EXECUTE 'DROP TABLE public.products';
  ELSIF obj_kind = 'v' THEN
    EXECUTE 'DROP VIEW public.products';
  ELSIF obj_kind = 'm' THEN
    EXECUTE 'DROP MATERIALIZED VIEW public.products';
  END IF;

  SELECT c.relkind
  INTO obj_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'part_catalog'
  LIMIT 1;

  IF obj_kind = 'r' OR obj_kind = 'p' THEN
    EXECUTE 'DROP TABLE public.part_catalog';
  ELSIF obj_kind = 'v' THEN
    EXECUTE 'DROP VIEW public.part_catalog';
  ELSIF obj_kind = 'm' THEN
    EXECUTE 'DROP MATERIALIZED VIEW public.part_catalog';
  END IF;
END$$;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS part_brands;
DROP TABLE IF EXISTS car_brands;

CREATE TABLE part_brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  part_brand_id BIGINT REFERENCES part_brands(id) ON DELETE SET NULL,
  car_brand_id BIGINT REFERENCES car_brands(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
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
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  address JSONB DEFAULT '{}'::jsonb,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
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
);

CREATE INDEX idx_parts_part_brand_id ON parts(part_brand_id);
CREATE INDEX idx_parts_car_brand_id ON parts(car_brand_id);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_is_active ON parts(is_active);

CREATE OR REPLACE VIEW part_catalog AS
SELECT
  p.id,
  p.name,
  p.description,
  p.price,
  p.original_price,
  p.image,
  p.category,
  p.badge,
  p.rating,
  p.reviews,
  p.stock,
  p.is_active,
  pb.id AS part_brand_id,
  pb.name AS part_brand,
  pb.slug AS part_brand_slug,
  cb.id AS car_brand_id,
  cb.name AS car_brand,
  cb.slug AS car_brand_slug,
  p.created_at,
  p.updated_at
FROM parts p
LEFT JOIN part_brands pb ON p.part_brand_id = pb.id
LEFT JOIN car_brands cb ON p.car_brand_id = cb.id;

CREATE OR REPLACE VIEW products AS
SELECT
  id,
  name,
  part_brand AS brand,
  car_brand,
  description,
  price,
  original_price,
  image,
  category,
  badge,
  rating,
  reviews,
  stock,
  is_active,
  created_at,
  updated_at
FROM part_catalog;

INSERT INTO part_brands (name, slug) VALUES
  ('RAYS', 'rays'),
  ('ADRO', 'adro'),
  ('AKRAPOVIČ', 'akrapovic'),
  ('DEPO', 'depo'),
  ('EVENTURI', 'eventuri'),
  ('KW', 'kw');

INSERT INTO car_brands (name, slug) VALUES
  ('BMW', 'bmw'),
  ('Mercedes-Benz', 'mercedes-benz'),
  ('Toyota', 'toyota'),
  ('Honda', 'honda'),
  ('Nissan', 'nissan');

INSERT INTO parts (
  name, description, part_brand_id, car_brand_id, price, original_price, image, category, badge, rating, reviews, stock, is_active
) VALUES
  ('ล้อแม็ก Flowforming 18 นิ้ว', 'ล้อแม็กคุณภาพสูง', (SELECT id FROM part_brands WHERE slug='rays'), (SELECT id FROM car_brands WHERE slug='bmw'), 28000, 35000, 'assets/images/products/wheel.png', 'wheels', 'sale', 4.8, 124, 50, TRUE),
  ('สปอยเลอร์หลัง Carbon Fiber', 'สปอยเลอร์ดีไซน์สปอร์ต', (SELECT id FROM part_brands WHERE slug='adro'), (SELECT id FROM car_brands WHERE slug='mercedes-benz'), 18500, NULL, 'assets/images/products/spoiler.png', 'bodykit', 'new', 4.6, 56, 30, TRUE),
  ('ปลายท่อไอเสีย Titanium', 'ปลายท่อไอเสียคุณภาพสูง', (SELECT id FROM part_brands WHERE slug='akrapovic'), (SELECT id FROM car_brands WHERE slug='toyota'), 12900, 15900, 'assets/images/products/exhaust.png', 'exhaust', 'hot', 4.9, 203, 80, TRUE);

-- Example query to get all parts with both brand columns
SELECT * FROM part_catalog ORDER BY id;

-- Example query to filter by part brand and car brand
SELECT * FROM part_catalog
WHERE part_brand = 'RAYS' AND car_brand = 'BMW';
