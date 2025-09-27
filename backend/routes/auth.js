const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const {
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
} = require('../controllers/authController');

// إعداد رفع الملفات للصورة الشخصية
const avatarUpload = uploadConfigs.single('avatar');

// تسجيل الدخول
router.post('/login', login);

// تجديد التوكن
router.post('/refresh', refreshToken);

// التحقق من صحة التوكن
router.get('/verify', authenticateToken, verifyToken);

// الحصول على الملف الشخصي
router.get('/profile', authenticateToken, getProfile);

// تحديث الملف الشخصي
router.put('/profile', 
  authenticateToken,
  avatarUpload,
  handleUploadError,
  updateProfile
);

// تغيير كلمة المرور
router.put('/change-password', authenticateToken, changePassword);

// تسجيل الخروج
router.post('/logout', authenticateToken, logout);

module.exports = router;
