const ApartmentModel = require('../models/ApartmentModel');
const { uploadImage, deleteImage, deleteImages } = require('../config/cloudinary');

// الحصول على جميع نماذج الشقق
const getAllApartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'order',
      sortOrder = 'asc',
      search
    } = req.query;

    // إعداد الفلاتر
    const filters = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } }
      ];
    }

    // إعداد الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // تنفيذ الاستعلام مع Pagination
    const apartments = await ApartmentModel.find(filters)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // تنظيف روابط الصور من المسافات
    const cleanedApartments = apartments.map(apartment => {
      // تنظيف مصفوفة الصور
      if (apartment.images && Array.isArray(apartment.images)) {
        apartment.images = apartment.images.map(img => {
          if (typeof img === 'string') {
            return img.trim();
          }
          return img;
        });
      }
      
      // تنظيف الصورة الرئيسية
      if (apartment.mainImage && typeof apartment.mainImage === 'string') {
        apartment.mainImage = apartment.mainImage.trim();
      }
      
      return apartment;
    });

    // عدد النتائج الإجمالي
    const total = await ApartmentModel.countDocuments(filters);

    res.json({
      success: true,
      data: cleanedApartments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب نماذج الشقق:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب نماذج الشقق',
      error: error.message
    });
  }
};

// الحصول على نموذج شقة واحدة
const getApartmentById = async (req, res) => {
  try {
    const apartment = await ApartmentModel.findById(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'نموذج الشقة غير موجود'
      });
    }

    // تنظيف روابط الصور من المسافات
    const cleanedApartment = apartment.toObject();
    
    // تنظيف مصفوفة الصور
    if (cleanedApartment.images && Array.isArray(cleanedApartment.images)) {
      cleanedApartment.images = cleanedApartment.images.map(img => {
        if (typeof img === 'string') {
          return img.trim();
        }
        return img;
      });
    }
    
    // تنظيف الصورة الرئيسية
    if (cleanedApartment.mainImage && typeof cleanedApartment.mainImage === 'string') {
      cleanedApartment.mainImage = cleanedApartment.mainImage.trim();
    }

    res.json({
      success: true,
      data: cleanedApartment
    });
  } catch (error) {
    console.error('خطأ في جلب نموذج الشقة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب نموذج الشقة',
      error: error.message
    });
  }
};

// إنشاء نموذج شقة جديد
const createApartment = async (req, res) => {
  try {
    const apartmentData = req.body;
    
    // معالجة المميزات إذا كانت مرسلة كحقول منفصلة
    if (req.body.features && typeof req.body.features === 'object' && !Array.isArray(req.body.features)) {
      // تحويل من {features[0]: "ميزة1", features[1]: "ميزة2"} إلى ["ميزة1", "ميزة2"]
      const featuresArray = [];
      Object.keys(req.body.features).forEach(key => {
        if (key.startsWith('features[') && key.endsWith(']')) {
          const index = parseInt(key.match(/\[(\d+)\]/)[1]);
          featuresArray[index] = req.body.features[key];
        }
      });
      apartmentData.features = featuresArray.filter(feature => feature && feature.trim());
    }
    
    // تحويل الصور من array of objects إلى array of strings
    if (apartmentData.images && Array.isArray(apartmentData.images)) {
      apartmentData.images = apartmentData.images.map(img => {
        if (typeof img === 'object' && img.url) {
          return img.url;
        } else if (typeof img === 'string') {
          // التأكد من أن الرابط هو رابط Cloudinary وليس رابط محلي
          if (img.startsWith('http') && img.includes('cloudinary.com')) {
            return img;
          } else if (img.startsWith('/')) {
            // تجاهل الروابط المحلية
            console.warn('تم تجاهل رابط محلي:', img);
            return null;
          }
          return img;
        }
        return img;
      }).filter(img => img !== null); // إزالة الروابط المحلية
    }

    // التعامل مع الصورة الرئيسية
    if (apartmentData.mainImage) {
      if (apartmentData.mainImage.startsWith('http') && apartmentData.mainImage.includes('cloudinary.com')) {
        // رابط Cloudinary صحيح
        console.log('تم حفظ الصورة الرئيسية:', apartmentData.mainImage);
      } else if (apartmentData.mainImage.startsWith('/')) {
        // تجاهل الروابط المحلية
        console.warn('تم تجاهل الصورة الرئيسية المحلية:', apartmentData.mainImage);
        apartmentData.mainImage = '';
      }
    }

    // إذا لم تكن هناك صورة رئيسية، استخدم أول صورة من مصفوفة الصور
    if (!apartmentData.mainImage && apartmentData.images && apartmentData.images.length > 0) {
      apartmentData.mainImage = apartmentData.images[0];
    }

    const apartment = new ApartmentModel(apartmentData);
    await apartment.save();

    res.status(201).json({
      success: true,
      data: apartment,
      message: 'تم إنشاء نموذج الشقة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء نموذج الشقة:', error);
    
    // حذف الصور المرفوعة في حالة الخطأ
    if (req.uploadedImages) {
      for (const publicId of req.uploadedImages) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error('خطأ في حذف الصورة:', deleteError);
        }
      }
    }
    
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء نموذج الشقة',
      error: error.message
    });
  }
};

