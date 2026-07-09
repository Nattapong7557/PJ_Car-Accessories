const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อสินค้า'],
    trim: true,
    maxlength: [200, 'ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร']
  },
  brand: {
    type: String,
    required: [true, 'กรุณาระบุแบรนด์'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'กรุณาระบุรายละเอียดสินค้า'],
    maxlength: [2000, 'รายละเอียดต้องไม่เกิน 2000 ตัวอักษร']
  },
  price: {
    type: Number,
    required: [true, 'กรุณาระบุราคา'],
    min: [0, 'ราคาต้องมากกว่า 0']
  },
  originalPrice: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    required: [true, 'กรุณาระบุรูปภาพสินค้า']
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    required: [true, 'กรุณาระบุหมวดหมู่'],
    enum: {
      values: ['promotion', 'new', 'bestseller', 'wheels', 'bodykit', 'exhaust', 'suspension', 'lighting', 'interior'],
      message: 'หมวดหมู่ไม่ถูกต้อง'
    }
  },
  badge: {
    type: String,
    enum: ['sale', 'new', 'hot', null],
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'สต๊อกต้องไม่ติดลบ']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index สำหรับค้นหา
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
