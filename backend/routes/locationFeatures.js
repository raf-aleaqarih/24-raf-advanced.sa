const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');

const {
  getAllLocationFeatures,
  getLocationFeatureById,
  createLocationFeature,
  updateLocationFeature,
  deleteLocationFeature,
  updateLocationFeaturesOrder,
  getLocationFeaturesByCategory,
  getPublicLocationFeatures
} = require('../controllers/locationFeaturesController');

// Admin Routes (require authentication)
router.get('/', authenticateToken, getAllLocationFeatures);
router.get('/:id', authenticateToken, getLocationFeatureById);
router.post('/', authenticateToken, checkPermission('manage_location_features'), createLocationFeature);
router.put('/:id', authenticateToken, checkPermission('manage_location_features'), updateLocationFeature);
router.delete('/:id', authenticateToken, checkPermission('manage_location_features'), deleteLocationFeature);
router.put('/order/update', authenticateToken, checkPermission('manage_location_features'), updateLocationFeaturesOrder);

// Public Routes (no authentication required)
router.get('/all', getPublicLocationFeatures);
router.get('/category/:category', getLocationFeaturesByCategory);

module.exports = router;
