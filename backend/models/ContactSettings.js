const mongoose = require('mongoose');

const ContactSettingsSchema = new mongoose.Schema({
  // إعدادات التواصل الأساسية
  projectName: {
    type: String,
    required: true,
    default: "مشروع 24 - حي الزهراء"
  },
  
  // أرقام الهاتف حسب المنصة
  phoneNumbers: {
    meta: {
      type: String,
      default: "0555812257"
    },
    snapchat: {
      type: String,
      default: "0543766262"
    },
    tiktok: {
      type: String,
      default: "0539488805"
    },
    google: {
      type: String,
      default: "0552845403"
    },
    default: {
      type: String,
      default: "0536667967"
    }
  },
  
  // رسائل الترحيب حسب المنصة
  welcomeMessages: {
    snapchat: {
      type: String,
      default: "السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع"
    },
    tiktok: {
      type: String,
      default: "مرحباً ، السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع"
    },
    meta: {
      type: String,
      default: "مرحباً، أرغب بالاستفسار عن المشروع"
    },
    google: {
      type: String,
      default: "السلام عليكم ورحمة الله وبركاته، ارغب بالاستفسار عن المشروع"
    },
    facebook: {
      type: String,
      default: "السلام عليكم ورحمة الله وبركاته 🌟\nأرغب بالاستفسار عن مشروع 24 - حي الزهراء في جدة"
    }
  },
  
  // إعدادات البريد الإلكتروني
  emailSettings: {
    host: {
      type: String,
      default: "smtp.hostinger.com"
    },
    port: {
      type: Number,
      default: 465
    },
    secure: {
      type: Boolean,
      default: false
    },
    user: {
      type: String,
      default: "24_project@raf-advanced.sa"
    },
    password: {
      type: String,
      default: "Yussefali@1234"
    }
  },
  
  // إعدادات التتبع
  trackingSettings: {
    facebookPixel: {
      enabled: {
        type: Boolean,
        default: true
      },
      pixelId: String
    },
    snapchatPixel: {
      enabled: {
        type: Boolean,
        default: true
      },
      pixelId: String
    },
    tiktokPixel: {
      enabled: {
        type: Boolean,
        default: true
      },
      pixelId: String
    },
    googleAnalytics: {
      enabled: {
        type: Boolean,
        default: true
      },
      trackingId: String
    },
    googleTagManager: {
      enabled: {
        type: Boolean,
        default: true
      },
      containerId: String
    }
  },
  
  // إعدادات النماذج
  formSettings: {
    inquiryForm: {
      enabled: {
        type: Boolean,
        default: true
      },
      fields: {
        name: {
          required: {
            type: Boolean,
            default: true
          },
          placeholder: {
            type: String,
            default: "الاسم الكامل"
          }
        },
        phone: {
          required: {
            type: Boolean,
            default: true
          },
          placeholder: {
            type: String,
            default: "05XXXXXXXX"
          },
          validation: {
            type: String,
            default: "^05\\d{8}$"
          }
        },
        message: {
          required: {
            type: Boolean,
            default: false
          },
          placeholder: {
            type: String,
            default: "اكتب استفسارك هنا"
          }
        }
      }
    }
  },
  
  // إعدادات المشاركة
  sharingSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    platforms: {
      whatsapp: {
        enabled: {
          type: Boolean,
          default: true
        },
        message: {
          type: String,
          default: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة\n\nاستفسر الآن عن مشروع 24 في حي الزهراء"
        }
      },
      twitter: {
        enabled: {
          type: Boolean,
          default: true
        },
        message: {
          type: String,
          default: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة"
        }
      },
      facebook: {
        enabled: {
          type: Boolean,
          default: true
        }
      },
      telegram: {
        enabled: {
          type: Boolean,
          default: true
        },
        message: {
          type: String,
          default: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة"
        }
      }
    }
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
ContactSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ContactSettings', ContactSettingsSchema);
