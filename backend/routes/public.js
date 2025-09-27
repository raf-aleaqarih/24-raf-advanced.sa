const express = require('express');
const router = express.Router();

// Controllers
const {
  getProjectInfo,
  getProjectStats,
  getPublicStats
} = require('../controllers/projectController');

const {
  getAllFeatures
} = require('../controllers/featuresController');

const {
  getAllWarranties
} = require('../controllers/warrantiesController');


const {
  getAllApartments,
  getApartmentById,
  getApartmentByName
} = require('../controllers/apartmentController');

const {
  getProjectMedia,
  getProjectImages,
  getProjectVideos
} = require('../controllers/mediaController');

const {
  createInquiry
} = require('../controllers/inquiryController');

const {
  trackPageView,
  trackInteraction,
  trackConversion
} = require('../controllers/analyticsController');

const {
  getPublicLocationFeatures
} = require('../controllers/locationFeaturesController');

// Public Project Routes (لا تحتاج مصادقة)
router.get('/project/info', getProjectInfo);
router.get('/project/stats', getPublicStats);
router.get('/project/features', getAllFeatures);
router.get('/project/warranties', getAllWarranties);


// Public Apartments Routes
router.get('/apartments/public', getAllApartments);
router.get('/apartments/public/:id', getApartmentById);
router.get('/apartments/public/name/:name', getApartmentByName);

// Public Media Routes
router.get('/media/public/project-images', getProjectImages);
router.get('/media/public/project-videos', getProjectVideos);
router.get('/media/public/apartment/:id', getProjectMedia);

// Public Inquiries Routes
router.post('/inquiries', createInquiry);
router.get('/inquiries/track/:trackingId', (req, res) => {
  res.json({
    success: true,
    message: 'تتبع الاستفسار غير متاح حالياً',
    data: null
  });
});

// Public Analytics Routes
router.post('/analytics/page-view', trackPageView);
router.post('/analytics/interaction', trackInteraction);
router.post('/analytics/conversion', trackConversion);

// Public Location Features Routes
router.get('/public/location-features', getPublicLocationFeatures);

module.exports = router;
