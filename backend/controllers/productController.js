const Product = require('../models/Product');
const { pool } = require('../config/db');

// @desc    ดึงสินค้าทั้งหมด (พร้อม filter, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, carBrand, search, sort, page = 1, limit = 20, minPrice, maxPrice } = req.query;
    
    // Build query
    const query = { isActive: true };

    // กรองตามหมวดหมู่ (รองรับ comma-separated เช่น spoiler,wheel)
    if (category && category !== 'all') {
      const categories = category.split(',').map(c => c.trim()).filter(Boolean);
      query.category = categories.length === 1 ? categories[0] : categories;
    }

    // กรองตาม car brand
    if (carBrand && carBrand !== 'all') {
      query.carBrand = carBrand;
    }

    // ค้นหาด้วยคำค้น
    if (search) {
      query.$text = { $search: search };
    }

    // กรองตามช่วงราคา
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = limit === 'all' ? 1000 : Math.min(1000, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ดึงสินค้าตาม ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    สร้างสินค้าใหม่
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message: 'สร้างสินค้าสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    แก้ไขสินค้า
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า'
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'แก้ไขสินค้าสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ลบสินค้า (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า'
      });
    }

    res.status(200).json({
      success: true,
      message: 'ลบสินค้าสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ดึงรีวิวของสินค้า
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT id, user_name, rating, comment, created_at FROM product_reviews WHERE part_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    เพิ่มรีวิวสินค้า
// @route   POST /api/products/:id/reviews
// @access  Public (should ideally be Private)
const addProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_name, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'กรุณาให้คะแนนระหว่าง 1 ถึง 5 ดาว' });
    }

    // Insert review
    await pool.query(
      'INSERT INTO product_reviews (part_id, user_name, rating, comment) VALUES ($1, $2, $3, $4)',
      [id, user_name || 'Anonymous', rating, comment]
    );

    // Calculate new average and total reviews
    const { rows } = await pool.query(
      'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM product_reviews WHERE part_id = $1',
      [id]
    );

    const totalReviews = parseInt(rows[0].total_reviews, 10);
    const avgRating = parseFloat(rows[0].avg_rating).toFixed(1);

    // Update parts table
    await pool.query(
      'UPDATE parts SET rating = $1, reviews = $2 WHERE id = $3',
      [avgRating, totalReviews, id]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มรีวิวสำเร็จ',
      data: {
        newRating: avgRating,
        newReviewsCount: totalReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  addProductReview
};
