const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Controller
const {
  getSettings,
  updateSettings,
  getContactSettings,
  updateContactSettings
} = require('../controllers/settingsController');

// Routes محمية
router.use(authenticateToken);

// Routes الإعدادات العامة
router.get('/', 
  checkPermission('manage_project_info'), 
  getSettings
);

router.put('/', 
  checkPermission('manage_project_info'), 
  updateSettings
);

// Routes إعدادات الاتصال
router.get('/contact', 
  checkPermission('manage_project_info'), 
  getContactSettings
);

router.put('/contact', 
  checkPermission('manage_project_info'), 
  updateContactSettings
);

module.exports = router;
