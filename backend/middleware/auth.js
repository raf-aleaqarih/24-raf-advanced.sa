const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// التحقق من التوكن
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'لا يوجد توكن، الوصول مرفوض'
      });
    }

    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // البحث عن المستخدم
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'التوكن غير صالح'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل'
      });
    }

    // إضافة معلومات المستخدم للـ request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'التوكن غير صالح'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'التوكن منتهي الصلاحية'
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// التحقق من الصلاحيات
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    // السوبر أدمن له كل الصلاحيات
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // التحقق من وجود الصلاحية
    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المورد'
      });
    }

    next();
  };
};

// التحقق من الدور
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المورد'
      });
    }

    next();
  };
};

// ميدل وير اختياري للتحقق من التوكن
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.adminId).select('-password');
      
      if (admin && admin.isActive) {
        req.admin = admin;
      }
    }
    
    next();
  } catch (error) {
    // في حالة وجود خطأ، نتجاهله ونستمر بدون تعيين المستخدم
    next();
  }
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkRole,
  optionalAuth
};
