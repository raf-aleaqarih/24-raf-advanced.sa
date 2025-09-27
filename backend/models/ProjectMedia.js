const mongoose = require('mongoose');

const ProjectMediaSchema = new mongoose.Schema({
  // معلومات الملف الأساسية
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // نوع الملف
  mediaType: {
    type: String,
    enum: ['image', 'video', 'document', 'audio'],
    required: true
  },
  
  // فئة الملف
  category: {
    type: String,
    enum: ['project-photos', 'promotional', 'gallery', 'videos', 'general', 'apartment-images'],
    default: 'general'
  },
  
  // معلومات الملف
  file: {
    url: {
      type: String,
      required: true
    },
    publicId: String,
    originalName: String,
    fileSize: Number,
    mimeType: String,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  
  // نص بديل للصور
  alt: {
    type: String,
    default: ''
  },
  
  // تاغات
  tags: [{
    type: String
  }],
  
  // الشقة المرتبطة
  relatedApartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApartmentModel',
    default: null
  },
  
  // ترتيب العرض
  order: {
    type: Number,
    default: 0
  },
  
  // حالة الملف
  isActive: {
    type: Boolean,
    default: true
  },
  
  // معلومات الرفع
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// تحديث updatedAt عند التعديل
ProjectMediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// إنشاء فهرس للبحث
ProjectMediaSchema.index({ mediaType: 1 });
ProjectMediaSchema.index({ category: 1 });
ProjectMediaSchema.index({ isActive: 1 });
ProjectMediaSchema.index({ order: 1 });
ProjectMediaSchema.index({ relatedApartment: 1 });

module.exports = mongoose.model('ProjectMedia', ProjectMediaSchema);