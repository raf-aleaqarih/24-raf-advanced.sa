const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Controllers (سيتم إنشاؤها)
const {
  getProjectInfo,
  updateProjectInfo,
  getProjectStats,
  extractCoordinatesFromGoogleMaps,
  updateMapSettings
} = require('../controllers/projectController');

const {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  updateFeaturesOrder
} = require('../controllers/featuresController');

const {
  getAllWarranties,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  deleteWarranty,
  updateWarrantiesOrder
} = require('../controllers/warrantiesController');

// Project Info Routes
router.get('/info', getProjectInfo);
router.put('/info', authenticateToken, checkPermission('manage_project_info'), updateProjectInfo);
router.get('/stats', authenticateToken, getProjectStats);

// Map Management Routes
router.post('/extract-coordinates', authenticateToken, checkPermission('manage_project_info'), extractCoordinatesFromGoogleMaps);
router.put('/map-settings', authenticateToken, checkPermission('manage_project_info'), updateMapSettings);

// Features Routes
router.get('/features', getAllFeatures);
router.get('/features/:id', getFeatureById);
router.post('/features', authenticateToken, checkPermission('manage_features'), createFeature);
router.put('/features/:id', authenticateToken, checkPermission('manage_features'), updateFeature);
router.delete('/features/:id', authenticateToken, checkPermission('manage_features'), deleteFeature);
router.put('/features/order/update', authenticateToken, checkPermission('manage_features'), updateFeaturesOrder);

// Warranties Routes
router.get('/warranties', getAllWarranties);
router.get('/warranties/:id', getWarrantyById);
router.post('/warranties', authenticateToken, checkPermission('manage_warranties'), createWarranty);
router.put('/warranties/:id', authenticateToken, checkPermission('manage_warranties'), updateWarranty);
router.delete('/warranties/:id', authenticateToken, checkPermission('manage_warranties'), deleteWarranty);
router.put('/warranties/order/update', authenticateToken, checkPermission('manage_warranties'), updateWarrantiesOrder);

module.exports = router;
