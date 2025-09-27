const LocationFeature = require('../models/LocationFeature');

// الحصول على جميع مميزات الموقع
const getAllLocationFeatures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      status,
      search,
      sortBy = 'displayOrder',
      sortOrder = 'asc'
    } = req.query;

    const filters = {};
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const features = await LocationFeature.find(filters)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LocationFeature.countDocuments(filters);

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
    console.error('خطأ في جلب مميزات الموقع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مميزات الموقع',
      error: error.message
    });
  }
};

// الحصول على ميزة موقع واحدة
const getLocationFeatureById = async (req, res) => {
  try {
    const feature = await LocationFeature.findById(req.params.id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'ميزة الموقع غير موجودة'
      });
    }

    res.json({
      success: true,
      data: feature
    });
  } catch (error) {
    console.error('خطأ في جلب ميزة الموقع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب ميزة الموقع',
      error: error.message
    });
  }
};

// إنشاء ميزة موقع جديدة
const createLocationFeature = async (req, res) => {
  try {
    const feature = new LocationFeature(req.body);
    await feature.save();

    res.status(201).json({
      success: true,
      data: feature,
      message: 'تم إنشاء ميزة الموقع بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء ميزة الموقع:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء ميزة الموقع',
      error: error.message
    });
  }
};

// تحديث ميزة موقع
const updateLocationFeature = async (req, res) => {
  try {
    const feature = await LocationFeature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'ميزة الموقع غير موجودة'
      });
    }

    res.json({
      success: true,
      data: feature,
      message: 'تم تحديث ميزة الموقع بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث ميزة الموقع:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث ميزة الموقع',
      error: error.message
    });
  }
};

// حذف ميزة موقع
const deleteLocationFeature = async (req, res) => {
  try {
    const feature = await LocationFeature.findByIdAndDelete(req.params.id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'ميزة الموقع غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف ميزة الموقع بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف ميزة الموقع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف ميزة الموقع',
      error: error.message
    });
  }
};

// تحديث ترتيب مميزات الموقع
const updateLocationFeaturesOrder = async (req, res) => {
  try {
    const { features } = req.body;
    
    const updatePromises = features.map(feature => 
      LocationFeature.findByIdAndUpdate(feature.id, { displayOrder: feature.order })
    );
    
    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'تم تحديث ترتيب مميزات الموقع بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث ترتيب مميزات الموقع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث ترتيب مميزات الموقع',
      error: error.message
    });
  }
};

// الحصول على مميزات الموقع حسب الفئة
const getLocationFeaturesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const features = await LocationFeature.find({
      category: category,
      status: 'active',
      isVisible: true
    }).sort({ displayOrder: 1 });

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('خطأ في جلب مميزات الموقع حسب الفئة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مميزات الموقع حسب الفئة',
      error: error.message
    });
  }
};

// الحصول على مميزات الموقع للعرض العام
const getPublicLocationFeatures = async (req, res) => {
  try {
    const features = await LocationFeature.find({
      status: 'active',
      isVisible: true
    }).sort({ category: 1, displayOrder: 1 });

    // تجميع المميزات حسب الفئة
    const groupedFeatures = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedFeatures
    });
  } catch (error) {
    console.error('خطأ في جلب مميزات الموقع العامة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مميزات الموقع العامة',
      error: error.message
    });
  }
};

module.exports = {
  getAllLocationFeatures,
  getLocationFeatureById,
  createLocationFeature,
  updateLocationFeature,
  deleteLocationFeature,
  updateLocationFeaturesOrder,
  getLocationFeaturesByCategory,
  getPublicLocationFeatures
};
