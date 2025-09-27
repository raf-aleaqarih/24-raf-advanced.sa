const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission, checkRole } = require('../middleware/auth');

// Controller (سيتم إنشاؤه)
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus
} = require('../controllers/adminController');

// Routes محمية للمديرين فقط
router.use(authenticateToken);

// Routes إدارة المستخدمين
router.get('/users', 
  checkPermission('manage_admins'), 
  getAllAdmins
);

router.get('/users/:id', 
  checkPermission('manage_admins'), 
  getAdminById
);

router.post('/users', 
  checkRole(['super_admin']), 
  createAdmin
);

router.put('/users/:id', 
  checkPermission('manage_admins'), 
  updateAdmin
);

router.put('/users/:id/status', 
  checkRole(['super_admin']), 
  updateAdminStatus
);

router.delete('/users/:id', 
  checkRole(['super_admin']), 
  deleteAdmin
);

module.exports = router;
