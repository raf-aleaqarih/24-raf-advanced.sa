const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cleanLocalImages = async () => {
  try {
    console.log('🔍 البحث عن النماذج التي تحتوي على روابط محلية...');
    
    // البحث عن النماذج التي تحتوي على روابط محلية
    const apartments = await ApartmentModel.find({
      $or: [
        { 'images': { $regex: /^\/[^\/]/ } },
        { 'mainImage': { $regex: /^\/[^\/]/ } }
      ]
    });

    console.log(`📊 تم العثور على ${apartments.length} نموذج يحتوي على روابط محلية`);

    if (apartments.length === 0) {
      console.log('✅ لا توجد نماذج تحتوي على روابط محلية');
      return;
    }

    // حذف النماذج التي تحتوي على روابط محلية
    for (const apartment of apartments) {
      console.log(`🗑️ حذف النموذج: ${apartment.modelName} (يحتوي على روابط محلية)`);
      await ApartmentModel.findByIdAndDelete(apartment._id);
    }

    console.log('🎉 تم تنظيف جميع النماذج التي تحتوي على روابط محلية!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف الروابط المحلية:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
cleanLocalImages();
