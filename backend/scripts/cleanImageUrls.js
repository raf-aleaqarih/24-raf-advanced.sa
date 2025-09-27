const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cleanImageUrls = async () => {
  try {
    console.log('🔍 تنظيف روابط الصور من المسافات...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    for (const apartment of apartments) {
      console.log(`\n🏠 النموذج: ${apartment.modelName}`);
      
      let hasChanges = false;
      
      // تنظيف مصفوفة الصور
      if (apartment.images && Array.isArray(apartment.images)) {
        const originalImages = [...apartment.images];
        apartment.images = apartment.images.map(img => {
          if (typeof img === 'string') {
            const trimmed = img.trim();
            if (trimmed !== img) {
              console.log(`   🧹 تنظيف صورة: "${img}" -> "${trimmed}"`);
              hasChanges = true;
            }
            return trimmed;
          }
          return img;
        });
      }
      
      // تنظيف الصورة الرئيسية
      if (apartment.mainImage && typeof apartment.mainImage === 'string') {
        const originalMainImage = apartment.mainImage;
        apartment.mainImage = apartment.mainImage.trim();
        if (apartment.mainImage !== originalMainImage) {
          console.log(`   🧹 تنظيف الصورة الرئيسية: "${originalMainImage}" -> "${apartment.mainImage}"`);
          hasChanges = true;
        }
      }
      
      // حفظ التغييرات إذا كانت موجودة
      if (hasChanges) {
        await apartment.save();
        console.log(`   💾 تم حفظ التحديثات للنموذج: ${apartment.modelName}`);
      } else {
        console.log(`   ✅ لا توجد مسافات في روابط الصور للنموذج: ${apartment.modelName}`);
      }
    }
    
    console.log('\n🎉 تم تنظيف جميع روابط الصور بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف روابط الصور:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
cleanImageUrls();
