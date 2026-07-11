const { pool } = require('../config/db');
const User = require('../models/User');

// @desc    ดึงรายชื่อ user ทั้งหมด (สำหรับหน้า admin dashboard)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    const safeUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.status(200).json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    เปลี่ยน role ของ user (user / manager / admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'manager', 'admin'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role ไม่ถูกต้อง (ต้องเป็นหนึ่งใน: ${allowedRoles.join(', ')})`
      });
    }

    // กันไม่ให้ admin ลด role ตัวเองจนหลุดสิทธิ์ admin โดยไม่ตั้งใจ
    if (String(req.params.id) === String(req.user._id) && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถเปลี่ยน role ของตัวเองออกจาก admin ได้'
      });
    }

    const { rows: roleRows } = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (!roleRows[0]) {
      return res.status(400).json({
        success: false,
        message: `ไม่พบ role "${role}" ในระบบ`
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { roleId: roleRows[0].id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId
      },
      message: 'อัปเดต role สำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole
};