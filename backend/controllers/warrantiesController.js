const ProjectWarranty = require('../models/ProjectWarranty');

// الحصول على جميع الضمانات
const getAllWarranties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      status,
      search,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const filters = {};
    
    if (type && type !== 'all') {
      filters.type = type;
    }
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const warranties = await ProjectWarranty.find(filters)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProjectWarranty.countDocuments(filters);

    res.json({
      success: true,
      data: warranties,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب ضمانات المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب ضمانات المشروع',
      error: error.message
    });
  }
};

// الحصول على ضمان واحد
const getWarrantyById = async (req, res) => {
  try {
    const warranty = await ProjectWarranty.findById(req.params.id);
    
    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'الضمان غير موجود'
      });
    }

    res.json({
      success: true,
      data: warranty
    });
  } catch (error) {
    console.error('خطأ في جلب الضمان:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الضمان',
      error: error.message
    });
  }
};

// إنشاء ضمان جديد
const createWarranty = async (req, res) => {
  try {
    const warranty = new ProjectWarranty(req.body);
    await warranty.save();

    res.status(201).json({
      success: true,
      data: warranty,
      message: 'تم إنشاء الضمان بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء الضمان:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء الضمان',
      error: error.message
    });
  }
};

// تحديث ضمان
const updateWarranty = async (req, res) => {
  try {
    const warranty = await ProjectWarranty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'الضمان غير موجود'
      });
    }

    res.json({
      success: true,
      data: warranty,
      message: 'تم تحديث الضمان بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث الضمان:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الضمان',
      error: error.message
    });
  }
};

// حذف ضمان
const deleteWarranty = async (req, res) => {
  try {
    const warranty = await ProjectWarranty.findByIdAndDelete(req.params.id);
    
    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'الضمان غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الضمان بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الضمان:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الضمان',
      error: error.message
    });
  }
};

// تحديث ترتيب الضمانات
const updateWarrantiesOrder = async (req, res) => {
  try {
    const { warranties } = req.body;
    
    const updatePromises = warranties.map(warranty => 
      ProjectWarranty.findByIdAndUpdate(warranty.id, { order: warranty.order })
    );
    
    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'تم تحديث ترتيب الضمانات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث ترتيب الضمانات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث ترتيب الضمانات',
      error: error.message
    });
  }
};

module.exports = {
  getAllWarranties,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  deleteWarranty,
  updateWarrantiesOrder
};
