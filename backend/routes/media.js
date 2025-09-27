const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');

// Controller
const {
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
} = require('../controllers/mediaController');

// إعداد رفع الملفات
const mediaUpload = uploadConfigs.single('file');
const multipleMediaUpload = uploadConfigs.multiple('files', 10);

// Routes
router.get('/', getAllMedia);
router.get('/:id', getMediaById);

// Public routes for website
router.get('/public/project-images', getProjectImages);
router.get('/public/apartment-images', getApartmentImages);
router.get('/public/project-videos', getProjectVideos);
router.get('/public/project-media/:apartmentId?', getProjectMedia);

// Public upload route (for admin panel)
router.post('/public/upload-multiple', 
  multipleMediaUpload,
  handleUploadError,
  uploadMultipleMedia
);

// Routes محمية
router.post('/upload', 
  authenticateToken,
  checkPermission('manage_media'),
  mediaUpload,
  handleUploadError,
  uploadMedia
);

router.post('/upload-multiple', 
  authenticateToken,
  checkPermission('manage_media'),
  multipleMediaUpload,
  handleUploadError,
  uploadMultipleMedia
);

router.put('/:id',
  authenticateToken,
  checkPermission('manage_media'),
  updateMedia
);

router.delete('/:id',
  authenticateToken,
  checkPermission('manage_media'),
  deleteMedia
);

module.exports = router;
