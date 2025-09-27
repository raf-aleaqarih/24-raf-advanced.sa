const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createTestData = async () => {
  try {
    console.log('🗑️ حذف البيانات الموجودة...');
    await ApartmentModel.deleteMany({});
    
    console.log('📝 إنشاء بيانات تجريبية...');
    
    const testApartments = [
      {
        modelName: "A",
        modelTitle: "نموذج A",
        modelSubtitle: "على شارع جنوبي شرقي",
        price: 830000,
        area: 156,
        rooms: 4,
        bathrooms: 4,
        location: "قريب من المطار",
        direction: "جنوبي شرقي",
        images: [
          "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/a.jpg",
          "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/1.jpg"
        ],
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
        status: "active"
      },
      {
        modelName: "B",
        modelTitle: "نموذج B",
        modelSubtitle: "خلفية شرقي شمالي غربي",
        price: 930000,
        area: 190,
        rooms: 5,
        bathrooms: 4,
        location: "حي الزهراء",
        direction: "شرقي شمالي غربي",
        images: [
          "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/b.jpg",
          "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/2.jpg"
        ],
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
        status: "active"
      },
      {
        modelName: "C",
        modelTitle: "نموذج C",
        modelSubtitle: "واجهة جنوبية غربية",
        price: 750000,
        area: 140,
        rooms: 3,
        bathrooms: 3,
        location: "حي الروضة",
        direction: "جنوبية غربية",
        images: [
          "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/c.jpg",
          "https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/3.jpg"
        ],
        features: [
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
        status: "active"
      }
    ];

    // إنشاء النماذج
    for (const apartmentData of testApartments) {
      const apartment = new ApartmentModel(apartmentData);
      await apartment.save();
      console.log(`✅ تم إنشاء النموذج: ${apartment.modelName}`);
    }

    console.log('🎉 تم إنشاء البيانات التجريبية بنجاح!');
    
    // عرض البيانات المنشأة
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
createTestData();
