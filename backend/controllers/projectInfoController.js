const ProjectInfo = require('../models/ProjectInfo');
const ApartmentModel = require('../models/ApartmentModel');
const ProjectFeature = require('../models/ProjectFeature');
const ProjectWarranty = require('../models/ProjectWarranty');
const ProjectMedia = require('../models/ProjectMedia');
const ContactSettings = require('../models/ContactSettings');

// الحصول على معلومات المشروع
const getProjectInfo = async (req, res) => {
  try {
    const projectInfo = await ProjectInfo.findOne();
    
    if (!projectInfo) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على معلومات المشروع' 
      });
    }
    
    res.json({
      success: true,
      data: projectInfo
    });
  } catch (error) {
    console.error('خطأ في الحصول على معلومات المشروع:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// تحديث معلومات المشروع
const updateProjectInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const projectInfo = await ProjectInfo.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!projectInfo) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على معلومات المشروع' 
      });
    }
    
    res.json({
      success: true,
      message: 'تم تحديث معلومات المشروع بنجاح',
      data: projectInfo
    });
  } catch (error) {
    console.error('خطأ في تحديث معلومات المشروع:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// الحصول على جميع البيانات المطلوبة للصفحة الرئيسية
const getHomePageData = async (req, res) => {
  try {
    // الحصول على معلومات المشروع
    const projectInfo = await ProjectInfo.findOne();
    
    // الحصول على نماذج الشقق
    const apartmentModels = await ApartmentModel.find({ status: 'active' })
      .sort({ displayOrder: 1 });
    
    // الحصول على مميزات المشروع
    const projectFeatures = await ProjectFeature.find({ 
      featureType: 'project', 
      status: 'active' 
    }).sort({ displayOrder: 1 });
    
    // الحصول على مميزات الموقع
    const locationFeatures = await ProjectFeature.find({ 
      featureType: 'location', 
      status: 'active' 
    }).sort({ displayOrder: 1 });
    
    // الحصول على الضمانات
    const warranties = await ProjectWarranty.find({ status: 'active' })
      .sort({ displayOrder: 1 });
    
    // الحصول على الوسائط
    const media = await ProjectMedia.find({ status: 'active' })
      .sort({ displayOrder: 1 });
    
    // الحصول على إعدادات التواصل
    const contactSettings = await ContactSettings.findOne();
    
    res.json({
      success: true,
      data: {
        projectInfo,
        apartmentModels,
        projectFeatures,
        locationFeatures,
        warranties,
        media,
        contactSettings
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على بيانات الصفحة الرئيسية:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// الحصول على بيانات نموذج معين
const getApartmentModel = async (req, res) => {
  try {
    const { modelName } = req.params;
    
    const model = await ApartmentModel.findOne({ 
      modelName: modelName.toUpperCase(),
      status: 'active' 
    });
    
    if (!model) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على النموذج' 
      });
    }
    
    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('خطأ في الحصول على نموذج الشقة:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// الحصول على إعدادات التواصل
const getContactSettings = async (req, res) => {
  try {
    const contactSettings = await ContactSettings.findOne();
    
    if (!contactSettings) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على إعدادات التواصل' 
      });
    }
    
    res.json({
      success: true,
      data: contactSettings
    });
  } catch (error) {
    console.error('خطأ في الحصول على إعدادات التواصل:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// تحديث إعدادات التواصل
const updateContactSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const contactSettings = await ContactSettings.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!contactSettings) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على إعدادات التواصل' 
      });
    }
    
    res.json({
      success: true,
      message: 'تم تحديث إعدادات التواصل بنجاح',
      data: contactSettings
    });
  } catch (error) {
    console.error('خطأ في تحديث إعدادات التواصل:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// الحصول على رقم الهاتف حسب المنصة
const getPhoneNumberByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const contactSettings = await ContactSettings.findOne();
    
    if (!contactSettings) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على إعدادات التواصل' 
      });
    }
    
    const phoneNumber = contactSettings.phoneNumbers[platform] || contactSettings.phoneNumbers.default;
    
    res.json({
      success: true,
      data: {
        platform,
        phoneNumber
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على رقم الهاتف:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// الحصول على رسالة الترحيب حسب المنصة
const getWelcomeMessageByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const contactSettings = await ContactSettings.findOne();
    
    if (!contactSettings) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على إعدادات التواصل' 
      });
    }
    
    const welcomeMessage = contactSettings.welcomeMessages[platform] || contactSettings.welcomeMessages.facebook;
    
    res.json({
      success: true,
      data: {
        platform,
        welcomeMessage
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على رسالة الترحيب:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// الحصول على جميع أرقام الهواتف ورسائل الترحيب
const getAllContactData = async (req, res) => {
  try {
    const contactSettings = await ContactSettings.findOne();
    
    if (!contactSettings) {
      return res.status(404).json({ 
        success: false, 
        message: 'لم يتم العثور على إعدادات التواصل' 
      });
    }
    
    res.json({
      success: true,
      data: {
        phoneNumbers: contactSettings.phoneNumbers,
        welcomeMessages: contactSettings.welcomeMessages
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على بيانات التواصل:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

module.exports = {
  getProjectInfo,
  updateProjectInfo,
  getHomePageData,
  getApartmentModel,
  getContactSettings,
  updateContactSettings,
  getPhoneNumberByPlatform,
  getWelcomeMessageByPlatform,
  getAllContactData
};
