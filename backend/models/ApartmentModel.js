const mongoose = require('mongoose');

const ApartmentModelSchema = new mongoose.Schema({
  // معلومات النموذج الأساسية
  modelName: {
    type: String,
    required: true
  },
  
  modelTitle: {
    type: String,
    required: true
  },
  
  modelSubtitle: {
    type: String,
    required: true
  },
  
  // السعر (ريال سعودي فقط)
  price: {
    type: Number,
    required: true
  },
  
  // المساحة
  area: {
    type: Number,
    required: true
  },
  
  // مساحة السطح
  roofArea: {
    type: Number,
    default: 0
  },
  
  // الغرف والمرافق
  rooms: {
    type: Number,
    required: true
  },
  
  bathrooms: {
    type: Number,
    required: true
  },
  
  // الموقع والاتجاه
  location: {
    type: String,
    required: true
  },
  
  direction: {
    type: String,
    required: true
  },
  
  // الصور
  images: [{
    type: String,
    required: true
  }],
  
  // الصورة الرئيسية
  mainImage: {
    type: String,
    default: ''
  },
  
  // المميزات
  features: [{
    type: String,
    required: true
  }],
  
  // حالة النموذج
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold_out'],
    default: 'active'
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
ApartmentModelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// إنشاء فهرس للبحث
ApartmentModelSchema.index({ modelName: 1 }, { unique: true });
ApartmentModelSchema.index({ status: 1 });

module.exports = mongoose.model('ApartmentModel', ApartmentModelSchema);