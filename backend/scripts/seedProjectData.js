const mongoose = require('mongoose');
const ProjectInfo = require('../models/ProjectInfo');
const ApartmentModel = require('../models/ApartmentModel');
const ProjectFeature = require('../models/ProjectFeature');
const ProjectWarranty = require('../models/ProjectWarranty');
const ProjectMedia = require('../models/ProjectMedia');
const ContactSettings = require('../models/ContactSettings');

// بيانات المشروع الأساسية
const projectInfoData = {
  projectName: "مشروع سكني متميز في حي الزهراء بجدة",
  projectTitle: "مشروع سكني متميز في حي الزهراء بجدة",
  projectSubtitle: "بأسعار تبدأ من 830,000 ريال",
  projectDescription: "امتلك منزل أحلامك في أفضل مواقع جدة",
  location: {
    district: "حي الزهراء",
    city: "جدة",
    country: "المملكة العربية السعودية",
    coordinates: {
      latitude: 21.60813558568744,
      longitude: 39.14033718505742
    },
    nearbyLandmarks: [
      { name: "طريق الأمير سلطان", distance: "دقائق" },
      { name: "شارع حراء", distance: "دقائق" },
      { name: "شارع فهد بن زعير", distance: "دقائق" }
    ]
  },
  startingPrice: 830000,
  currency: "ريال",
  backgroundImage: "/1.jpg",
  projectImages: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"],
  projectVideo: {
    title: "امتلك شقتك الآن في مدينة جدة - حي الزهراء",
    youtubeId: "l9cH8RJQnYg",
    thumbnail: "/1.jpg"
  },
  projectFeatures: [
    {
      title: "موقع إستراتيجي قريب من الواجهة البحرية",
      icon: "MapPin",
      description: "موقع مميز قريب من الواجهة البحرية"
    },
    {
      title: "قريب من جميع الخدمات",
      icon: "Building2",
      description: "قريب من جميع الخدمات والمرافق"
    },
    {
      title: "ضمانات تصل إلى 25 سنة",
      icon: "Shield",
      description: "ضمانات شاملة تصل إلى 25 سنة"
    },
    {
      title: "مساحات تصل إلى 220م²",
      icon: "Home",
      description: "مساحات واسعة تصل إلى 220 متر مربع"
    },
    {
      title: "مواقف سيارات مخصصة",
      icon: "Car",
      description: "مواقف سيارات مخصصة لكل وحدة"
    },
    {
      title: "سمارت هوم",
      icon: "Wifi",
      description: "نظام سمارت هوم متطور"
    }
  ],
  locationFeatures: {
    nearby: [
      { name: "الشوارع الرئيسية", icon: "road" },
      { name: "مسجد قريب", icon: "mosque" },
      { name: "الخدمات", icon: "StoreIcon" },
      { name: "المراكز التجارية", icon: "Building2" },
      { name: "المطار", icon: "Plane" }
    ],
    minutesFrom: [
      { name: "طريق الأمير سلطان", icon: "road" },
      { name: "شارع حراء", icon: "road" }
    ]
  },
  warranties: [
    { years: 20, description: "القواطع والأفياش" },
    { years: 20, description: "الهيكل الإنشائي" },
    { years: 5, description: "المصاعد" },
    { years: 2, description: "أعمال السباكة والكهرباء" },
    { years: 2, description: "سمارت هوم" },
    { years: 1, description: "اتحاد ملاك" }
  ],
  contactSettings: {
    phoneNumbers: {
      meta: "0555812257",
      snapchat: "0543766262",
      tiktok: "0539488805",
      google: "0552845403",
      default: "0536667967"
    },
    welcomeMessages: {
      snapchat: "السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع",
      tiktok: "مرحباً ، السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع",
      meta: "مرحباً، أرغب بالاستفسار عن المشروع",
      google: "السلام عليكم ورحمة الله وبركاته، ارغب بالاستفسار عن المشروع",
      facebook: "السلام عليكم ورحمة الله وبركاته 🌟\nأرغب بالاستفسار عن مشروع 24 - حي الزهراء في جدة"
    }
  },
  platformSettings: {
    enabled: true,
    trackingEnabled: true
  }
};

