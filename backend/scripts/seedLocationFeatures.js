const mongoose = require('mongoose');
const LocationFeature = require('../models/LocationFeature');
require('dotenv').config();

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jeddah-real-estate');
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

// بيانات مميزات الموقع التجريبية
const locationFeaturesData = [
  // قريب من
  {
    title: 'الشوارع الرئيسية',
    description: 'قريب من الطرق الرئيسية',
    icon: 'MapPin',
    category: 'nearby',
    distance: '2 دقيقة',
    status: 'active',
    isVisible: true,
    displayOrder: 1
  },
  {
    title: 'مسجد قريب',
    description: 'مسجد في الحي',
    icon: 'Building2',
    category: 'nearby',
    distance: '3 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 2
  },
  {
    title: 'الخدمات',
    description: 'جميع الخدمات الأساسية',
    icon: 'StoreIcon',
    category: 'nearby',
    distance: '5 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 3
  },
  {
    title: 'المراكز التجارية',
    description: 'مراكز تسوق كبرى',
    icon: 'Building2',
    category: 'nearby',
    distance: '10 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 4
  },
  {
    title: 'المطار',
    description: 'مطار الملك عبدالعزيز',
    icon: 'Plane',
    category: 'nearby',
    distance: '15 دقيقة',
    status: 'active',
    isVisible: true,
    displayOrder: 5
  },
  
  // دقائق من
  {
    title: 'طريق الأمير سلطان',
    description: 'الطريق الرئيسي',
    icon: 'MapPin',
    category: 'minutesFrom',
    distance: '5 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 1
  },
  {
    title: 'شارع حراء',
    description: 'شارع تجاري مهم',
    icon: 'MapPin',
    category: 'minutesFrom',
    distance: '8 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 2
  },
  
  // المواصلات
  {
    title: 'محطة حافلات',
    description: 'مواصلات عامة',
    icon: 'Car',
    category: 'transport',
    distance: '3 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 1
  },
  {
    title: 'محطة تاكسي',
    description: 'خدمات النقل',
    icon: 'Car',
    category: 'transport',
    distance: '2 دقيقة',
    status: 'active',
    isVisible: true,
    displayOrder: 2
  },
  
  // الخدمات
  {
    title: 'مستشفى',
    description: 'خدمات طبية',
    icon: 'Shield',
    category: 'services',
    distance: '10 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 1
  },
  {
    title: 'مدرسة',
    description: 'مدارس حكومية وخاصة',
    icon: 'Home',
    category: 'services',
    distance: '5 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 2
  },
  
  // الترفيه
  {
    title: 'الحدائق العامة',
    description: 'حدائق ومتنزهات عائلية',
    icon: 'Star',
    category: 'entertainment',
    distance: '5 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 1
  },
  {
    title: 'النادي الرياضي',
    description: 'مرافق رياضية',
    icon: 'Star',
    category: 'entertainment',
    distance: '8 دقائق',
    status: 'active',
    isVisible: true,
    displayOrder: 2
  }
];

// دالة لإضافة مميزات الموقع
const seedLocationFeatures = async () => {
  try {
    // حذف المميزات الموجودة
    await LocationFeature.deleteMany({});
    console.log('تم حذف مميزات الموقع الموجودة');

    // إضافة المميزات الجديدة
    const features = await LocationFeature.insertMany(locationFeaturesData);
    console.log(`تم إضافة ${features.length} ميزة موقع بنجاح`);

    // عرض المميزات المضافة
    const groupedFeatures = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {});

    Object.keys(groupedFeatures).forEach(category => {
      console.log(`\n${category}:`);
      groupedFeatures[category].forEach(feature => {
        console.log(`- ${feature.title} (${feature.distance})`);
      });
    });

  } catch (error) {
    console.error('خطأ في إضافة مميزات الموقع:', error);
  }
};

// تشغيل السكريبت
const run = async () => {
  await connectDB();
  await seedLocationFeatures();
  await mongoose.connection.close();
  console.log('\nتم إغلاق الاتصال بقاعدة البيانات');
  process.exit(0);
};

run();