const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Lỗi xác thực token:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

module.exports = authMiddleware;

