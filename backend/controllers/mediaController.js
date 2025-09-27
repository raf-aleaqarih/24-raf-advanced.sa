const ProjectMedia = require('../models/ProjectMedia');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// الحصول على جميع الوسائط
const getAllMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      mediaType,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    
    if (mediaType) {
      filters.mediaType = mediaType;
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const media = await ProjectMedia.find(filters)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedApartment', 'name title');

    const total = await ProjectMedia.countDocuments(filters);

    res.json({
      success: true,
      data: media,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الوسائط:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الوسائط',
      error: error.message
    });
  }
};

// الحصول على وسائط واحدة
const getMediaById = async (req, res) => {
  try {
    const media = await ProjectMedia.findById(req.params.id)
      .populate('relatedApartment', 'name title');
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('خطأ في جلب الملف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الملف',
      error: error.message
    });
  }
};

// رفع وسائط جديدة
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'يجب اختيار ملف للرفع'
      });
    }

    const { title, description, category, mediaType, tags, relatedApartment } = req.body;

    // رفع الملف إلى Cloudinary (إذا كان متوفراً) أو حفظه محلياً
    let uploadResult;
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      uploadResult = await uploadImage(req.file.buffer, {
        folder: `project24/${category || 'general'}`,
        public_id: `${mediaType}_${Date.now()}`
      });
    } else {
      // للتطوير المحلي - نستخدم placeholder
      uploadResult = {
        secure_url: `/uploads/${req.file.filename}`,
        public_id: `local_${Date.now()}`,
        width: 800,
        height: 600
      };
    }

    const mediaData = {
      title: title || req.file.originalname,
      description: description || '',
      mediaType: mediaType || (req.file.mimetype.startsWith('image/') ? 'image' : 'video'),
      category: category || 'general',
      file: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        dimensions: {
          width: uploadResult.width || 0,
          height: uploadResult.height || 0
        }
      },
      alt: title || req.file.originalname,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      relatedApartment: relatedApartment || null,
      isActive: true
    };

    const media = new ProjectMedia(mediaData);
    await media.save();

    res.status(201).json({
      success: true,
      data: media,
      message: 'تم رفع الملف بنجاح'
    });
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في رفع الملف',
      error: error.message
    });
  }
};

// تحديث وسائط
const updateMedia = async (req, res) => {
  try {
    const media = await ProjectMedia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }

    res.json({
      success: true,
      data: media,
      message: 'تم تحديث الملف بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث الملف:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الملف',
      error: error.message
    });
  }
};

// حذف وسائط
const deleteMedia = async (req, res) => {
  try {
    const media = await ProjectMedia.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }

    // حذف الملف من Cloudinary إذا كان متوفراً
    if (media.file.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await deleteImage(media.file.publicId);
      } catch (deleteError) {
        console.error('خطأ في حذف الملف من Cloudinary:', deleteError);
      }
    }

    await ProjectMedia.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف الملف بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الملف',
      error: error.message
    });
  }
};

// الحصول على صور المشروع العامة
const getProjectImages = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filters = {
      mediaType: 'image',
      isActive: true
    };
    
    if (category) {
      filters.category = category;
    } else {
      // فقط صور المشروع العامة
      filters.category = { $in: ['project-photos', 'promotional'] };
    }

    console.log('Media filters:', filters);
    const images = await ProjectMedia.find(filters)
      .sort({ order: 1, createdAt: -1 });
    console.log('Found images:', images.length);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('خطأ في جلب صور المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب صور المشروع',
      error: error.message
    });
  }
};

// الحصول على صور من نماذج الشقق
const getApartmentImages = async (req, res) => {
  try {
    const ApartmentModel = require('../models/ApartmentModel');
    
    const apartments = await ApartmentModel.find({ 
      status: 'active',
      images: { $exists: true, $not: { $size: 0 } }
    }).select('images modelTitle modelSubtitle');
    
    // استخراج جميع الصور من النماذج
    const allImages = [];
    apartments.forEach(apartment => {
      if (apartment.images && apartment.images.length > 0) {
        apartment.images.forEach((imageUrl, index) => {
          allImages.push({
            _id: `${apartment._id}_${index}`,
            title: `${apartment.modelTitle} - صورة ${index + 1}`,
            description: apartment.modelSubtitle,
            file: {
              url: imageUrl,
              originalName: `apartment_${apartment.modelName}_${index + 1}.jpg`
            },
            alt: `${apartment.modelTitle} - صورة ${index + 1}`,
            category: 'apartment-images',
            isActive: true,
            createdAt: new Date()
          });
        });
      }
    });

    res.json({
      success: true,
      data: allImages
    });
  } catch (error) {
    console.error('خطأ في جلب صور الشقق:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب صور الشقق',
      error: error.message
    });
  }
};

// الحصول على فيديوهات المشروع العامة
const getProjectVideos = async (req, res) => {
  try {
    const videos = await ProjectMedia.find({
      mediaType: 'video',
      isActive: true,
      category: { $in: ['videos', 'promotional'] }
    })
      .sort({ order: 1, createdAt: -1 })
      .select('title description url thumbnail category duration');

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('خطأ في جلب فيديوهات المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب فيديوهات المشروع',
      error: error.message
    });
  }
};

// الحصول على وسائط المشروع العامة
const getProjectMedia = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    
    let filters = {
      isActive: true
    };
    
    if (apartmentId && apartmentId !== 'general') {
      filters.relatedApartment = apartmentId;
    } else {
      // الوسائط العامة للمشروع
      filters.relatedApartment = { $exists: false };
    }

    const media = await ProjectMedia.find(filters)
      .sort({ order: 1, createdAt: -1 })
      .select('title description url thumbnail mediaType category');

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('خطأ في جلب وسائط المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب وسائط المشروع',
      error: error.message
    });
  }
};

// رفع ملفات متعددة
const uploadMultipleMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب اختيار ملفات للرفع'
      });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // رفع الملف إلى Cloudinary (إذا كان متوفراً) أو حفظه محلياً
        let uploadResult;
        
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          uploadResult = await uploadImage(file.buffer, {
            folder: 'project24/gallery',
            public_id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          // للتطوير المحلي - نستخدم placeholder
          uploadResult = {
            secure_url: `/uploads/${file.filename}`,
            public_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            width: 800,
            height: 600
          };
        }

        const mediaData = {
          title: file.originalname,
          description: '',
          mediaType: 'image',
          category: req.body.category || 'project-photos',
          file: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            dimensions: {
              width: uploadResult.width || 0,
              height: uploadResult.height || 0
            }
          },
          alt: file.originalname,
          tags: [],
          relatedApartment: null,
          isActive: true
        };

        const media = new ProjectMedia(mediaData);
        await media.save();
        uploadedFiles.push(media);
      } catch (fileError) {
        console.error(`خطأ في رفع الملف ${file.originalname}:`, fileError);
        errors.push({
          filename: file.originalname,
          error: fileError.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `تم رفع ${uploadedFiles.length} من ${req.files.length} ملف بنجاح`
    });
  } catch (error) {
    console.error('خطأ في رفع الملفات:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في رفع الملفات',
      error: error.message
    });
  }
};

module.exports = {
  getAllMedia,
  getMediaById,
  uploadMedia,
  uploadMultipleMedia,
  updateMedia,
  deleteMedia,
  getProjectImages,
  getApartmentImages,
  getProjectVideos,
  getProjectMedia
};
