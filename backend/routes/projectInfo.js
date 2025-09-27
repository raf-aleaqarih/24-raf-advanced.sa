const express = require('express');
const router = express.Router();
const {
  getProjectInfo,
  updateProjectInfo,
  getHomePageData,
  getApartmentModel,
  getContactSettings,
  updateContactSettings,
  getPhoneNumberByPlatform,
  getWelcomeMessageByPlatform,
  getAllContactData
} = require('../controllers/projectInfoController');

// الحصول على معلومات المشروع
router.get('/info', getProjectInfo);

// تحديث معلومات المشروع
router.put('/info/:id', updateProjectInfo);

// الحصول على جميع البيانات المطلوبة للصفحة الرئيسية
router.get('/homepage', getHomePageData);

// الحصول على بيانات نموذج معين
router.get('/apartment-model/:modelName', getApartmentModel);

// الحصول على إعدادات التواصل
router.get('/contact-settings', getContactSettings);

// تحديث إعدادات التواصل
router.put('/contact-settings/:id', updateContactSettings);

// الحصول على رقم الهاتف حسب المنصة
router.get('/phone/:platform', getPhoneNumberByPlatform);

// الحصول على رسالة الترحيب حسب المنصة
router.get('/welcome-message/:platform', getWelcomeMessageByPlatform);

// الحصول على جميع بيانات التواصل (أرقام الهواتف ورسائل الترحيب)
router.get('/contact-data', getAllContactData);

module.exports = router;
