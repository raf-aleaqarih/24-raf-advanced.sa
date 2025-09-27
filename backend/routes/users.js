const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Controller
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus
} = require('../controllers/adminController');

// Routes محمية
router.use(authenticateToken);

// Routes إدارة المستخدمين
router.get('/', 
  checkPermission('manage_admins'), 
  getAllAdmins
);

router.get('/:id', 
  checkPermission('manage_admins'), 
  getAdminById
);

router.post('/', 
  checkPermission('manage_admins'), 
  createAdmin
);

router.put('/:id', 
  checkPermission('manage_admins'), 
  updateAdmin
);

router.put('/:id/status', 
  checkPermission('manage_admins'), 
  updateAdminStatus
);

router.delete('/:id', 
  checkPermission('manage_admins'), 
  deleteAdmin
);

module.exports = router;
