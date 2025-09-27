require('dotenv').config();
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

// استيراد نموذج Admin بعد الاتصال بقاعدة البيانات
const Admin = require('../models/Admin');

// إنشاء المدير الأساسي
const createAdmin = async () => {
  try {
    // التحقق من وجود مدير مسبقاً
    const existingAdmin = await Admin.findOne({ email: 'admin@project24.sa' });
    
    if (existingAdmin) {
      console.log('⚠️ المدير موجود مسبقاً');
      console.log('📧 البريد الإلكتروني:', existingAdmin.email);
      console.log('👤 الاسم:', existingAdmin.name);
      console.log('🔐 الدور:', existingAdmin.role);
      return;
    }

    // إنشاء مدير جديد
    const adminData = {
      name: 'مدير النظام',
      email: 'admin@project24.sa',
      password: 'Admin@2024!',
      role: 'super_admin',
      permissions: [
        'manage_apartments',
        'manage_media',
        'manage_features',
        'manage_warranties',
        'manage_project_info',
        'manage_admins',
        'view_analytics',
        'manage_inquiries'
      ],
      isActive: true,
      isEmailVerified: true,
      profile: {
        phone: '0555812257',
        department: 'إدارة تقنية المعلومات'
      }
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ تم إنشاء المدير الأساسي بنجاح!');
    console.log('');
    console.log('📋 بيانات تسجيل الدخول:');
    console.log('📧 البريد الإلكتروني: admin@project24.sa');
    console.log('🔑 كلمة المرور: Admin@2024!');
    console.log('🔐 الدور: مدير عام');
    console.log('');
    console.log('🔗 رابط لوحة التحكم: http://localhost:3001/login');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير:', error);
    
    if (error.code === 11000) {
      console.log('⚠️ البريد الإلكتروني مستخدم مسبقاً');
    }
  }
};

// إنشاء مدير إضافي للاختبار
const createTestAdmin = async () => {
  try {
    const testAdminData = {
      name: 'مدير الاختبار',
      email: 'test@project24.sa',
      password: 'Test@2024!',
      role: 'admin',
      permissions: [
        'manage_apartments',
        'manage_media',
        'manage_features',
        'manage_warranties',
        'manage_project_info',
        'view_analytics',
        'manage_inquiries'
      ],
      isActive: true,
      isEmailVerified: true,
      profile: {
        phone: '0543766262',
        department: 'إدارة المشروع'
      }
    };

    const existingTestAdmin = await Admin.findOne({ email: 'test@project24.sa' });
    
    if (!existingTestAdmin) {
      const testAdmin = new Admin(testAdminData);
      await testAdmin.save();
      
      console.log('✅ تم إنشاء مدير الاختبار بنجاح!');
      console.log('📧 البريد الإلكتروني: test@project24.sa');
      console.log('🔑 كلمة المرور: Test@2024!');
    } else {
      console.log('⚠️ مدير الاختبار موجود مسبقاً');
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء مدير الاختبار:', error);
  }
};

// إظهار جميع المديرين الموجودين
const listAdmins = async () => {
  try {
    const admins = await Admin.find({}, 'name email role isActive createdAt').sort({ createdAt: -1 });
    
    console.log('');
    console.log('👥 قائمة المديرين الموجودين:');
    console.log('================================');
    
    if (admins.length === 0) {
      console.log('لا يوجد مديرين في النظام');
      return;
    }
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   📧 ${admin.email}`);
      console.log(`   🔐 ${admin.role === 'super_admin' ? 'مدير عام' : admin.role === 'admin' ? 'مدير' : 'محرر'}`);
      console.log(`   📅 ${admin.createdAt.toLocaleDateString('ar-SA')}`);
      console.log(`   ${admin.isActive ? '✅ نشط' : '❌ غير نشط'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ في عرض المديرين:', error);
  }
};

// تشغيل السكريبت
const runScript = async () => {
  console.log('👤 إنشاء المديرين في قاعدة البيانات...\n');
  
  await connectDB();
  
  await createAdmin();
  await createTestAdmin();
  await listAdmins();
  
  console.log('✅ تم الانتهاء من إعداد المديرين!');
  process.exit(0);
};

// التعامل مع الأخطاء
process.on('uncaughtException', (error) => {
  console.error('❌ خطأ غير متوقع:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ خطأ في Promise:', error);
  process.exit(1);
});

// تشغيل السكريبت
runScript();
