const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const fixMainImage = async () => {
  try {
    console.log('🔍 البحث عن النماذج التي تحتاج إصلاح الصورة الرئيسية...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    for (const apartment of apartments) {
      console.log(`\n🏠 النموذج: ${apartment.modelName}`);
      console.log(`📸 الصورة الرئيسية الحالية: ${apartment.mainImage || 'غير محدد'}`);
      console.log(`🖼️ عدد الصور: ${apartment.images.length}`);
      
      let updated = false;
      
      // إذا كانت الصورة الرئيسية محلية أو غير موجودة
      if (!apartment.mainImage || apartment.mainImage.startsWith('/')) {
        if (apartment.images && apartment.images.length > 0) {
          // استخدم أول صورة من مصفوفة الصور
          apartment.mainImage = apartment.images[0];
          updated = true;
          console.log(`✅ تم تعيين الصورة الرئيسية: ${apartment.mainImage}`);
        } else {
          console.log('⚠️ لا توجد صور متاحة لتعيينها كصورة رئيسية');
        }
      } else if (apartment.mainImage.startsWith('http') && apartment.mainImage.includes('cloudinary.com')) {
        console.log('✅ الصورة الرئيسية صحيحة (Cloudinary)');
      }
      
      // حفظ التحديثات
      if (updated) {
        await apartment.save();
        console.log(`💾 تم حفظ التحديثات للنموذج: ${apartment.modelName}`);
      }
    }
    
    console.log('\n🎉 تم إصلاح جميع الصور الرئيسية بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح الصور الرئيسية:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
fixMainImage();
