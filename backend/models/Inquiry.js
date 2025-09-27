const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  // معلومات العميل
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^05\d{8}$/.test(v);
      },
      message: 'رقم الهاتف يجب أن يكون بصيغة سعودية صحيحة'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'البريد الإلكتروني غير صحيح'
    }
  },
  
  // تفاصيل الاستفسار
  message: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'facebook', 'instagram', 'snapchat', 'tiktok', 'google', 'whatsapp', 'direct', 'other'],
    default: 'website'
  },
  platform: {
    type: String,
    enum: ['meta', 'facebook', 'instagram', 'snapchat', 'tiktok', 'google', 'direct', 'website', 'other'],
    default: 'direct'
  },
  
  // معلومات إضافية
  interestedIn: {
    type: String,
    enum: ['model-a', 'model-b', 'model-c', 'model-d', 'general'],
    default: 'general'
  },
  budget: {
    min: Number,
    max: Number
  },
  
  // الحالة والمتابعة
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'not_interested', 'converted', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // الملاحظات والمتابعات
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  followUps: [{
    date: Date,
    type: {
      type: String,
      enum: ['call', 'whatsapp', 'email', 'meeting']
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // التتبع
  contactedAt: Date,
  convertedAt: Date,
  
  // البيانات التقنية
  userAgent: String,
  ipAddress: String,
  referrer: String,
  utmParams: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// فهرس للبحث
inquirySchema.index({ name: 'text', phone: 'text', email: 'text' });
inquirySchema.index({ status: 1, priority: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ assignedTo: 1, status: 1 });

// Virtual للوقت المنقضي
inquirySchema.virtual('timeElapsed').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `منذ ${days} يوم`;
  } else if (hours > 0) {
    return `منذ ${hours} ساعة`;
  } else {
    return 'منذ دقائق';
  }
});

// Method للحصول على لون الأولوية
inquirySchema.methods.getPriorityColor = function() {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'yellow',
    urgent: 'red'
  };
  return colors[this.priority] || 'gray';
};

// Method للحصول على لون الحالة
inquirySchema.methods.getStatusColor = function() {
  const colors = {
    new: 'green',
    contacted: 'blue',
    interested: 'yellow',
    not_interested: 'gray',
    converted: 'green',
    archived: 'gray'
  };
  return colors[this.status] || 'gray';
};

// Pre-save middleware
inquirySchema.pre('save', function(next) {
  // تحديث تاريخ الاتصال عند تغيير الحالة
  if (this.isModified('status') && this.status === 'contacted' && !this.contactedAt) {
    this.contactedAt = new Date();
  }
  
  // تحديث تاريخ التحويل عند تغيير الحالة
  if (this.isModified('status') && this.status === 'converted' && !this.convertedAt) {
    this.convertedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Inquiry', inquirySchema);
