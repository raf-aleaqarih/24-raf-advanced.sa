require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');

// Import models
const Admin = require('../models/Admin');
const ProjectWarranty = require('../models/ProjectWarranty');
const ProjectFeature = require('../models/ProjectFeature');

const setupDatabase = async () => {
  try {
    await connectDB();
    console.log('🔗 متصل بقاعدة البيانات');

    // إنشاء مستخدم super admin
    console.log('👤 إنشاء مستخدم super admin...');
    
    // حذف المستخدم إذا كان موجود
    await Admin.findOneAndDelete({ email: 'admin@project24.com' });
    
    const superAdmin = new Admin({
      name: 'مدير النظام',
      email: 'admin@project24.com',
      password: 'admin123',
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
        department: 'إدارة النظام',
        bio: 'مدير النظام الرئيسي'
      }
    });

    await superAdmin.save();
    console.log('✅ تم إنشاء super admin بنجاح');
    console.log('📧 Email: admin@project24.com');
    console.log('🔑 Password: admin123');

    // إنشاء ضمانات تجريبية
    console.log('🛡️ إنشاء ضمانات تجريبية...');
    
    // حذف الضمانات الموجودة
    await ProjectWarranty.deleteMany({});
    
    const warranties = [
      {
        title: 'انجاز مالوك',
        description: 'ضمان انجاز المالك خلال المدة المحددة مع جودة عالية',
        type: 'انجاز مالوك',
        duration: 1,
        durationUnit: 'years',
        coverage: ['انجاز المشروع في الوقت المحدد', 'جودة البناء والتشطيب', 'التسليم النهائي'],
        status: 'active',
        isActive: true,
        order: 1
      },
      {
        title: 'سمارت هوم',
        description: 'ضمان جميع أنظمة البيت الذكي والتقنيات المدمجة',
        type: 'سمارت هوم',
        duration: 2,
        durationUnit: 'years',
        coverage: ['أنظمة التحكم الذكي', 'أجهزة الاستشعار', 'التطبيقات المحمولة', 'الصيانة التقنية'],
        status: 'active',
        isActive: true,
        order: 2
      },
      {
        title: 'أعمال السباكة والكهرباء',
        description: 'ضمان شامل لجميع أعمال السباكة والكهرباء',
        type: 'أعمال السباكة والكهرباء',
        duration: 2,
        durationUnit: 'years',
        coverage: ['التوصيلات الكهربائية', 'شبكة السباكة', 'الإنارة', 'المفاتيح والمقابس'],
        status: 'active',
        isActive: true,
        order: 3
      },
      {
        title: 'المصاعد',
        description: 'ضمان شامل لجميع المصاعد وأنظمة الرفع',
        type: 'ضمان المصاعد',
        duration: 5,
        durationUnit: 'years',
        coverage: ['الصيانة الدورية', 'قطع الغيار', 'أنظمة الأمان', 'التشغيل الآلي'],
        status: 'active',
        isActive: true,
        order: 4
      },
      {
        title: 'الهيكل الإنشائي',
        description: 'ضمان الهيكل الإنشائي والأساسات',
        type: 'ضمان الهيكل الإنشائي',
        duration: 20,
        durationUnit: 'years',
        coverage: ['الأساسات', 'الهيكل الخرساني', 'الأعمدة والجسور', 'مقاومة الزلازل'],
        status: 'active',
        isActive: true,
        order: 5
      },
      {
        title: 'القواطع والأقواس',
        description: 'ضمان جميع القواطع الداخلية والأقواس المعمارية',
        type: 'القواطع والأقواس',
        duration: 20,
        durationUnit: 'years',
        coverage: ['القواطع الداخلية', 'الأقواس المعمارية', 'التشطيبات الداخلية', 'العزل'],
        status: 'active',
        isActive: true,
        order: 6
      }
    ];

    await ProjectWarranty.insertMany(warranties);
    console.log(`✅ تم إنشاء ${warranties.length} ضمان تجريبي`);

    // إنشاء مميزات تجريبية
    console.log('⭐ إنشاء مميزات تجريبية...');
    
    // حذف المميزات الموجودة
    await ProjectFeature.deleteMany({});
    
    const features = [
      {
        title: 'موقع استراتيجي',
        description: 'يقع المشروع في حي الزهراء في موقع استراتيجي مميز',
        icon: {
          name: 'MapPin',
          type: 'lucide'
        },
        category: 'location',
        isActive: true,
        order: 1
      },
      {
        title: 'أمان وحراسة 24/7',
        description: 'نظام أمني متكامل مع حراسة على مدار الساعة',
        icon: {
          name: 'Shield',
          type: 'lucide'
        },
        category: 'services',
        isActive: true,
        order: 2
      },
      {
        title: 'مرافق ترفيهية',
        description: 'حمام سباحة، صالة رياضية، وحدائق خضراء',
        icon: {
          name: 'Waves',
          type: 'lucide'
        },
        category: 'amenities',
        isActive: true,
        order: 3
      },
      {
        title: 'مواقف سيارات',
        description: 'مواقف سيارات مغطاة ومؤمنة لجميع الوحدات',
        icon: {
          name: 'Car',
          type: 'lucide'
        },
        category: 'amenities',
        isActive: true,
        order: 4
      },
      {
        title: 'تصميم عصري',
        description: 'تصميمات معمارية حديثة تلبي أحدث المعايير',
        icon: {
          name: 'Building2',
          type: 'lucide'
        },
        category: 'project',
        isActive: true,
        order: 5
      }
    ];

    await ProjectFeature.insertMany(features);
    console.log(`✅ تم إنشاء ${features.length} ميزة تجريبية`);

    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
    console.log('\n📋 ملخص:');
    console.log(`👤 مستخدمين: 1`);
    console.log(`🛡️ ضمانات: ${warranties.length}`);
    console.log(`⭐ مميزات: ${features.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
    process.exit(1);
  }
};

// تشغيل الإعداد
setupDatabase();
