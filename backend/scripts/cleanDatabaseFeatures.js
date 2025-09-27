const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// دالة لتنظيف المميزات من العلامات والأقواس
const cleanFeatures = (features) => {
  return features.map(feature => {
    // إزالة العلامات والأقواس المختلفة
    return feature
      .replace(/[\[\](){}]/g, '') // إزالة الأقواس
      .replace(/[\/\\]/g, '') // إزالة الشرطات
      .replace(/[|]/g, '') // إزالة الخطوط العمودية
      .replace(/[<>]/g, '') // إزالة علامات أكبر/أصغر
      .replace(/[!@#$%^&*+=]/g, '') // إزالة الرموز الخاصة
      .trim() // إزالة المسافات الزائدة
      .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
  }).filter(feature => feature.length > 0) // إزالة المميزات الفارغة
}

const cleanDatabaseFeatures = async () => {
  try {
    console.log('🔍 البحث عن النماذج التي تحتاج تنظيف المميزات...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    for (const apartment of apartments) {
      console.log(`\n🏠 النموذج: ${apartment.modelName}`);
      console.log(`📋 المميزات الأصلية (${apartment.features.length}):`);
      apartment.features.forEach((feature, index) => {
        console.log(`  ${index + 1}. "${feature}"`);
      });
      
      // تنظيف المميزات
      const originalFeatures = [...apartment.features];
      const cleanedFeatures = cleanFeatures(apartment.features);
      
      console.log(`\n✨ المميزات بعد التنظيف (${cleanedFeatures.length}):`);
      cleanedFeatures.forEach((feature, index) => {
        console.log(`  ${index + 1}. "${feature}"`);
      });
      
      // التحقق من وجود تغييرات
      const hasChanges = originalFeatures.length !== cleanedFeatures.length || 
                        originalFeatures.some((feature, index) => feature !== cleanedFeatures[index]);
      
      if (hasChanges) {
        apartment.features = cleanedFeatures;
        await apartment.save();
        console.log(`💾 تم حفظ التحديثات للنموذج: ${apartment.modelName}`);
      } else {
        console.log(`✅ لا توجد تغييرات مطلوبة للنموذج: ${apartment.modelName}`);
      }
    }
    
    console.log('\n🎉 تم تنظيف جميع المميزات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف المميزات:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
cleanDatabaseFeatures();
