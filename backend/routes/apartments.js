const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  updateApartmentsOrder
} = require('../controllers/apartmentController');

// إعداد رفع الملفات للشقق
const apartmentUpload = uploadConfigs.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 },
  { name: 'floorPlan', maxCount: 1 }
]);

// Routes عامة (بدون مصادقة)
router.get('/public', getAllApartments);
router.get('/public/:id', getApartmentById);

// Routes مع المصادقة
router.use(authenticateToken);

// GET /api/apartments - جلب جميع نماذج الشقق
router.get('/', checkPermission('manage_apartments'), getAllApartments);

// GET /api/apartments/:id - جلب نموذج شقة واحدة
router.get('/:id', checkPermission('manage_apartments'), getApartmentById);

// POST /api/apartments - إنشاء نموذج شقة جديد
router.post('/', 
  checkPermission('manage_apartments'),
  apartmentUpload,
  handleUploadError,
  createApartment
);

// PUT /api/apartments/:id - تحديث نموذج شقة
router.put('/:id',
  checkPermission('manage_apartments'),
  apartmentUpload,
  handleUploadError,
  updateApartment
);

// DELETE /api/apartments/:id - حذف نموذج شقة
router.delete('/:id',
  checkPermission('manage_apartments'),
  deleteApartment
);

// PUT /api/apartments/order/update - تحديث ترتيب النماذج
router.put('/order/update',
  checkPermission('manage_apartments'),
  updateApartmentsOrder
);

module.exports = router;
