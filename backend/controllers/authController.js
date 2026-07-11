const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sanitizeUser = (user) => {
  if (!user) return user;
  const { password, _originalPassword, ...safeUser } = user;
  return safeUser;
};

// สร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    สมัครสมาชิก
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลนี้ถูกใช้งานแล้ว'
      });
    }

    // สร้าง user ใหม่
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // สร้าง token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      },
      message: 'สมัครสมาชิกสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    เข้าสู่ระบบ
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน'
      });
    }

    // ค้นหา user พร้อม password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ตรวจสอบ password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ตรวจสอบสถานะบัญชี
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'บัญชีถูกระงับการใช้งาน'
      });
    }

    // สร้าง token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      },
      message: 'เข้าสู่ระบบสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ดึงข้อมูล user ที่ login อยู่
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    อัปเดตข้อมูลส่วนตัว
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    // ถ้ามีการเปลี่ยนอีเมล ต้องตรวจสอบรูปแบบและความซ้ำซ้อนก่อน
    if (email && email !== req.user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกอีเมลให้ถูกต้อง'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'อีเมลนี้ถูกใช้งานแล้ว'
        });
      }
    }

    // เบอร์โทรศัพท์ (ถ้ากรอก) ต้องเป็นตัวเลขล้วน ไม่เกิน 10 หลัก
    if (phone && !/^[0-9]{1,10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลขไม่เกิน 10 หลัก'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: 'อัปเดตข้อมูลสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    เปลี่ยนรหัสผ่าน
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email: req.user.email }).select('+password');

    // ตรวจสอบรหัสผ่านเก่า
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      });
    }

    user.password = newPassword;
    await user.save();

    // สร้าง token ใหม่
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: { token },
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};