// بيانات نماذج الشقق
const apartmentModelsData = [
  {
    modelName: "A",
    modelTitle: "نموذج A",
    modelSubtitle: "على شارع جنوبي شرقي",
    price: 830000,
    currency: "ريال",
    area: 156,
    roofArea: 156,
    totalArea: 156,
    rooms: 4,
    bathrooms: 4,
    floor: 1,
    location: "قريب من المطار",
    direction: "جنوبي شرقي",
    description: "هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية",
    images: ["/a.jpg"],
    mainImage: "/a.jpg",
    features: [
      "غرفة خادمة",
      "غرفة سائق",
      "شقق مودرن",
      "أسقف مرتفعة",
      "نوافذ كبيرة",
      "صالة",
      "مطبخ",
      "بلكونة",
      "سمارت هوم",
      "موقف خاص",
      "مصعد",
      "كاميرات مراقبة"
    ],
    status: "active",
    displayOrder: 1,
    isVisible: true
  },
  {
    modelName: "B",
    modelTitle: "نموذج B",
    modelSubtitle: "خلفية شرقي شمالي غربي",
    price: 930000,
    currency: "ريال",
    area: 190,
    roofArea: 190,
    totalArea: 190,
    rooms: 5,
    bathrooms: 4,
    floor: 1,
    location: "قريب من المطار",
    direction: "شرقي شمالي غربي",
    description: "هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية",
    images: ["/b.jpg"],
    mainImage: "/b.jpg",
    features: [
      "غرفة خادمة",
      "غرفة سائق",
      "شقق مودرن",
      "أسقف مرتفعة",
      "نوافذ كبيرة",
      "صالة",
      "مطبخ",
      "بلكونة",
      "سمارت هوم",
      "موقف خاص",
      "مصعد",
      "كاميرات مراقبة"
    ],
    status: "active",
    displayOrder: 2,
    isVisible: true
  },
  {
    modelName: "C",
    modelTitle: "نموذج C",
    modelSubtitle: "واجهة جنوبية غربية",
    price: 830000,
    currency: "ريال",
    area: 156,
    roofArea: 0,
    totalArea: 156,
    rooms: 4,
    bathrooms: 4,
    floor: 1,
    location: "قريب من المطار",
    direction: "جنوبية غربية",
    description: "هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية",
    images: ["/c.jpg"],
    mainImage: "/c.jpg",
    features: [
      "غرفة خادمة",
      "غرفة سائق",
      "شقق مودرن",
      "أسقف مرتفعة",
      "نوافذ كبيرة",
      "صالة",
      "مطبخ",
      "بلكونة",
      "سمارت هوم",
      "موقف خاص",
      "مصعد",
      "كاميرات مراقبة"
    ],
    status: "active",
    displayOrder: 3,
    isVisible: true
  },
  {
    modelName: "D",
    modelTitle: "نموذج D",
    modelSubtitle: "ملحق شرقي شمالي",
    price: 1350000,
    currency: "ريال",
    area: 180,
    roofArea: 40,
    totalArea: 220,
    areaDetails: "مساحة المباني ١٨٠ متر ومساحة السطح ٤٠ متر",
    rooms: 5,
    bathrooms: 5,
    floor: 1,
    location: "قريب من المطار",
    direction: "شرقي شمالي",
    description: "هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية",
    images: ["/a.jpg"],
    mainImage: "/a.jpg",
    features: [
      "غرفة خادمة",
      "غرفة سائق",
      "شقق مودرن",
      "أسقف مرتفعة",
      "نوافذ كبيرة",
      "صالة",
      "مطبخ",
      "بلكونة",
      "سمارت هوم",
      "موقف خاص",
      "مصعد",
      "كاميرات مراقبة",
      "اجمالي المساحه 220 متر"
    ],
    status: "active",
    displayOrder: 4,
    isVisible: true
  }
];

// بيانات مميزات المشروع
const projectFeaturesData = [
  {
    title: "موقع إستراتيجي قريب من الواجهة البحرية",
    description: "موقع مميز قريب من الواجهة البحرية",
    icon: "MapPin",
    featureType: "project",
    category: "location",
    displayOrder: 1,
    status: "active",
    isVisible: true
  },
  {
    title: "قريب من جميع الخدمات",
    description: "قريب من جميع الخدمات والمرافق",
    icon: "Building2",
    featureType: "project",
    category: "services",
    displayOrder: 2,
    status: "active",
    isVisible: true
  },
  {
    title: "ضمانات تصل إلى 25 سنة",
    description: "ضمانات شاملة تصل إلى 25 سنة",
    icon: "Shield",
    featureType: "project",
    category: "warranty",
    displayOrder: 3,
    status: "active",
    isVisible: true
  },
  {
    title: "مساحات تصل إلى 220م²",
    description: "مساحات واسعة تصل إلى 220 متر مربع",
    icon: "Home",
    featureType: "project",
    category: "space",
    displayOrder: 4,
    status: "active",
    isVisible: true
  },
  {
    title: "مواقف سيارات مخصصة",
    description: "مواقف سيارات مخصصة لكل وحدة",
    icon: "Car",
    featureType: "project",
    category: "parking",
    displayOrder: 5,
    status: "active",
    isVisible: true
  },
  {
    title: "سمارت هوم",
    description: "نظام سمارت هوم متطور",
    icon: "Wifi",
    featureType: "project",
    category: "technology",
    displayOrder: 6,
    status: "active",
    isVisible: true
  }
];

