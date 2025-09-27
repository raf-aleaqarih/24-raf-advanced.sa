const multer = require('multer');
const path = require('path');

// إعداد التخزين المؤقت
const storage = multer.memoryStorage();

// فلترة أنواع الملفات
const fileFilter = (req, file, cb) => {
  // الصور المسموحة
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
  const allowedDocTypes = /pdf|doc|docx|txt/;

  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocTypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = file.mimetype.startsWith('image/') ||
                   file.mimetype.startsWith('video/') ||
                   file.mimetype.startsWith('application/pdf') ||
                   file.mimetype.startsWith('application/msword') ||
                   file.mimetype.includes('document');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('أنواع الملفات المسموحة: الصور (JPG, PNG, GIF, WebP, SVG)، الفيديو (MP4, AVI, MOV, WebM)، المستندات (PDF, DOC, DOCX)'));
  }
};

// إعداد Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB حد أقصى لحجم الملف
    files: 10 // حد أقصى لعدد الملفات
  },
  fileFilter: fileFilter
});

// ميدل وير للتعامل مع أخطاء الرفع
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات كبير جداً. الحد الأقصى 10 ملفات'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير مدعوم'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'خطأ في رفع الملف'
  });
};

// إعدادات مختلفة للرفع
const uploadConfigs = {
  // صورة واحدة
  single: (fieldName) => upload.single(fieldName),
  
  // عدة صور
  multiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),
  
  // حقول متعددة
  fields: (fields) => upload.fields(fields),
  
  // أي ملف
  any: () => upload.any()
};

module.exports = {
  upload,
  uploadConfigs,
  handleUploadError
};
