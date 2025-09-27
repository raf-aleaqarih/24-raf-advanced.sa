const ProjectFeature = require('../models/ProjectFeature');

// الحصول على جميع المميزات
const getAllFeatures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      isActive,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const filters = {};
    
    if (category) {
      filters.category = category;
    }
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const features = await ProjectFeature.find(filters)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProjectFeature.countDocuments(filters);

    res.json({
      success: true,
      data: features,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب مميزات المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مميزات المشروع',
      error: error.message
    });
  }
};

// الحصول على ميزة واحدة
const getFeatureById = async (req, res) => {
  try {
    const feature = await ProjectFeature.findById(req.params.id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'الميزة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: feature
    });
  } catch (error) {
    console.error('خطأ في جلب الميزة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الميزة',
      error: error.message
    });
  }
};

// إنشاء ميزة جديدة
const createFeature = async (req, res) => {
  try {
    const feature = new ProjectFeature(req.body);
    await feature.save();

    res.status(201).json({
      success: true,
      data: feature,
      message: 'تم إنشاء الميزة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء الميزة:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء الميزة',
      error: error.message
    });
  }
};

// تحديث ميزة
const updateFeature = async (req, res) => {
  try {
    const feature = await ProjectFeature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'الميزة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: feature,
      message: 'تم تحديث الميزة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث الميزة:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الميزة',
      error: error.message
    });
  }
};

// حذف ميزة
const deleteFeature = async (req, res) => {
  try {
    const feature = await ProjectFeature.findByIdAndDelete(req.params.id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'الميزة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الميزة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الميزة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الميزة',
      error: error.message
    });
  }
};

// تحديث ترتيب المميزات
const updateFeaturesOrder = async (req, res) => {
  try {
    const { features } = req.body;
    
    const updatePromises = features.map(feature => 
      ProjectFeature.findByIdAndUpdate(feature.id, { order: feature.order })
    );
    
    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'تم تحديث ترتيب المميزات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث ترتيب المميزات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث ترتيب المميزات',
      error: error.message
    });
  }
};

module.exports = {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  updateFeaturesOrder
};
