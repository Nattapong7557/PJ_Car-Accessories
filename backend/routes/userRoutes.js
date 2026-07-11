const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes (ต้อง login + เป็น admin)
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;