const Order = require('../models/Order');
const Product = require('../models/Product');

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

    // ตรวจสอบว่าเป็น order ของ user หรือเป็น admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

// @desc    อัปเดตสถานะ order (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') order.deliveredAt = Date.now();

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

// @desc    ดึง orders ทั้งหมด (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
};
