const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');
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

// بيانات النماذج التجريبية
const apartmentsData = [
  {
    modelName: 'A',
    modelTitle: 'نموذج A',
    modelSubtitle: 'على شارع جنوبي شرقي',
    price: 830000,
    area: 156,
    roofArea: 156,
    rooms: 4,
    bathrooms: 4,
    location: 'قريب من المطار',
    direction: 'جنوبي شرقي',
    images: ['/a.jpg'],
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
    ],
    status: 'active'
  },
  {
    modelName: 'B',
    modelTitle: 'نموذج B',
    modelSubtitle: 'خلفية شرقي شمالي غربي',
    price: 930000,
    area: 190,
    roofArea: 190,
    rooms: 5,
    bathrooms: 4,
    location: 'قريب من المطار',
    direction: 'شرقي شمالي غربي',
    images: ['/b.jpg'],
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
    ],
    status: 'active'
  },
  {
    modelName: 'C',
    modelTitle: 'نموذج C',
    modelSubtitle: 'واجهة جنوبية غربية',
    price: 830000,
    area: 156,
    roofArea: 0,
    rooms: 4,
    bathrooms: 4,
    location: 'قريب من المطار',
    direction: 'جنوبية غربية',
    images: ['/c.jpg'],
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
    ],
    status: 'active'
  },
  {
    modelName: 'D',
    modelTitle: 'نموذج D',
    modelSubtitle: 'ملحق شرقي شمالي',
    price: 1350000,
    area: 180,
    roofArea: 40,
    rooms: 5,
    bathrooms: 5,
    location: 'قريب من المطار',
    direction: 'شرقي شمالي',
    images: ['/a.jpg'],
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
    status: 'active'
  }
];

// دالة لإضافة النماذج
const seedApartments = async () => {
  try {
    // حذف النماذج الموجودة
    await ApartmentModel.deleteMany({});
    console.log('تم حذف النماذج الموجودة');

    // إضافة النماذج الجديدة
    const apartments = await ApartmentModel.insertMany(apartmentsData);
    console.log(`تم إضافة ${apartments.length} نموذج شقة بنجاح`);

    // عرض النماذج المضافة
    apartments.forEach(apartment => {
      console.log(`- ${apartment.modelName}: ${apartment.modelTitle} (${apartment.price.toLocaleString()} ريال)`);
    });

  } catch (error) {
    console.error('خطأ في إضافة النماذج:', error);
  }
};

// تشغيل السكريبت
const run = async () => {
  await connectDB();
  await seedApartments();
  await mongoose.connection.close();
  console.log('تم إغلاق الاتصال بقاعدة البيانات');
  process.exit(0);
};

run();