// تحديث نموذج شقة
const updateApartment = async (req, res) => {
  try {
    const apartmentId = req.params.id;
    const updateData = req.body;
    
    // معالجة المميزات إذا كانت مرسلة كحقول منفصلة
    if (req.body.features && typeof req.body.features === 'object' && !Array.isArray(req.body.features)) {
      // تحويل من {features[0]: "ميزة1", features[1]: "ميزة2"} إلى ["ميزة1", "ميزة2"]
      const featuresArray = [];
      Object.keys(req.body.features).forEach(key => {
        if (key.startsWith('features[') && key.endsWith(']')) {
          const index = parseInt(key.match(/\[(\d+)\]/)[1]);
          featuresArray[index] = req.body.features[key];
        }
      });
      updateData.features = featuresArray.filter(feature => feature && feature.trim());
    }
    
    // البحث عن النموذج الحالي
    const existingApartment = await ApartmentModel.findById(apartmentId);
    if (!existingApartment) {
      return res.status(404).json({
        success: false,
        message: 'نموذج الشقة غير موجود'
      });
    }

    // تحويل الصور من array of objects إلى array of strings
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(img => {
        if (typeof img === 'object' && img.url) {
          return img.url;
        } else if (typeof img === 'string') {
          // التأكد من أن الرابط هو رابط Cloudinary وليس رابط محلي
          if (img.startsWith('http') && img.includes('cloudinary.com')) {
            return img;
          } else if (img.startsWith('/')) {
            // تجاهل الروابط المحلية
            console.warn('تم تجاهل رابط محلي:', img);
            return null;
          }
          return img;
        }
        return img;
      }).filter(img => img !== null); // إزالة الروابط المحلية
    }

    // التعامل مع الصورة الرئيسية
    if (updateData.mainImage) {
      if (updateData.mainImage.startsWith('http') && updateData.mainImage.includes('cloudinary.com')) {
        // رابط Cloudinary صحيح
        console.log('تم تحديث الصورة الرئيسية:', updateData.mainImage);
      } else if (updateData.mainImage.startsWith('/')) {
        // تجاهل الروابط المحلية
        console.warn('تم تجاهل الصورة الرئيسية المحلية:', updateData.mainImage);
        updateData.mainImage = '';
      }
    }

    // إذا لم تكن هناك صورة رئيسية، استخدم أول صورة من مصفوفة الصور
    if (!updateData.mainImage && updateData.images && updateData.images.length > 0) {
      updateData.mainImage = updateData.images[0];
    }

    const apartment = await ApartmentModel.findByIdAndUpdate(
      apartmentId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: apartment,
      message: 'تم تحديث نموذج الشقة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث نموذج الشقة:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث نموذج الشقة',
      error: error.message
    });
  }
};

// حذف نموذج شقة
const deleteApartment = async (req, res) => {
  try {
    const apartment = await ApartmentModel.findById(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'نموذج الشقة غير موجود'
      });
    }

    // حذف الصور من Cloudinary
    const imagesToDelete = [];
    
    if (apartment.images.main?.publicId) {
      imagesToDelete.push(apartment.images.main.publicId);
    }
    
    if (apartment.images.gallery) {
      apartment.images.gallery.forEach(image => {
        if (image.publicId) {
          imagesToDelete.push(image.publicId);
        }
      });
    }
    
    if (apartment.images.floorPlan?.publicId) {
      imagesToDelete.push(apartment.images.floorPlan.publicId);
    }

    // حذف الصور
    if (imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete);
    }

    // حذف النموذج
    await ApartmentModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف نموذج الشقة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف نموذج الشقة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف نموذج الشقة',
      error: error.message
    });
  }
};

// تحديث ترتيب النماذج
const updateApartmentsOrder = async (req, res) => {
  try {
    const { apartments } = req.body; // مصفوفة من { id, order }
    
    const updatePromises = apartments.map(apt => 
      ApartmentModel.findByIdAndUpdate(apt.id, { order: apt.order })
    );
    
    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'تم تحديث ترتيب النماذج بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث ترتيب النماذج:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث ترتيب النماذج',
      error: error.message
    });
  }
};

// الحصول على شقة بالاسم (للموقع العام)
const getApartmentByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    const apartment = await ApartmentModel.findOne({ 
      modelName: name,
      status: 'active' 
    }).lean();
    
    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'نموذج الشقة غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: apartment
    });
  } catch (error) {
    console.error('خطأ في جلب نموذج الشقة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب نموذج الشقة',
      error: error.message
    });
  }
};

module.exports = {
  getAllApartments,
  getApartmentById,
  getApartmentByName,
  createApartment,
  updateApartment,
  deleteApartment,
  updateApartmentsOrder
};
