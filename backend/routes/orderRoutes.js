const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, managerOrAdmin } = require('../middleware/auth');

// Private routes (ต้อง login)
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/admin/all', protect, managerOrAdmin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Manager/Admin routes
router.put('/:id/status', protect, managerOrAdmin, updateOrderStatus);

module.exports = router;