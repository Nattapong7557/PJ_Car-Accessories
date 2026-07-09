const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อ'],
    trim: true,
    maxlength: [100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร']
  },
  email: {
    type: String,
    required: [true, 'กรุณาระบุอีเมล'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'รูปแบบอีเมลไม่ถูกต้อง']
  },
  password: {
    type: String,
    required: [true, 'กรุณาระบุรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
    select: false  // ไม่แสดง password เวลา query
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    district: { type: String, trim: true },
    province: { type: String, trim: true },
    postalCode: { type: String, trim: true }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password ก่อนบันทึก
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method เปรียบเทียบ password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
