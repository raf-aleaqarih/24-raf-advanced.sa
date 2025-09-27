const ProjectInfo = require('../models/ProjectInfo');
const ContactSettings = require('../models/ContactSettings');

// الحصول على الإعدادات العامة
const getSettings = async (req, res) => {
  try {
    const settings = await ProjectInfo.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'الإعدادات غير موجودة'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('خطأ في جلب الإعدادات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإعدادات',
      error: error.message
    });
  }
};

// تحديث الإعدادات العامة
const updateSettings = async (req, res) => {
  try {
    const settings = await ProjectInfo.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      data: settings,
      message: 'تم تحديث الإعدادات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الإعدادات',
      error: error.message
    });
  }
};

// الحصول على إعدادات الاتصال
const getContactSettings = async (req, res) => {
  try {
    const settings = await ContactSettings.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'إعدادات الاتصال غير موجودة'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('خطأ في جلب إعدادات الاتصال:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات الاتصال',
      error: error.message
    });
  }
};

// تحديث إعدادات الاتصال
const updateContactSettings = async (req, res) => {
  try {
    const settings = await ContactSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      data: settings,
      message: 'تم تحديث إعدادات الاتصال بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث إعدادات الاتصال:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الاتصال',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getContactSettings,
  updateContactSettings
};
