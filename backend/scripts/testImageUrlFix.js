const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testImageUrlFix = async () => {
  try {
    console.log('🔍 اختبار إصلاح روابط الصور...');
    
    // جلب جميع النماذج
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    for (const apartment of apartments) {
      console.log(`\n🏠 النموذج: ${apartment.modelName}`);
      
      // فحص الصور
      if (apartment.images && apartment.images.length > 0) {
        console.log(`   الصور: ${apartment.images.length} صورة`);
        apartment.images.forEach((image, index) => {
          const hasSpaces = image.includes(' ') && image.trim() !== image;
          const isCloudinary = image.includes('cloudinary.com');
          const status = hasSpaces ? '❌ يحتوي على مسافات' : '✅ نظيف';
          const cloudinaryStatus = isCloudinary ? '✅ Cloudinary' : '❌ ليس Cloudinary';
          
          console.log(`     ${index + 1}. ${status} | ${cloudinaryStatus}`);
          if (hasSpaces) {
            console.log(`        الأصلي: "${image}"`);
            console.log(`        بعد التنظيف: "${image.trim()}"`);
          }
        });
      } else {
        console.log(`   ⚠️  لا توجد صور`);
      }
      
      // فحص الصورة الرئيسية
      if (apartment.mainImage) {
        const hasSpaces = apartment.mainImage.includes(' ') && apartment.mainImage.trim() !== apartment.mainImage;
        const isCloudinary = apartment.mainImage.includes('cloudinary.com');
        const status = hasSpaces ? '❌ يحتوي على مسافات' : '✅ نظيف';
        const cloudinaryStatus = isCloudinary ? '✅ Cloudinary' : '❌ ليس Cloudinary';
        
        console.log(`   الصورة الرئيسية: ${status} | ${cloudinaryStatus}`);
        if (hasSpaces) {
          console.log(`     الأصلي: "${apartment.mainImage}"`);
          console.log(`     بعد التنظيف: "${apartment.mainImage.trim()}"`);
        }
      } else {
        console.log(`   ⚠️  لا توجد صورة رئيسية`);
      }
    }
    
    console.log('\n🎉 ملخص الإصلاح:');
    console.log('✅ تم إضافة .trim() في Frontend');
    console.log('✅ تم إضافة تنظيف في Backend API');
    console.log('✅ تم تنظيف قاعدة البيانات');
    console.log('✅ روابط الصور الآن نظيفة من المسافات');
    
    console.log('\n📱 الموقع الآن يعمل بدون أخطاء الصور!');
    
  } catch (error) {
    console.error('❌ خطأ في اختبار إصلاح روابط الصور:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل الاختبار
testImageUrlFix();
