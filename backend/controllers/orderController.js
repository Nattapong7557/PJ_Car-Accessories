const Order = require('../models/Order');
const Product = require('../models/Product');
const { pool } = require('../config/db');

// @desc    สร้าง order ใหม่
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเพิ่มสินค้าในคำสั่งซื้อ'
      });
    }

    // คำนวณราคา & ตรวจสอบสต๊อก
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบสินค้า: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `สินค้า "${product.name}" มีสต๊อกไม่เพียงพอ (เหลือ ${product.stock} ชิ้น)`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity
      });

      subtotal += product.price * item.quantity;

      // ลดสต๊อก
      product.stock -= item.quantity;
      await product.save();
    }

    // คำนวณค่าจัดส่ง (ฟรีเมื่อซื้อ 2000 ขึ้นไป)
    const shippingCost = subtotal >= 2000 ? 0 : 150;
    const totalAmount = subtotal + shippingCost;

    // สร้าง order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      totalAmount,
      note
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'สร้างคำสั่งซื้อสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ดึง orders ของ user
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: orders,
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

// @desc    ดึง order ตาม ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    // ตรวจสอบว่าเป็น order ของ user เอง หรือเป็น admin/manager
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    อัปเดตสถานะ order (Manager/Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Manager,Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `สถานะไม่ถูกต้อง (ต้องเป็นหนึ่งใน: ${allowedStatuses.join(', ')})`
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'completed') order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'อัปเดตสถานะสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ดึง orders ทั้งหมด พร้อมชื่อ/อีเมลลูกค้า (Manager/Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Manager,Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const conditions = [];
    const whereValues = [];

    if (status) {
      conditions.push(`o.status = $${whereValues.length + 1}`);
      whereValues.push(status);
    }

    if (search) {
      conditions.push(`(u.name ILIKE $${whereValues.length + 1} OR u.email ILIKE $${whereValues.length + 2})`);
      whereValues.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const { rows } = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       OFFSET $${whereValues.length + 1}
       LIMIT $${whereValues.length + 2}`,
      [...whereValues, skip, limitNum]
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereClause}`,
      whereValues
    );

    const total = countRows[0].count;

    const orders = rows.map((row) => ({
      _id: row.id,
      id: row.id,
      user: row.user_id,
      user_name: row.user_name,
      user_email: row.user_email,
      items: Array.isArray(row.items) ? row.items : [],
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address || {},
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      subtotal: Number(row.subtotal),
      shippingCost: Number(row.shipping_cost),
      discount: Number(row.discount),
      totalAmount: Number(row.total_amount),
      total_amount: Number(row.total_amount),
      status: row.status,
      trackingNumber: row.tracking_number,
      note: row.note,
      paidAt: row.paid_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at
    }));

    res.status(200).json({
      success: true,
      data: orders,
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
};