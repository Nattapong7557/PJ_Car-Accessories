const { pool, QueryBuilder } = require('../config/db');

const normalizeBrandSlug = (name) => {
  if (!name) return null;
  return name.toString().trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

const getPartBrandId = async (brandName) => {
  if (!brandName) return null;
  const slug = normalizeBrandSlug(brandName);
  const { rows } = await pool.query(
    'SELECT id FROM part_brands WHERE name = $1 OR slug = $2 LIMIT 1',
    [brandName, slug]
  );

  if (rows[0]) return rows[0].id;

  const result = await pool.query(
    'INSERT INTO part_brands (name, slug, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id',
    [brandName, slug]
  );

  return result.rows[0].id;
};

const getCarBrandId = async (brandName) => {
  if (!brandName) return null;
  const slug = normalizeBrandSlug(brandName);
  const { rows } = await pool.query(
    'SELECT id FROM car_brands WHERE name = $1 OR slug = $2 LIMIT 1',
    [brandName, slug]
  );

  if (rows[0]) return rows[0].id;

  const result = await pool.query(
    'INSERT INTO car_brands (name, slug, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id',
    [brandName, slug]
  );

  return result.rows[0].id;
};

const mapProductRow = (row) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  brand: row.part_brand || row.brand || 'AutoParts Pro',
  carBrand: row.car_brand || null,
  description: row.description,
  price: Number(row.price),
  originalPrice: row.original_price === null ? null : Number(row.original_price),
  image: row.image,
  images: Array.isArray(row.images) ? row.images : [],
  category: row.category,
  badge: row.badge,
  rating: Number(row.rating),
  reviews: Number(row.reviews),
  stock: Number(row.stock),
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const attachProductMethods = (product) => {
  product.save = async () => {
    const partBrandId = await getPartBrandId(product.brand || product.partBrand || null);
    const carBrandId = await getCarBrandId(product.carBrand || product.car_brand || null);

    const { rows } = await pool.query(
      `UPDATE parts SET name=$1, description=$2, price=$3, original_price=$4, image=$5, images=$6, category=$7, badge=$8, rating=$9, reviews=$10, stock=$11, is_active=$12, part_brand_id=$13, car_brand_id=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [
        product.name,
        product.description,
        product.price,
        product.originalPrice,
        product.image,
        JSON.stringify(product.images || []),
        product.category,
        product.badge,
        product.rating,
        product.reviews,
        product.stock,
        product.isActive,
        partBrandId,
        carBrandId,
        product._id
      ]
    );

    if (rows[0]) {
      Object.assign(product, mapProductRow(rows[0]));
    }

    return product;
  };

  return product;
};

const Product = {
  find(query = {}) {
    return new QueryBuilder(async (queryBuilder) => {
      const conditions = [];
      const values = [];

      if (query.isActive !== undefined) {
        conditions.push(`p.is_active = $${values.length + 1}`);
        values.push(query.isActive);
      }

      if (query.category && query.category !== 'all') {
        if (Array.isArray(query.category)) {
          const placeholders = query.category.map((_, i) => `$${values.length + 1 + i}`);
          conditions.push(`p.category IN (${placeholders.join(', ')})`);
          values.push(...query.category);
        } else {
          conditions.push(`p.category = $${values.length + 1}`);
          values.push(query.category);
        }
      }

      if (query.carBrand) {
        conditions.push(`(cb.slug = $${values.length + 1} OR cb.name ILIKE $${values.length + 2})`);
        values.push(query.carBrand.toLowerCase(), query.carBrand);
      }

      if (query.$text && query.$text.$search) {
        const search = query.$text.$search;
        conditions.push(`(p.name ILIKE $${values.length + 1} OR pb.name ILIKE $${values.length + 2} OR cb.name ILIKE $${values.length + 3} OR p.description ILIKE $${values.length + 4})`);
        values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (query.price) {
        if (query.price.$gte !== undefined) {
          conditions.push(`p.price >= $${values.length + 1}`);
          values.push(query.price.$gte);
        }
        if (query.price.$lte !== undefined) {
          conditions.push(`p.price <= $${values.length + 1}`);
          values.push(query.price.$lte);
        }
      }

      let sql = `
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.image, p.images, p.category, p.badge, p.rating, p.reviews, p.stock, p.is_active, p.created_at, p.updated_at,
               pb.name AS part_brand, cb.name AS car_brand
        FROM parts p
        LEFT JOIN part_brands pb ON p.part_brand_id = pb.id
        LEFT JOIN car_brands cb ON p.car_brand_id = cb.id
      `;

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      if (queryBuilder.sortOption) {
        const [field, direction] = Object.entries(queryBuilder.sortOption)[0];
        const column = field === 'createdAt' ? 'p.created_at' : field === 'updatedAt' ? 'p.updated_at' : field === 'price' ? 'p.price' : field === 'rating' ? 'p.rating' : 'p.created_at';
        sql += ` ORDER BY ${column} ${direction === -1 ? 'DESC' : 'ASC'}`;
      }

      sql += ` OFFSET $${values.length + 1}`;
      values.push(queryBuilder.skipValue || 0);

      if (queryBuilder.limitValue) {
        sql += ` LIMIT $${values.length + 1}`;
        values.push(queryBuilder.limitValue);
      }

      const { rows } = await pool.query(sql, values);
      return rows.map(mapProductRow);
    });
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.description, p.price, p.original_price, p.image, p.images, p.category, p.badge, p.rating, p.reviews, p.stock, p.is_active, p.created_at, p.updated_at,
             pb.name AS part_brand, cb.name AS car_brand
      FROM parts p
      LEFT JOIN part_brands pb ON p.part_brand_id = pb.id
      LEFT JOIN car_brands cb ON p.car_brand_id = cb.id
      WHERE p.id = $1
    `, [id]);
    return rows[0] ? attachProductMethods(mapProductRow(rows[0])) : null;
  },

  async create(data) {
    const partBrandId = await getPartBrandId(data.brand || data.partBrand);
    const carBrandId = await getCarBrandId(data.carBrand);

    const { rows } = await pool.query(
      `INSERT INTO parts (name, description, price, original_price, image, images, category, badge, rating, reviews, stock, is_active, part_brand_id, car_brand_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) RETURNING *`,
      [
        data.name,
        data.description,
        data.price,
        data.originalPrice ?? null,
        data.image,
        JSON.stringify(data.images || []),
        data.category,
        data.badge ?? null,
        data.rating ?? 0,
        data.reviews ?? 0,
        data.stock ?? 0,
        data.isActive !== undefined ? data.isActive : true,
        partBrandId,
        carBrandId
      ]
    );

    return rows[0] ? attachProductMethods(mapProductRow(rows[0])) : null;
  },

  async findByIdAndUpdate(id, data, options = {}) {
    const existing = await this.findById(id);
    if (!existing) return null;

    Object.assign(existing, data);
    if (options.new === false) return existing;
    return attachProductMethods(existing).save();
  },

  async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await pool.query('DELETE FROM parts WHERE id = $1', [id]);
    return existing;
  },

  async deleteMany(filter = {}) {
    const conditions = [];
    const values = [];

    if (filter.isActive !== undefined) {
      conditions.push(`is_active = $${values.length + 1}`);
      values.push(filter.isActive);
    }

    let sql = 'DELETE FROM parts';
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    await pool.query(sql, values);
    return { deletedCount: 1 };
  },

  async insertMany(items) {
    const results = [];
    for (const item of items) {
      results.push(await this.create(item));
    }
    return results;
  },

  async countDocuments(filter = {}) {
    const conditions = [];
    const values = [];

    if (filter.isActive !== undefined) {
      conditions.push(`p.is_active = $${values.length + 1}`);
      values.push(filter.isActive);
    }

    if (filter.category && filter.category !== 'all') {
      if (Array.isArray(filter.category)) {
        const placeholders = filter.category.map((_, i) => `$${values.length + 1 + i}`);
        conditions.push(`p.category IN (${placeholders.join(', ')})`);
        values.push(...filter.category);
      } else {
        conditions.push(`p.category = $${values.length + 1}`);
        values.push(filter.category);
      }
    }

    if (filter.carBrand) {
      conditions.push(`(cb.slug = $${values.length + 1} OR cb.name ILIKE $${values.length + 2})`);
      values.push(filter.carBrand.toLowerCase(), filter.carBrand);
    }

    if (filter.$text && filter.$text.$search) {
      const search = filter.$text.$search;
      conditions.push(`(p.name ILIKE $${values.length + 1} OR pb.name ILIKE $${values.length + 2} OR cb.name ILIKE $${values.length + 3} OR p.description ILIKE $${values.length + 4})`);
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (filter.price) {
      if (filter.price.$gte !== undefined) {
        conditions.push(`p.price >= $${values.length + 1}`);
        values.push(filter.price.$gte);
      }
      if (filter.price.$lte !== undefined) {
        conditions.push(`p.price <= $${values.length + 1}`);
        values.push(filter.price.$lte);
      }
    }

    let sql = `
      SELECT COUNT(*)::int AS count
      FROM parts p
      LEFT JOIN part_brands pb ON p.part_brand_id = pb.id
      LEFT JOIN car_brands cb ON p.car_brand_id = cb.id
    `;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const { rows } = await pool.query(sql, values);
    return rows[0].count;
  }
};

module.exports = Product;
