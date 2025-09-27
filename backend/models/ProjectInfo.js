const mongoose = require('mongoose');

const ProjectInfoSchema = new mongoose.Schema({
  // معلومات المشروع الأساسية
  projectName: {
    type: String,
    required: true,
    default: "مشروع سكني متميز في حي الزهراء بجدة"
  },
  
  projectTitle: {
    type: String,
    required: true,
    default: "مشروع سكني متميز في حي الزهراء بجدة"
  },
  
  projectSubtitle: {
    type: String,
    required: true,
    default: "بأسعار تبدأ من 830,000 ريال"
  },
  
  projectDescription: {
    type: String,
    required: true,
    default: "امتلك منزل أحلامك في أفضل مواقع جدة"
  },
  
  // الموقع
  location: {
    district: {
      type: String,
      required: true,
      default: "حي الزهراء"
    },
    city: {
      type: String,
      required: true,
      default: "جدة"
    },
    country: {
      type: String,
      required: true,
      default: "المملكة العربية السعودية"
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        default: 21.60813558568744
      },
      longitude: {
        type: Number,
        required: true,
        default: 39.14033718505742
      }
    },
    address: {
      type: String,
      required: true,
      default: "حي الزهراء، جدة، المملكة العربية السعودية"
    },
    googleMapsUrl: {
      type: String,
      default: ""
    },
    mapEmbedUrl: {
      type: String,
      default: ""
    },
    mapSettings: {
      zoom: {
        type: Number,
        default: 15
      },
      mapType: {
        type: String,
        enum: ['roadmap', 'satellite', 'hybrid', 'terrain'],
        default: 'roadmap'
      }
    },
    nearbyLandmarks: [{
      name: String,
      distance: String
    }]
  },
  
  // السعر
  startingPrice: {
    type: Number,
    required: true,
    default: 830000
  },
  
  currency: {
    type: String,
    required: true,
    default: "ريال"
  },
  
  // الصور
  backgroundImage: {
    type: String,
    required: true,
    default: "/1.jpg"
  },
  
  projectImages: [{
    type: String,
    default: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"]
  }],
  
  // الفيديو
  projectVideo: {
    title: {
      type: String,
      default: "امتلك شقتك الآن في مدينة جدة - حي الزهراء"
    },
    youtubeId: {
      type: String,
      default: "l9cH8RJQnYg"
    },
    thumbnail: {
      type: String,
      default: "/1.jpg"
    }
  },
  
  // مميزات المشروع
  projectFeatures: [{
    title: String,
    icon: String,
    description: String
  }],
  
  // مميزات الموقع
  locationFeatures: {
    nearby: [{
      name: String,
      icon: String
    }],
    minutesFrom: [{
      name: String,
      icon: String
    }]
  },
  
  // الضمانات
  warranties: [{
    years: Number,
    description: String
  }],
  
  // إعدادات التواصل
  contactSettings: {
    phoneNumbers: {
      meta: String,
      snapchat: String,
      tiktok: String,
      google: String,
      default: String
    },
    welcomeMessages: {
      snapchat: String,
      tiktok: String,
      meta: String,
      google: String,
      facebook: String
    }
  },
  
  // إعدادات المنصة
  platformSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    trackingEnabled: {
      type: Boolean,
      default: true
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
ProjectInfoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProjectInfo', ProjectInfoSchema);