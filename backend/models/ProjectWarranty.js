const mongoose = require('mongoose');

const ProjectWarrantySchema = new mongoose.Schema({
  // معلومات الضمان الأساسية
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // مدة الضمان
  years: {
    type: Number,
    required: true
  },
  
  // نوع الضمان
  warrantyType: {
    type: String,
    enum: ['structural', 'electrical', 'plumbing', 'elevator', 'smart_home', 'owners_association'],
    required: true
  },
  
  // فئة الضمان
  category: {
    type: String,
    required: true
  },
  
  // ترتيب العرض
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // حالة الضمان
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
ProjectWarrantySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// إنشاء فهرس للبحث
ProjectWarrantySchema.index({ warrantyType: 1 });
ProjectWarrantySchema.index({ category: 1 });
ProjectWarrantySchema.index({ status: 1 });
ProjectWarrantySchema.index({ displayOrder: 1 });

module.exports = mongoose.model('ProjectWarranty', ProjectWarrantySchema);