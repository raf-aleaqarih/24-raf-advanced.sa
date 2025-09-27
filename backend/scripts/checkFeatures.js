const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkFeatures = async () => {
  try {
    console.log('🔍 فحص المميزات في قاعدة البيانات...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    apartments.forEach(apt => {
      console.log(`\n🏠 النموذج: ${apt.modelName}`);
      console.log(`📋 المميزات (${apt.features.length}):`);
      apt.features.forEach((feature, index) => {
        console.log(`  ${index + 1}. "${feature}"`);
      });
    });
    
  } catch (error) {
    console.error('❌ خطأ في فحص المميزات:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
checkFeatures();
