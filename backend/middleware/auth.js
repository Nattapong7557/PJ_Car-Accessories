const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ตรวจสอบ JWT Token
const protect = async (req, res, next) => {
  try {
    let token;

    // ดึง token จาก Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงข้อมูลนี้'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ค้นหา user จาก token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'บัญชีถูกระงับการใช้งาน'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ'
    });
  }
};

// ตรวจสอบ role (admin only)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง (Admin only)'
    });
  }
};

// ตรวจสอบ role (manager หรือ admin) - ใช้กับงานจัดการออเดอร์ที่ manager ก็ทำได้
const managerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง (Admin/Manager only)'
    });
  }
};

module.exports = { protect, adminOnly, managerOrAdmin };