// بيانات الضمانات
const warrantiesData = [
  {
    title: "القواطع والأفياش",
    description: "ضمان القواطع والأفياش",
    years: 20,
    warrantyType: "electrical",
    category: "electrical",
    displayOrder: 1,
    status: "active",
    isVisible: true
  },
  {
    title: "الهيكل الإنشائي",
    description: "ضمان الهيكل الإنشائي",
    years: 20,
    warrantyType: "structural",
    category: "structural",
    displayOrder: 2,
    status: "active",
    isVisible: true
  },
  {
    title: "المصاعد",
    description: "ضمان المصاعد",
    years: 5,
    warrantyType: "elevator",
    category: "elevator",
    displayOrder: 3,
    status: "active",
    isVisible: true
  },
  {
    title: "أعمال السباكة والكهرباء",
    description: "ضمان أعمال السباكة والكهرباء",
    years: 2,
    warrantyType: "plumbing",
    category: "plumbing",
    displayOrder: 4,
    status: "active",
    isVisible: true
  },
  {
    title: "سمارت هوم",
    description: "ضمان نظام سمارت هوم",
    years: 2,
    warrantyType: "smart_home",
    category: "technology",
    displayOrder: 5,
    status: "active",
    isVisible: true
  },
  {
    title: "اتحاد ملاك",
    description: "ضمان اتحاد ملاك",
    years: 1,
    warrantyType: "owners_association",
    category: "management",
    displayOrder: 6,
    status: "active",
    isVisible: true
  }
];

// بيانات الوسائط
const mediaData = [
  {
    fileName: "1.jpg",
    originalName: "project_image_1.jpg",
    filePath: "/1.jpg",
    fileUrl: "/1.jpg",
    fileType: "image",
    category: "project_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "صورة المشروع 1",
    description: "صورة خارجية للمشروع",
    altText: "صورة المشروع",
    displayOrder: 1,
    status: "active",
    isVisible: true
  },
  {
    fileName: "2.jpg",
    originalName: "project_image_2.jpg",
    filePath: "/2.jpg",
    fileUrl: "/2.jpg",
    fileType: "image",
    category: "project_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "صورة المشروع 2",
    description: "صورة خارجية للمشروع",
    altText: "صورة المشروع",
    displayOrder: 2,
    status: "active",
    isVisible: true
  },
  {
    fileName: "3.jpg",
    originalName: "project_image_3.jpg",
    filePath: "/3.jpg",
    fileUrl: "/3.jpg",
    fileType: "image",
    category: "project_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "صورة المشروع 3",
    description: "صورة خارجية للمشروع",
    altText: "صورة المشروع",
    displayOrder: 3,
    status: "active",
    isVisible: true
  },
  {
    fileName: "4.jpg",
    originalName: "project_image_4.jpg",
    filePath: "/4.jpg",
    fileUrl: "/4.jpg",
    fileType: "image",
    category: "project_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "صورة المشروع 4",
    description: "صورة خارجية للمشروع",
    altText: "صورة المشروع",
    displayOrder: 4,
    status: "active",
    isVisible: true
  },
  {
    fileName: "5.jpg",
    originalName: "project_image_5.jpg",
    filePath: "/5.jpg",
    fileUrl: "/5.jpg",
    fileType: "image",
    category: "project_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "صورة المشروع 5",
    description: "صورة خارجية للمشروع",
    altText: "صورة المشروع",
    displayOrder: 5,
    status: "active",
    isVisible: true
  },
  {
    fileName: "a.jpg",
    originalName: "apartment_model_a.jpg",
    filePath: "/a.jpg",
    fileUrl: "/a.jpg",
    fileType: "image",
    category: "apartment_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "نموذج A",
    description: "صورة نموذج A",
    altText: "نموذج A",
    displayOrder: 1,
    status: "active",
    isVisible: true
  },
  {
    fileName: "b.jpg",
    originalName: "apartment_model_b.jpg",
    filePath: "/b.jpg",
    fileUrl: "/b.jpg",
    fileType: "image",
    category: "apartment_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "نموذج B",
    description: "صورة نموذج B",
    altText: "نموذج B",
    displayOrder: 2,
    status: "active",
    isVisible: true
  },
  {
    fileName: "c.jpg",
    originalName: "apartment_model_c.jpg",
    filePath: "/c.jpg",
    fileUrl: "/c.jpg",
    fileType: "image",
    category: "apartment_image",
    fileSize: 1024000,
    dimensions: { width: 1920, height: 1080 },
    title: "نموذج C",
    description: "صورة نموذج C",
    altText: "نموذج C",
    displayOrder: 3,
    status: "active",
    isVisible: true
  }
];

