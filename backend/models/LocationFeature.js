const mongoose = require('mongoose');

const LocationFeatureSchema = new mongoose.Schema({
  // معلومات الميزة الأساسية
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: false
  },
  
  icon: {
    type: String,
    required: true,
    default: 'MapPin'
  },
  
  // فئة ميزة الموقع
  category: {
    type: String,
    enum: ['nearby', 'minutesFrom', 'transport', 'services', 'entertainment'],
    required: true,
    default: 'nearby'
  },
  
  // المسافة أو الوقت (اختياري)
  distance: {
    type: String,
    required: false
  },
  
  // ترتيب العرض
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // حالة الميزة
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // إعدادات العرض
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // معلومات إضافية
  additionalInfo: {
    type: String,
    required: false
  },
  
  // التواريخ
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// تحديث updatedAt عند التعديل
LocationFeatureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// إنشاء فهارس للبحث السريع
LocationFeatureSchema.index({ category: 1 });
LocationFeatureSchema.index({ status: 1 });
LocationFeatureSchema.index({ displayOrder: 1 });
LocationFeatureSchema.index({ isVisible: 1 });

module.exports = mongoose.model('LocationFeature', LocationFeatureSchema);
