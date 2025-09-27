const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkData = async () => {
  try {
    console.log('🔍 فحص البيانات الحالية...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    apartments.forEach(apt => {
      console.log(`\n🏠 النموذج: ${apt.modelName}`);
      console.log(`📸 الصور: ${JSON.stringify(apt.images, null, 2)}`);
      
      // التحقق من وجود روابط محلية
      const hasLocalUrls = apt.images.some(img => img.startsWith('/'));
      if (hasLocalUrls) {
        console.log('⚠️ يحتوي على روابط محلية!');
      } else {
        console.log('✅ جميع الروابط من Cloudinary');
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
checkData();
