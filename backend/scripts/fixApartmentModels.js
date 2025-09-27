require('dotenv').config();
const mongoose = require('mongoose');

// Models
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

// حذف جميع نماذج الشقق الموجودة
const clearApartmentModels = async () => {
  try {
    await ApartmentModel.deleteMany({});
    console.log('✅ تم حذف نماذج الشقق الموجودة');
  } catch (error) {
    console.error('❌ خطأ في حذف نماذج الشقق:', error);
  }
};

// إنشاء نماذج الشقق الجديدة
const createApartmentModels = async () => {
  try {
    const apartmentModels = [
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

    for (const modelData of apartmentModels) {
      const model = new ApartmentModel(modelData);
      await model.save();
    }
    console.log('✅ تم إنشاء نماذج الشقق (4 نماذج)');
  } catch (error) {
    console.error('❌ خطأ في إنشاء نماذج الشقق:', error);
  }
};

// تشغيل السكريبت
const runFix = async () => {
  console.log('🔧 إصلاح نماذج الشقق...\n');
  
  await connectDB();
  
  console.log('🧹 حذف نماذج الشقق الموجودة...');
  await clearApartmentModels();
  
  console.log('\n📝 إنشاء نماذج الشقق الجديدة...');
  await createApartmentModels();
  
  console.log('\n✅ تم إصلاح نماذج الشقق بنجاح!');
  
  process.exit(0);
};

// التعامل مع الأخطاء
process.on('uncaughtException', (error) => {
  console.error('❌ خطأ غير متوقع:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ خطأ في Promise:', error);
  process.exit(1);
});

// تشغيل السكريبت
runFix();
