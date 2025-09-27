const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');
const {
  getAllInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  updateInquiryStatus,
  addNote,
  addFollowUp,
  assignInquiry,
  deleteInquiry,
  getInquiryStats
} = require('../controllers/inquiryController');

// Routes عامة (بدون مصادقة)
// POST /api/inquiries - إنشاء استفسار جديد (من الموقع)
router.post('/', createInquiry);

// Routes مع المصادقة
router.use(authenticateToken);

// GET /api/inquiries - جلب جميع الاستفسارات
router.get('/', checkPermission('manage_inquiries'), getAllInquiries);

// GET /api/inquiries/stats - إحصائيات الاستفسارات
router.get('/stats', checkPermission('view_analytics'), getInquiryStats);

// GET /api/inquiries/:id - جلب استفسار واحد
router.get('/:id', checkPermission('manage_inquiries'), getInquiryById);

// PUT /api/inquiries/:id - تحديث استفسار
router.put('/:id', checkPermission('manage_inquiries'), updateInquiry);

// PUT /api/inquiries/:id/status - تحديث حالة الاستفسار
router.put('/:id/status', checkPermission('manage_inquiries'), updateInquiryStatus);

// POST /api/inquiries/:id/notes - إضافة ملاحظة
router.post('/:id/notes', checkPermission('manage_inquiries'), addNote);

// POST /api/inquiries/:id/followups - إضافة متابعة
router.post('/:id/followups', checkPermission('manage_inquiries'), addFollowUp);

// PUT /api/inquiries/:id/assign - تعيين مسؤول
router.put('/:id/assign', checkPermission('manage_inquiries'), assignInquiry);

// DELETE /api/inquiries/:id - حذف استفسار
router.delete('/:id', checkPermission('manage_inquiries'), deleteInquiry);

module.exports = router;
