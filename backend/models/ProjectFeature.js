const mongoose = require('mongoose');

const ProjectFeatureSchema = new mongoose.Schema({
  // معلومات الميزة الأساسية
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  icon: {
    type: String,
    required: true
  },
  
  // نوع الميزة
  featureType: {
    type: String,
    enum: ['project', 'location', 'apartment', 'warranty'],
    required: true
  },
  
  // فئة الميزة
  category: {
    type: String,
    required: true
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
ProjectFeatureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// إنشاء فهرس للبحث
ProjectFeatureSchema.index({ featureType: 1 });
ProjectFeatureSchema.index({ category: 1 });
ProjectFeatureSchema.index({ status: 1 });
ProjectFeatureSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('ProjectFeature', ProjectFeatureSchema);