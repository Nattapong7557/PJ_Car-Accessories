// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // PostgreSQL invalid text representation / bad numeric / bad input syntax
  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง'
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    const detail = err.detail || '';
    const match = detail.match(/\(([^)]+)\)=/);
    const field = match ? match[1] : 'ข้อมูล';
    return res.status(400).json({
      success: false,
      message: `${field} นี้ถูกใช้งานแล้ว`
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลสัมพันธ์ไม่ถูกต้อง'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่'
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
  });
};

module.exports = errorHandler;
