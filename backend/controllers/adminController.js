const Admin = require('../models/Admin');

// الحصول على جميع المديرين
const getAllAdmins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const filters = {};
    
    if (role) {
      filters.role = role;
    }
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const admins = await Admin.find(filters)
      .select('-password -refreshTokens')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Admin.countDocuments(filters);

    res.json({
      success: true,
      data: admins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب المديرين:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المديرين',
      error: error.message
    });
  }
};

// الحصول على مدير واحد
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password -refreshTokens');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'المدير غير موجود'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('خطأ في جلب المدير:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المدير',
      error: error.message
    });
  }
};

// إنشاء مدير جديد
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني موجود مسبقاً'
      });
    }

    const admin = new Admin({
      name,
      email,
      password,
      role: role || 'editor',
      permissions: permissions || [],
      isActive: true
    });

    // إضافة الصلاحيات الافتراضية حسب الدور
    if (!permissions || permissions.length === 0) {
      admin.permissions = admin.getDefaultPermissions();
    }

    await admin.save();

    // إزالة كلمة المرور من الاستجابة
    const adminResponse = admin.toJSON();

    res.status(201).json({
      success: true,
      data: adminResponse,
      message: 'تم إنشاء المدير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء المدير:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء المدير',
      error: error.message
    });
  }
};

// تحديث مدير
const updateAdmin = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // منع تعديل كلمة المرور من هنا
    if (password) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل كلمة المرور من هنا. استخدم endpoint منفصل'
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'المدير غير موجود'
      });
    }

    res.json({
      success: true,
      data: admin,
      message: 'تم تحديث المدير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث المدير:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث المدير',
      error: error.message
    });
  }
};

// تحديث حالة المدير (تفعيل/تعطيل)
const updateAdminStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // منع تعطيل النفس
    if (req.admin._id.toString() === req.params.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تعطيل حسابك الخاص'
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -refreshTokens');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'المدير غير موجود'
      });
    }

    res.json({
      success: true,
      data: admin,
      message: `تم ${isActive ? 'تفعيل' : 'تعطيل'} المدير بنجاح`
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة المدير:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث حالة المدير',
      error: error.message
    });
  }
};

// حذف مدير
const deleteAdmin = async (req, res) => {
  try {
    // منع حذف النفس
    if (req.admin._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف حسابك الخاص'
      });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'المدير غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المدير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المدير:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المدير',
      error: error.message
    });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin
};
