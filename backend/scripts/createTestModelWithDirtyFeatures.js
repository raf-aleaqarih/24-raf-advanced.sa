const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createTestModelWithDirtyFeatures = async () => {
  try {
    console.log('🗑️ حذف النموذج D إذا كان موجوداً...');
    await ApartmentModel.deleteOne({ modelName: 'D' });
    
    console.log('📝 إنشاء نموذج D مع مميزات تحتاج تنظيف...');
    
    const testApartment = {
      modelName: "D",
      modelTitle: "نموذج D",
      modelSubtitle: "ملحق شرقي شمالي",
      price: 1350000,
      area: 180,
      rooms: 5,
      bathrooms: 5,
      location: "حي الروضة",
      direction: "شرقي شمالي",
      images: [
        "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/d.jpg",
        "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/4.jpg"
      ],
      mainImage: "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/d.jpg",
      features: [
        "غرفة خادمة",
        "[غرفة سائق]",
        "(شقق مودرن)",
        "{أسقف مرتفعة}",
        "نوافذ/كبيرة",
        "صالة\\مطبخ",
        "بلكونة|سمارت هوم",
        "موقف<خاص>",
        "مصعد!كاميرات مراقبة",
        "  مساحة واسعة  ",
        "///ميزة خاصة///",
        "حديقة خلفية",
        "نظام أمان متطور"
      ],
      status: "active"
    };

    const apartment = new ApartmentModel(testApartment);
    await apartment.save();
    console.log(`✅ تم إنشاء النموذج: ${apartment.modelName}`);
    
    console.log('\n📋 المميزات التي تم إنشاؤها:');
    apartment.features.forEach((feature, index) => {
      console.log(`  ${index + 1}. "${feature}"`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء النموذج التجريبي:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
createTestModelWithDirtyFeatures();
