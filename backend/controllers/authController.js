const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// توليد JWT Token
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// توليد Refresh Token
const generateRefreshToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET + '_refresh', {
    expiresIn: '30d'
  });
};

// تسجيل الدخول
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    // البحث عن المدير
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // التحقق من حالة الحساب
    if (!admin.isActive) {
      return res.status(400).json({
        success: false,
        message: 'الحساب معطل، يرجى التواصل مع الإدارة'
      });
    }

    // التحقق من القفل
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'الحساب مقفل مؤقتاً بسبب محاولات دخول خاطئة متكررة'
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // زيادة عداد المحاولات
      await admin.incrementLoginAttempts();
      
      return res.status(400).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // إعادة تعيين محاولات الدخول عند النجاح
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    // تحديث آخر دخول
    admin.lastLogin = new Date();
    
    // توليد التوكنز
    const token = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);
    
    // حفظ الـ Refresh Token
    admin.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    
    // تنظيف التوكنز القديمة (أكثر من 30 يوم)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    admin.refreshTokens = admin.refreshTokens.filter(
      tokenObj => tokenObj.createdAt > thirtyDaysAgo
    );
    
    await admin.save();

    // إرسال الاستجابة
    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          profile: admin.profile
        },
        token,
        refreshToken
      },
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// تسجيل الخروج
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // إزالة الـ Refresh Token من قاعدة البيانات
      await Admin.findByIdAndUpdate(
        req.admin._id,
        {
          $pull: { refreshTokens: { token: refreshToken } }
        }
      );
    }

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// تجديد التوكن
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token مطلوب'
      });
    }

    // التحقق من صحة الـ Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '_refresh');
    
    // البحث عن المدير والتحقق من وجود التوكن
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token غير صالح'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل'
      });
    }

    // توليد توكن جديد
    const newToken = generateToken(admin._id);
    const newRefreshToken = generateRefreshToken(admin._id);

    // تحديث الـ Refresh Tokens
    admin.refreshTokens = admin.refreshTokens.filter(
      tokenObj => tokenObj.token !== refreshToken
    );
    
    admin.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date()
    });
    
    await admin.save();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('خطأ في تجديد التوكن:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token غير صالح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// الحصول على معلومات المستخدم الحالي
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('خطأ في جلب الملف الشخصي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// تحديث الملف الشخصي
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, bio } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData['profile.phone'] = phone;
    if (department) updateData['profile.department'] = department;
    if (bio) updateData['profile.bio'] = bio;

    // رفع صورة الملف الشخصي إذا كانت متوفرة
    if (req.file) {
      const cloudinary = require('../config/cloudinary');
      
      // حذف الصورة القديمة إذا كانت موجودة
      if (req.admin.profile?.avatar?.publicId) {
        await cloudinary.deleteImage(req.admin.profile.avatar.publicId);
      }
      
      // رفع الصورة الجديدة
      const result = await cloudinary.uploadImage(req.file.buffer, {
        folder: 'admins/avatars',
        public_id: `admin_${req.admin._id}_avatar_${Date.now()}`,
        transformation: [
          { width: 200, height: 200, crop: 'fill', quality: 'auto:good' }
        ]
      });
      
      updateData['profile.avatar'] = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: admin,
      message: 'تم تحديث الملف الشخصي بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الملف الشخصي'
    });
  }
};

// تغيير كلمة المرور
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبتان'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
      });
    }

    // التحقق من كلمة المرور الحالية
    const admin = await Admin.findById(req.admin._id);
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // تحديث كلمة المرور
    admin.password = newPassword;
    
    // إزالة جميع الـ Refresh Tokens لإجبار المستخدم على تسجيل الدخول مجدداً
    admin.refreshTokens = [];
    
    await admin.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير كلمة المرور'
    });
  }
};

// التحقق من صحة التوكن
const verifyToken = async (req, res) => {
  try {
    // إذا وصل إلى هنا فالتوكن صحيح (تم التحقق في الـ middleware)
    res.json({
      success: true,
      data: {
        admin: req.admin,
        valid: true
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
};
