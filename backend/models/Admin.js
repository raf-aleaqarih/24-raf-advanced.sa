const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // معلومات أساسية
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // الدور والصلاحيات
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'editor'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_apartments',
      'manage_media',
      'manage_features',
      'manage_warranties',
      'manage_project_info',
      'manage_admins',
      'view_analytics',
      'manage_inquiries'
    ]
  }],
  
  // معلومات إضافية
  profile: {
    avatar: {
      url: String,
      publicId: String
    },
    phone: String,
    department: String,
    bio: String
  },
  
  // الحالة
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // آخر نشاط
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
    max: 5
  },
  lockoutUntil: Date,
  
  // التوكنز
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // إعدادات الأمان
  twoFactorAuth: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    secret: String,
    backupCodes: [String]
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.twoFactorAuth.secret;
      delete ret.twoFactorAuth.backupCodes;
      return ret;
    }
  }
});

// Virtual للاسم الكامل
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
});

// Index للبحث والأمان
// Email unique index is already defined in schema
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Pre-save middleware لتشفير كلمة المرور
adminSchema.pre('save', async function(next) {
  // فقط إذا تم تعديل كلمة المرور
  if (!this.isModified('password')) return next();
  
  try {
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// طريقة لمقارنة كلمة المرور
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// طريقة للحصول على الصلاحيات الافتراضية حسب الدور
adminSchema.methods.getDefaultPermissions = function() {
  switch (this.role) {
    case 'super_admin':
      return [
        'manage_apartments',
        'manage_media',
        'manage_features',
        'manage_warranties',
        'manage_project_info',
        'manage_admins',
        'view_analytics',
        'manage_inquiries'
      ];
    case 'admin':
      return [
        'manage_apartments',
        'manage_media',
        'manage_features',
        'manage_warranties',
        'manage_project_info',
        'view_analytics',
        'manage_inquiries'
      ];
    case 'editor':
      return [
        'manage_apartments',
        'manage_media',
        'manage_features',
        'manage_warranties',
        'view_analytics'
      ];
    default:
      return [];
  }
};

// طريقة للتحقق من الصلاحية
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

// طريقة لتسجيل محاولة دخول فاشلة
adminSchema.methods.incrementLoginAttempts = function() {
  // إذا كان لدينا تاريخ انتهاء القفل وقد انتهى
  if (this.lockoutUntil && this.lockoutUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockoutUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // إذا تجاوز المحاولات المسموحة وليس مقفل
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockoutUntil: Date.now() + 2 * 60 * 60 * 1000 }; // قفل لمدة ساعتين
  }
  
  return this.updateOne(updates);
};

// طريقة لإعادة تعيين محاولات الدخول
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockoutUntil: 1 }
  });
};

module.exports = mongoose.model('Admin', adminSchema);