// بيانات إعدادات التواصل
const contactSettingsData = {
  projectName: "مشروع 24 - حي الزهراء",
  phoneNumbers: {
    meta: "0555812257",
    snapchat: "0543766262",
    tiktok: "0539488805",
    google: "0552845403",
    default: "0536667967"
  },
  welcomeMessages: {
    snapchat: "السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع",
    tiktok: "مرحباً ، السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع",
    meta: "مرحباً، أرغب بالاستفسار عن المشروع",
    google: "السلام عليكم ورحمة الله وبركاته، ارغب بالاستفسار عن المشروع",
    facebook: "السلام عليكم ورحمة الله وبركاته 🌟\nأرغب بالاستفسار عن مشروع 24 - حي الزهراء في جدة"
  },
  emailSettings: {
    host: "smtp.hostinger.com",
    port: 465,
    secure: false,
    user: "24_project@raf-advanced.sa",
    password: "Yussefali@1234"
  },
  trackingSettings: {
    facebookPixel: {
      enabled: true,
      pixelId: ""
    },
    snapchatPixel: {
      enabled: true,
      pixelId: ""
    },
    tiktokPixel: {
      enabled: true,
      pixelId: ""
    },
    googleAnalytics: {
      enabled: true,
      trackingId: ""
    },
    googleTagManager: {
      enabled: true,
      containerId: ""
    }
  },
  formSettings: {
    inquiryForm: {
      enabled: true,
      fields: {
        name: {
          required: true,
          placeholder: "الاسم الكامل"
        },
        phone: {
          required: true,
          placeholder: "05XXXXXXXX",
          validation: "^05\\d{8}$"
        },
        message: {
          required: false,
          placeholder: "اكتب استفسارك هنا"
        }
      }
    }
  },
  sharingSettings: {
    enabled: true,
    platforms: {
      whatsapp: {
        enabled: true,
        message: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة\n\nاستفسر الآن عن مشروع 24 في حي الزهراء"
      },
      twitter: {
        enabled: true,
        message: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة"
      },
      facebook: {
        enabled: true
      },
      telegram: {
        enabled: true,
        message: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة"
      }
    }
  }
};

// دالة لملء البيانات
async function seedProjectData() {
  try {
    console.log('بدء ملء بيانات المشروع...');
    
    // مسح البيانات الموجودة
    await ProjectInfo.deleteMany({});
    await ApartmentModel.deleteMany({});
    await ProjectFeature.deleteMany({});
    await ProjectWarranty.deleteMany({});
    await ProjectMedia.deleteMany({});
    await ContactSettings.deleteMany({});
    
    console.log('تم مسح البيانات الموجودة');
    
    // إدراج بيانات المشروع
    const projectInfo = new ProjectInfo(projectInfoData);
    await projectInfo.save();
    console.log('تم إدراج بيانات المشروع');
    
    // إدراج نماذج الشقق
    for (const modelData of apartmentModelsData) {
      const model = new ApartmentModel(modelData);
      await model.save();
    }
    console.log('تم إدراج نماذج الشقق');
    
    // إدراج مميزات المشروع
    for (const featureData of projectFeaturesData) {
      const feature = new ProjectFeature(featureData);
      await feature.save();
    }
    console.log('تم إدراج مميزات المشروع');
    
    // إدراج الضمانات
    for (const warrantyData of warrantiesData) {
      const warranty = new ProjectWarranty(warrantyData);
      await warranty.save();
    }
    console.log('تم إدراج الضمانات');
    
    // إدراج الوسائط
    for (const mediaItem of mediaData) {
      const media = new ProjectMedia(mediaItem);
      await media.save();
    }
    console.log('تم إدراج الوسائط');
    
    // إدراج إعدادات التواصل
    const contactSettings = new ContactSettings(contactSettingsData);
    await contactSettings.save();
    console.log('تم إدراج إعدادات التواصل');
    
    console.log('تم ملء جميع البيانات بنجاح!');
    
  } catch (error) {
    console.error('خطأ في ملء البيانات:', error);
  }
}

module.exports = { seedProjectData };

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  const { connectDB } = require('../config/database');
  connectDB().then(() => {
    seedProjectData().then(() => {
      console.log('تم الانتهاء من ملء البيانات');
      process.exit(0);
    });
  });
}
