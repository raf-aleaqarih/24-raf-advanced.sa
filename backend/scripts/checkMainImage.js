const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkMainImage = async () => {
  try {
    console.log('🔍 فحص الصور الرئيسية...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    apartments.forEach(apt => {
      console.log(`\n🏠 النموذج: ${apt.modelName}`);
      console.log(`📸 الصورة الرئيسية: ${apt.mainImage || 'غير محدد'}`);
      console.log(`🖼️ عدد الصور: ${apt.images.length}`);
      
      // التحقق من الصورة الرئيسية
      if (apt.mainImage) {
        if (apt.mainImage.startsWith('http') && apt.mainImage.includes('cloudinary.com')) {
          console.log('✅ الصورة الرئيسية من Cloudinary');
        } else if (apt.mainImage.startsWith('/')) {
          console.log('⚠️ الصورة الرئيسية محلية!');
        } else {
          console.log('❓ نوع الصورة الرئيسية غير معروف');
        }
      } else {
        console.log('⚠️ لا توجد صورة رئيسية');
      }
      
      // التحقق من وجود روابط محلية في الصور
      const hasLocalUrls = apt.images.some(img => img.startsWith('/'));
      if (hasLocalUrls) {
        console.log('⚠️ يحتوي على روابط محلية في الصور!');
      } else {
        console.log('✅ جميع الصور من Cloudinary');
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في فحص الصور الرئيسية:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
checkMainImage();
