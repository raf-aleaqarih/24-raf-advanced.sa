const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// دالة لتنظيف المميزات من علامات التنصيص
const cleanQuotesFromFeatures = (features) => {
  return features.map(feature => {
    return feature
      .replace(/['"`]/g, '') // إزالة جميع أنواع علامات التنصيص
      .trim() // إزالة المسافات الزائدة
  }).filter(feature => feature.length > 0) // إزالة المميزات الفارغة
}

const cleanQuotesFromDatabase = async () => {
  try {
    console.log('🔍 البحث عن النماذج التي تحتوي على علامات تنصيص في المميزات...');
    
    const apartments = await ApartmentModel.find({});
    console.log(`📊 إجمالي النماذج: ${apartments.length}`);
    
    for (const apartment of apartments) {
      console.log(`\n🏠 النموذج: ${apartment.modelName}`);
      
      // التحقق من وجود علامات تنصيص
      const hasQuotes = apartment.features.some(feature => 
        feature.includes('"') || feature.includes("'") || feature.includes('`')
      );
      
      if (hasQuotes) {
        console.log(`📋 المميزات الأصلية (${apartment.features.length}):`);
        apartment.features.forEach((feature, index) => {
          console.log(`  ${index + 1}. "${feature}"`);
        });
        
        // تنظيف المميزات
        const originalFeatures = [...apartment.features];
        const cleanedFeatures = cleanQuotesFromFeatures(apartment.features);
        
        console.log(`\n✨ المميزات بعد التنظيف (${cleanedFeatures.length}):`);
        cleanedFeatures.forEach((feature, index) => {
          console.log(`  ${index + 1}. "${feature}"`);
        });
        
        apartment.features = cleanedFeatures;
        await apartment.save();
        console.log(`💾 تم حفظ التحديثات للنموذج: ${apartment.modelName}`);
      } else {
        console.log(`✅ لا توجد علامات تنصيص في المميزات للنموذج: ${apartment.modelName}`);
      }
    }
    
    console.log('\n🎉 تم تنظيف جميع علامات التنصيص بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف علامات التنصيص:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
cleanQuotesFromDatabase();
