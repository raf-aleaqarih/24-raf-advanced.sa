const mongoose = require('mongoose');
const ProjectMedia = require('../models/ProjectMedia');
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

// بيانات الوسائط التجريبية
const mediaData = [
  {
    title: 'صورة المشروع الرئيسية',
    description: 'منظر عام للمشروع من الخارج',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: '/1.jpg',
      originalName: 'project-main.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 1920,
        height: 1080
      }
    },
    alt: 'صورة المشروع الرئيسية',
    tags: ['مشروع', 'خارجي', 'رئيسي'],
    order: 1,
    isActive: true
  },
  {
    title: 'الواجهة الخارجية',
    description: 'تصميم الواجهة الأمامية',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: '/2.jpg',
      originalName: 'project-facade.jpg',
      fileSize: 950000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 1920,
        height: 1080
      }
    },
    alt: 'الواجهة الخارجية',
    tags: ['واجهة', 'تصميم', 'خارجي'],
    order: 2,
    isActive: true
  },
  {
    title: 'الحدائق والمناطق الخضراء',
    description: 'المناطق الخضراء والحدائق',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: '/3.jpg',
      originalName: 'project-gardens.jpg',
      fileSize: 1100000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 1920,
        height: 1080
      }
    },
    alt: 'الحدائق والمناطق الخضراء',
    tags: ['حدائق', 'خضراء', 'طبيعة'],
    order: 3,
    isActive: true
  },
  {
    title: 'المدخل الرئيسي',
    description: 'تصميم المدخل الرئيسي للمشروع',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: '/4.jpg',
      originalName: 'project-entrance.jpg',
      fileSize: 980000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 1920,
        height: 1080
      }
    },
    alt: 'المدخل الرئيسي',
    tags: ['مدخل', 'رئيسي', 'تصميم'],
    order: 4,
    isActive: true
  },
  {
    title: 'المواقف',
    description: 'مواقف السيارات المخصصة',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: '/5.jpg',
      originalName: 'project-parking.jpg',
      fileSize: 920000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 1920,
        height: 1080
      }
    },
    alt: 'مواقف السيارات',
    tags: ['مواقف', 'سيارات', 'خدمات'],
    order: 5,
    isActive: true
  }
];

// دالة لإضافة الوسائط
const seedProjectMedia = async () => {
  try {
    // حذف الوسائط الموجودة
    await ProjectMedia.deleteMany({});
    console.log('تم حذف الوسائط الموجودة');

    // إضافة الوسائط الجديدة
    const media = await ProjectMedia.insertMany(mediaData);
    console.log(`تم إضافة ${media.length} وسيط بنجاح`);

    // عرض الوسائط المضافة
    media.forEach(item => {
      console.log(`- ${item.title} (${item.category})`);
    });

  } catch (error) {
    console.error('خطأ في إضافة الوسائط:', error);
  }
};

// تشغيل السكريبت
const run = async () => {
  await connectDB();
  await seedProjectMedia();
  await mongoose.connection.close();
  console.log('\nتم إغلاق الاتصال بقاعدة البيانات');
  process.exit(0);
};

run();
