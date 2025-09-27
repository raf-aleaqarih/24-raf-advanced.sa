const mongoose = require('mongoose');
const ApartmentModel = require('../models/ApartmentModel');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/jeddah-real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const fixImageUrls = async () => {
  try {
    console.log('🔍 البحث عن النماذج التي تحتوي على روابط محلية...');
    
    // البحث عن النماذج التي تحتوي على روابط محلية
    const apartments = await ApartmentModel.find({
      $or: [
        { 'images': { $regex: /^\/[^\/]/ } },
        { 'mainImage': { $regex: /^\/[^\/]/ } }
      ]
    });

    console.log(`📊 تم العثور على ${apartments.length} نموذج يحتاج إصلاح`);

    if (apartments.length === 0) {
      console.log('✅ لا توجد نماذج تحتاج إصلاح');
      return;
    }

    // قائمة الصور المتاحة في مجلد public
    const availableImages = [
      '/a.jpg',
      '/b.jpg', 
      '/c.jpg',
      '/d.jpg',
      '/1.jpg',
      '/2.jpg',
      '/3.jpg',
      '/4.jpg',
      '/5.jpg'
    ];

    // روابط Cloudinary البديلة (يمكنك استبدالها بروابطك الفعلية)
    const cloudinaryUrls = [
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/a.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/b.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/c.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/d.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/1.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/2.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/3.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/4.jpg',
      'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/5.jpg'
    ];

    // دالة لتحويل الرابط المحلي إلى رابط Cloudinary
    const convertToCloudinaryUrl = (localUrl) => {
      const index = availableImages.indexOf(localUrl);
      if (index !== -1) {
        return cloudinaryUrls[index];
      }
      // إذا لم نجد الرابط، نعيد رابط افتراضي
      return 'https://res.cloudinary.com/dvaz05tc6/image/upload/v1704067200/project24/gallery/placeholder.jpg';
    };

    // تحديث كل نموذج
    for (const apartment of apartments) {
      console.log(`🔧 إصلاح النموذج: ${apartment.modelName}`);
      
      let updated = false;

      // إصلاح مصفوفة الصور
      if (apartment.images && Array.isArray(apartment.images)) {
        apartment.images = apartment.images.map(img => {
          if (typeof img === 'string' && img.startsWith('/')) {
            updated = true;
            return convertToCloudinaryUrl(img);
          }
          return img;
        });
      }

      // إصلاح الصورة الرئيسية
      if (apartment.mainImage && apartment.mainImage.startsWith('/')) {
        apartment.mainImage = convertToCloudinaryUrl(apartment.mainImage);
        updated = true;
      }

      // حفظ التحديثات
      if (updated) {
        await apartment.save();
        console.log(`✅ تم إصلاح النموذج: ${apartment.modelName}`);
      }
    }

    console.log('🎉 تم إصلاح جميع النماذج بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح روابط الصور:', error);
  } finally {
    mongoose.connection.close();
  }
};

// تشغيل السكريبت
fixImageUrls();
