const cloudinary = require('cloudinary').v2;

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// دالة لرفع صورة
const uploadImage = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options
    };

    // إذا لم يكن Cloudinary مُعرف، إرجاع placeholder
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      resolve({
        secure_url: '/placeholder-image.jpg',
        public_id: `local_${Date.now()}`,
        width: 800,
        height: 600
      });
      return;
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// دالة لحذف صورة
const deleteImage = async (publicId) => {
  try {
    // إذا لم يكن Cloudinary مُعرف، تجاهل العملية
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return { result: 'ok' };
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('خطأ في حذف الصورة من Cloudinary:', error);
    throw error;
  }
};

// دالة لحذف عدة صور
const deleteImages = async (publicIds) => {
  try {
    // إذا لم يكن Cloudinary مُعرف، تجاهل العملية
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return { deleted: publicIds };
    }
    
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('خطأ في حذف الصور من Cloudinary:', error);
    throw error;
  }
};

// دالة لتحسين URL الصورة
const optimizeImageUrl = (url, options = {}) => {
  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    crop = 'fill'
  } = options;

  // استخراج public_id من الرابط
  const regex = /\/upload\/(?:v\d+\/)?(.+)\./;
  const match = url.match(regex);
  
  if (!match) return url;
  
  const publicId = match[1];
  
  let transformation = [];
  
  if (width || height) {
    transformation.push(`c_${crop}`);
    if (width) transformation.push(`w_${width}`);
    if (height) transformation.push(`h_${height}`);
  }
  
  transformation.push(`q_${quality}`);
  transformation.push(`f_${format}`);
  
  return cloudinary.url(publicId, {
    transformation: transformation
  });
};

// دالة للحصول على معلومات الصورة
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('خطأ في جلب معلومات الصورة:', error);
    throw error;
  }
};

// دالة للبحث عن الصور
const searchImages = async (expression, options = {}) => {
  try {
    const result = await cloudinary.search
      .expression(expression)
      .sort_by([['created_at', 'desc']])
      .max_results(options.maxResults || 30)
      .execute();
    
    return result;
  } catch (error) {
    console.error('خطأ في البحث عن الصور:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  deleteImages,
  optimizeImageUrl,
  getImageInfo,
  searchImages
};
