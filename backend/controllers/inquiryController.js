const Inquiry = require('../models/Inquiry');

// الحصول على جميع الاستفسارات
const getAllInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      source,
      platform,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      dateFrom,
      dateTo
    } = req.query;

    // إعداد الفلاتر
    const filters = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (assignedTo) {
      filters.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
    }
    
    if (source) {
      filters.source = source;
    }
    
    if (platform) {
      filters.platform = platform;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) {
        filters.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.createdAt.$lte = new Date(dateTo);
      }
    }

    // إعداد الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // تنفيذ الاستعلام مع Pagination
    const inquiries = await Inquiry.find(filters)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name')
      .populate('followUps.createdBy', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // عدد النتائج الإجمالي
    const total = await Inquiry.countDocuments(filters);

    // إحصائيات سريعة
    const stats = await Inquiry.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalNew: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          totalContacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
          totalInterested: { $sum: { $cond: [{ $eq: ['$status', 'interested'] }, 1, 0] } },
          totalConverted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          totalUrgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        totalNew: 0,
        totalContacted: 0,
        totalInterested: 0,
        totalConverted: 0,
        totalUrgent: 0
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الاستفسارات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الاستفسارات',
      error: error.message
    });
  }
};

// الحصول على استفسار واحد
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('notes.createdBy', 'name')
      .populate('followUps.createdBy', 'name');
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('خطأ في جلب الاستفسار:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الاستفسار',
      error: error.message
    });
  }
};

// إنشاء استفسار جديد
const createInquiry = async (req, res) => {
  try {
    console.log('Received inquiry data:', req.body);
    
    const inquiryData = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!inquiryData.name || !inquiryData.phone) {
      return res.status(400).json({
        success: false,
        message: 'الاسم ورقم الهاتف مطلوبان',
        errors: {
          name: !inquiryData.name ? 'الاسم مطلوب' : null,
          phone: !inquiryData.phone ? 'رقم الهاتف مطلوب' : null
        }
      });
    }
    
    // إضافة معلومات تقنية
    inquiryData.userAgent = req.headers['user-agent'];
    inquiryData.ipAddress = req.ip || req.connection.remoteAddress;
    inquiryData.referrer = req.headers.referer || req.headers.referrer;
    
    // استخراج مصدر الإحالة من URL
    if (inquiryData.referrer) {
      try {
        const referrerUrl = new URL(inquiryData.referrer);
        const hostname = referrerUrl.hostname.toLowerCase();
        
        // تحديد المصدر بناءً على نطاق الإحالة
        if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
          inquiryData.source = inquiryData.source || 'facebook';
          inquiryData.platform = inquiryData.platform || 'facebook';
        } else if (hostname.includes('instagram.com')) {
          inquiryData.source = inquiryData.source || 'instagram';
          inquiryData.platform = inquiryData.platform || 'instagram';
        } else if (hostname.includes('snapchat.com')) {
          inquiryData.source = inquiryData.source || 'snapchat';
          inquiryData.platform = inquiryData.platform || 'snapchat';
        } else if (hostname.includes('tiktok.com')) {
          inquiryData.source = inquiryData.source || 'tiktok';
          inquiryData.platform = inquiryData.platform || 'tiktok';
        } else if (hostname.includes('google.com') || hostname.includes('google.')) {
          inquiryData.source = inquiryData.source || 'google';
          inquiryData.platform = inquiryData.platform || 'google';
        } else if (hostname.includes('whatsapp.com') || hostname.includes('wa.me')) {
          inquiryData.source = inquiryData.source || 'whatsapp';
          inquiryData.platform = inquiryData.platform || 'whatsapp';
        }
        
        // استخراج معاملات UTM من الإحالة
        const utmParams = {};
        const searchParams = referrerUrl.searchParams;
        
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
          if (searchParams.has(param)) {
            const key = param.replace('utm_', '');
            utmParams[key] = searchParams.get(param);
          }
        });
        
        if (Object.keys(utmParams).length > 0) {
          inquiryData.utmParams = utmParams;
          
          // تحديث المصدر بناءً على UTM
          if (utmParams.source) {
            inquiryData.source = inquiryData.source || utmParams.source;
          }
          if (utmParams.medium) {
            inquiryData.platform = inquiryData.platform || utmParams.medium;
          }
        }
      } catch (error) {
        console.warn('خطأ في تحليل URL الإحالة:', error.message);
      }
    }

    const inquiry = new Inquiry(inquiryData);
    await inquiry.save();

    console.log('Inquiry saved successfully:', inquiry._id);

    // إرسال إشعار للمسؤولين (يمكن إضافته لاحقاً)

    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'تم استلام استفسارك بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء الاستفسار:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إرسال الاستفسار',
      error: error.message
    });
  }
};

// تحديث استفسار
const updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    res.json({
      success: true,
      data: inquiry,
      message: 'تم تحديث الاستفسار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث الاستفسار:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الاستفسار',
      error: error.message
    });
  }
};

// تحديث حالة الاستفسار
const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    res.json({
      success: true,
      data: inquiry,
      message: 'تم تحديث حالة الاستفسار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة الاستفسار:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث حالة الاستفسار',
      error: error.message
    });
  }
};

// إضافة ملاحظة
const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    inquiry.notes.push({
      content,
      createdBy: req.user._id
    });

    await inquiry.save();

    res.json({
      success: true,
      data: inquiry,
      message: 'تم إضافة الملاحظة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إضافة الملاحظة:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إضافة الملاحظة',
      error: error.message
    });
  }
};

// إضافة متابعة
const addFollowUp = async (req, res) => {
  try {
    const { date, type, notes } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    inquiry.followUps.push({
      date,
      type,
      notes,
      createdBy: req.user._id
    });

    await inquiry.save();

    res.json({
      success: true,
      data: inquiry,
      message: 'تم إضافة المتابعة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إضافة المتابعة:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إضافة المتابعة',
      error: error.message
    });
  }
};

// تعيين مسؤول
const assignInquiry = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    res.json({
      success: true,
      data: inquiry,
      message: 'تم تعيين المسؤول بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تعيين المسؤول:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تعيين المسؤول',
      error: error.message
    });
  }
};

// حذف استفسار
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'الاستفسار غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الاستفسار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الاستفسار:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الاستفسار',
      error: error.message
    });
  }
};

// إحصائيات الاستفسارات
const getInquiryStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) {
        dateFilter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.createdAt.$lte = new Date(dateTo);
      }
    }

    // إحصائيات عامة
    const generalStats = await Inquiry.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalNew: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          totalContacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
          totalInterested: { $sum: { $cond: [{ $eq: ['$status', 'interested'] }, 1, 0] } },
          totalConverted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          conversionRate: {
            $avg: { $cond: [{ $eq: ['$status', 'converted'] }, 100, 0] }
          }
        }
      }
    ]);

    // إحصائيات حسب المصدر
    const sourceStats = await Inquiry.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // إحصائيات حسب المنصة
    const platformStats = await Inquiry.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // إحصائيات حسب النموذج المهتم به
    const modelStats = await Inquiry.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$interestedIn',
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // إحصائيات زمنية (آخر 30 يوم)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const timelineStats = await Inquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        general: generalStats[0] || {
          total: 0,
          totalNew: 0,
          totalContacted: 0,
          totalInterested: 0,
          totalConverted: 0,
          conversionRate: 0
        },
        bySource: sourceStats,
        byPlatform: platformStats,
        byModel: modelStats,
        timeline: timelineStats
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
};

module.exports = {
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
};
