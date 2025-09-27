require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Admin = require('../models/Admin');
const ApartmentModel = require('../models/ApartmentModel');
const ProjectFeature = require('../models/ProjectFeature');
const ProjectWarranty = require('../models/ProjectWarranty');
const ProjectInfo = require('../models/ProjectInfo');

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

// تنظيف قاعدة البيانات
const clearDatabase = async () => {
  try {
    await Admin.deleteMany({});
    await ApartmentModel.deleteMany({});
    await ProjectFeature.deleteMany({});
    await ProjectWarranty.deleteMany({});
    await ProjectInfo.deleteMany({});
    console.log('🧹 تم تنظيف قاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في تنظيف قاعدة البيانات:', error);
  }
};

// إنشاء مدير أساسي
const createAdmin = async () => {
  try {
    const admin = new Admin({
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
      isEmailVerified: true
    });

    await admin.save();
    console.log('✅ تم إنشاء المدير الأساسي');
    console.log('📧 البريد الإلكتروني: admin@project24.sa');
    console.log('🔑 كلمة المرور: Admin@2024!');
  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير:', error);
  }
};

// إنشاء نماذج الشقق
const createApartmentModels = async () => {
  try {
    const apartments = [
      {
        name: 'A',
        title: 'نموذج A',
        subtitle: 'على شارع جنوبي شرقي',
        description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.',
        area: 156,
        roofArea: 156,
        totalArea: 312,
        rooms: 4,
        bathrooms: 4,
        floors: 1,
        price: {
          amount: 830000,
          currency: 'SAR',
          formatted: '830,000 ريال'
        },
        features: [
          { name: 'غرفة خادمة', icon: 'home', category: 'interior' },
          { name: 'غرفة سائق', icon: 'home', category: 'interior' },
          { name: 'شقق مودرن', icon: 'sparkles', category: 'interior' },
          { name: 'أسقف مرتفعة', icon: 'arrow-up', category: 'interior' },
          { name: 'نوافذ كبيرة', icon: 'square', category: 'interior' },
          { name: 'صالة', icon: 'home', category: 'interior' },
          { name: 'مطبخ', icon: 'chef-hat', category: 'interior' },
          { name: 'بلكونة', icon: 'home', category: 'exterior' },
          { name: 'سمارت هوم', icon: 'smartphone', category: 'technology' },
          { name: 'موقف خاص', icon: 'car', category: 'exterior' },
          { name: 'مصعد', icon: 'arrow-up-down', category: 'services' },
          { name: 'كاميرات مراقبة', icon: 'camera', category: 'technology' }
        ],
        images: {
          main: {
            url: '/a.jpg',
            alt: 'نموذج الشقة A',
            publicId: ''
          },
          gallery: [],
          floorPlan: {
            url: '/plans/IMG-20250406-WA0004.jpg',
            alt: 'مخطط نموذج A',
            publicId: ''
          }
        },
        status: 'active',
        isActive: true,
        order: 1,
        location: 'حي الزهراء، جدة',
        availability: 'available'
      },
      {
        name: 'B',
        title: 'نموذج B',
        subtitle: 'خلفية شرقي شمالي غربي',
        description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.',
        area: 190,
        roofArea: 190,
        totalArea: 380,
        rooms: 5,
        bathrooms: 4,
        floors: 1,
        price: {
          amount: 930000,
          currency: 'SAR',
          formatted: '930,000 ريال'
        },
        features: [
          { name: 'غرفة خادمة', icon: 'home', category: 'interior' },
          { name: 'غرفة سائق', icon: 'home', category: 'interior' },
          { name: 'شقق مودرن', icon: 'sparkles', category: 'interior' },
          { name: 'أسقف مرتفعة', icon: 'arrow-up', category: 'interior' },
          { name: 'نوافذ كبيرة', icon: 'square', category: 'interior' },
          { name: 'صالة', icon: 'home', category: 'interior' },
          { name: 'مطبخ', icon: 'chef-hat', category: 'interior' },
          { name: 'بلكونة', icon: 'home', category: 'exterior' },
          { name: 'سمارت هوم', icon: 'smartphone', category: 'technology' },
          { name: 'موقف خاص', icon: 'car', category: 'exterior' },
          { name: 'مصعد', icon: 'arrow-up-down', category: 'services' },
          { name: 'كاميرات مراقبة', icon: 'camera', category: 'technology' }
        ],
        images: {
          main: {
            url: '/b.jpg',
            alt: 'نموذج الشقة B',
            publicId: ''
          },
          gallery: [],
          floorPlan: {
            url: '/plans/IMG-20250406-WA0004.jpg',
            alt: 'مخطط نموذج B',
            publicId: ''
          }
        },
        status: 'active',
        isActive: true,
        order: 2,
        location: 'حي الزهراء، جدة',
        availability: 'available'
      },
      {
        name: 'C',
        title: 'نموذج C',
        subtitle: 'واجهة جنوبية غربية',
        description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.',
        area: 156,
        roofArea: 0,
        totalArea: 156,
        rooms: 4,
        bathrooms: 4,
        floors: 1,
        price: {
          amount: 830000,
          currency: 'SAR',
          formatted: '830,000 ريال'
        },
        features: [
          { name: 'غرفة خادمة', icon: 'home', category: 'interior' },
          { name: 'غرفة سائق', icon: 'home', category: 'interior' },
          { name: 'شقق مودرن', icon: 'sparkles', category: 'interior' },
          { name: 'أسقف مرتفعة', icon: 'arrow-up', category: 'interior' },
          { name: 'نوافذ كبيرة', icon: 'square', category: 'interior' },
          { name: 'صالة', icon: 'home', category: 'interior' },
          { name: 'مطبخ', icon: 'chef-hat', category: 'interior' },
          { name: 'بلكونة', icon: 'home', category: 'exterior' },
          { name: 'سمارت هوم', icon: 'smartphone', category: 'technology' },
          { name: 'موقف خاص', icon: 'car', category: 'exterior' },
          { name: 'مصعد', icon: 'arrow-up-down', category: 'services' },
          { name: 'كاميرات مراقبة', icon: 'camera', category: 'technology' }
        ],
        images: {
          main: {
            url: '/c.jpg',
            alt: 'نموذج الشقة C',
            publicId: ''
          },
          gallery: [],
          floorPlan: {
            url: '/plans/IMG-20250406-WA0004.jpg',
            alt: 'مخطط نموذج C',
            publicId: ''
          }
        },
        status: 'active',
        isActive: true,
        order: 3,
        location: 'حي الزهراء، جدة',
        availability: 'available'
      },
      {
        name: 'D',
        title: 'نموذج D',
        subtitle: 'ملحق شرقي شمالي',
        description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.',
        area: 180,
        roofArea: 40,
        totalArea: 220,
        rooms: 5,
        bathrooms: 5,
        floors: 1,
        price: {
          amount: 1350000,
          currency: 'SAR',
          formatted: '1,350,000 ريال'
        },
        features: [
          { name: 'غرفة خادمة', icon: 'home', category: 'interior' },
          { name: 'غرفة سائق', icon: 'home', category: 'interior' },
          { name: 'شقق مودرن', icon: 'sparkles', category: 'interior' },
          { name: 'أسقف مرتفعة', icon: 'arrow-up', category: 'interior' },
          { name: 'نوافذ كبيرة', icon: 'square', category: 'interior' },
          { name: 'صالة', icon: 'home', category: 'interior' },
          { name: 'مطبخ', icon: 'chef-hat', category: 'interior' },
          { name: 'بلكونة', icon: 'home', category: 'exterior' },
          { name: 'سمارت هوم', icon: 'smartphone', category: 'technology' },
          { name: 'موقف خاص', icon: 'car', category: 'exterior' },
          { name: 'مصعد', icon: 'arrow-up-down', category: 'services' },
          { name: 'كاميرات مراقبة', icon: 'camera', category: 'technology' },
          { name: 'اجمالي المساحة 220 متر', icon: 'home', category: 'interior' }
        ],
        images: {
          main: {
            url: '/d.jpg',
            alt: 'نموذج الشقة D',
            publicId: ''
          },
          gallery: [],
          floorPlan: {
            url: '/plans/IMG-20250406-WA0004.jpg',
            alt: 'مخطط نموذج D',
            publicId: ''
          }
        },
        status: 'active',
        isActive: true,
        order: 4,
        location: 'حي الزهراء، جدة',
        availability: 'available'
      }
    ];

    await ApartmentModel.insertMany(apartments);
    console.log('✅ تم إنشاء نماذج الشقق (4 نماذج)');
  } catch (error) {
    console.error('❌ خطأ في إنشاء نماذج الشقق:', error);
  }
};

// إنشاء مميزات المشروع
const createProjectFeatures = async () => {
  try {
    const projectFeatures = [
      {
        title: 'موقع إستراتيجي قريب من الواجهة البحرية',
        description: 'يقع المشروع في موقع استراتيجي مميز قريب من الواجهة البحرية لجدة',
        category: 'location',
        icon: { name: 'map-pin', type: 'lucide' },
        isActive: true,
        order: 1
      },
      {
        title: 'قريب من جميع الخدمات',
        description: 'المشروع محاط بجميع الخدمات الأساسية والمراكز التجارية',
        category: 'location',
        icon: { name: 'building-2', type: 'lucide' },
        isActive: true,
        order: 2
      },
      {
        title: 'ضمانات تصل إلى 25 سنة',
        description: 'نوفر ضمانات شاملة لفترات مختلفة تصل إلى 25 سنة',
        category: 'project',
        icon: { name: 'shield', type: 'lucide' },
        isActive: true,
        order: 3,
        stats: { value: '25', unit: 'سنة', label: 'ضمان' }
      },
      {
        title: 'مساحات تصل إلى 220م²',
        description: 'تتنوع مساحات الشقق لتناسب جميع الاحتياجات',
        category: 'project',
        icon: { name: 'home', type: 'lucide' },
        isActive: true,
        order: 4,
        stats: { value: '220', unit: 'م²', label: 'مساحة' }
      },
      {
        title: 'مواقف سيارات مخصصة',
        description: 'مواقف سيارات خاصة ومؤمنة لكل وحدة سكنية',
        category: 'amenities',
        icon: { name: 'car', type: 'lucide' },
        isActive: true,
        order: 5
      },
      {
        title: 'سمارت هوم',
        description: 'تقنيات ذكية متطورة لإدارة المنزل',
        category: 'technology',
        icon: { name: 'wifi', type: 'lucide' },
        isActive: true,
        order: 6
      }
    ];

    const locationFeatures = [
      {
        title: 'الشوارع الرئيسية',
        description: 'قريب من أهم الشوارع والطرق الرئيسية',
        category: 'location',
        icon: { name: 'road', type: 'custom' },
        isActive: true,
        order: 7
      },
      {
        title: 'مسجد قريب',
        description: 'يوجد مسجد قريب من المشروع',
        category: 'location',
        icon: { name: 'mosque', type: 'custom' },
        isActive: true,
        order: 8
      },
      {
        title: 'الخدمات',
        description: 'جميع الخدمات الأساسية متوفرة في المنطقة',
        category: 'services',
        icon: { name: 'store', type: 'lucide' },
        isActive: true,
        order: 9
      },
      {
        title: 'المراكز التجارية',
        description: 'قريب من أفضل المراكز التجارية في جدة',
        category: 'services',
        icon: { name: 'building-2', type: 'lucide' },
        isActive: true,
        order: 10
      },
     
    ];

    await ProjectFeature.insertMany([...projectFeatures, ...locationFeatures]);
    console.log('✅ تم إنشاء مميزات المشروع (13 ميزة)');
  } catch (error) {
    console.error('❌ خطأ في إنشاء مميزات المشروع:', error);
  }
};

// إنشاء ضمانات المشروع
const createProjectWarranties = async () => {
  try {
    const warranties = [
      {
        title: 'القواطع والأفياش',
        description: 'ضمان شامل للقواطع والأفياش الكهربائية',
        duration: { years: 20, label: 'سنة' },
        category: 'electrical',
        details: [
          { item: 'القواطع الكهربائية', coverage: 'ضمان كامل ضد العيوب', limitations: 'عدا سوء الاستخدام' },
          { item: 'المفاتيح والأفياش', coverage: 'ضمان كامل', limitations: 'عدا الأضرار الخارجية' }
        ],
        terms: [
          'يشمل الضمان العيوب في التصنيع والمواد',
          'لا يشمل الأضرار الناتجة عن سوء الاستخدام',
          'يتطلب صيانة دورية حسب التعليمات'
        ],
        isActive: true,
        order: 1
      },
      {
        title: 'الهيكل الإنشائي',
        description: 'ضمان شامل للهيكل الإنشائي للمبنى',
        duration: { years: 20, label: 'سنة' },
        category: 'structure',
        details: [
          { item: 'الأساسات', coverage: 'ضمان كامل ضد التشققات', limitations: 'عدا الكوارث الطبيعية' },
          { item: 'الجدران الحاملة', coverage: 'ضمان كامل', limitations: 'عدا التدخلات غير المصرحة' },
          { item: 'الأسقف', coverage: 'ضمان كامل ضد التسريب والتشققات' }
        ],
        terms: [
          'يشمل جميع العناصر الإنشائية الأساسية',
          'لا يشمل الأضرار الناتجة عن الكوارث الطبيعية',
          'يتطلب فحص دوري كل 5 سنوات'
        ],
        isActive: true,
        order: 2
      },
      {
        title: 'المصاعد',
        description: 'ضمان شامل لأنظمة المصاعد',
        duration: { years: 5, label: 'سنوات' },
        category: 'technology',
        details: [
          { item: 'المحرك الرئيسي', coverage: 'ضمان كامل', limitations: 'يتطلب صيانة دورية' },
          { item: 'أنظمة الأمان', coverage: 'ضمان كامل', limitations: 'حسب معايير السلامة' },
          { item: 'التحكم الإلكتروني', coverage: 'ضمان كامل للأجزاء الإلكترونية' }
        ],
        terms: [
          'يشمل جميع أجزاء المصعد',
          'يتطلب صيانة دورية شهرية',
          'خدمة صيانة 24/7'
        ],
        isActive: true,
        order: 3
      },
      {
        title: 'أعمال السباكة والكهرباء',
        description: 'ضمان لأعمال السباكة والكهرباء الداخلية',
        duration: { years: 2, label: 'سنتين' },
        category: 'plumbing',
        details: [
          { item: 'التمديدات المائية', coverage: 'ضمان ضد التسريب', limitations: 'عدا سوء الاستخدام' },
          { item: 'التمديدات الكهربائية', coverage: 'ضمان كامل', limitations: 'حسب الكود الكهربائي' },
          { item: 'الأدوات الصحية', coverage: 'ضمان المصنع' }
        ],
        terms: [
          'يشمل جميع التمديدات الداخلية',
          'لا يشمل الأدوات الإضافية',
          'يتطلب استخدام قطع غيار أصلية'
        ],
        isActive: true,
        order: 4
      },
      {
        title: 'سمارت هوم',
        description: 'ضمان لأنظمة المنزل الذكي',
        duration: { years: 2, label: 'سنتين' },
        category: 'technology',
        details: [
          { item: 'أنظمة التحكم', coverage: 'ضمان كامل للبرمجيات والأجهزة' },
          { item: 'أجهزة الاستشعار', coverage: 'ضمان المصنع + خدمة' },
          { item: 'التطبيقات', coverage: 'تحديثات مجانية لمدة سنتين' }
        ],
        terms: [
          'يشمل جميع أنظمة التحكم الذكي',
          'تحديثات البرمجيات مجانية',
          'دعم فني متخصص'
        ],
        isActive: true,
        order: 5
      },
      {
        title: 'اتحاد ملاك',
        description: 'ضمان خدمات اتحاد الملاك',
        duration: { years: 1, label: 'سنة' },
        category: 'services',
        details: [
          { item: 'إدارة المبنى', coverage: 'خدمة إدارة كاملة' },
          { item: 'الصيانة العامة', coverage: 'صيانة دورية للمناطق المشتركة' },
          { item: 'الأمن والحراسة', coverage: 'خدمة أمن على مدار الساعة' }
        ],
        terms: [
          'يشمل إدارة وصيانة المناطق المشتركة',
          'خدمات الأمن والنظافة',
          'إدارة الطوارئ والصيانة'
        ],
        isActive: true,
        order: 6
      }
    ];

    await ProjectWarranty.insertMany(warranties);
    console.log('✅ تم إنشاء ضمانات المشروع (6 ضمانات)');
  } catch (error) {
    console.error('❌ خطأ في إنشاء ضمانات المشروع:', error);
  }
};

// إنشاء معلومات المشروع
const createProjectInfo = async () => {
  try {
    const projectInfo = new ProjectInfo({
      name: 'مشروع 24',
      title: 'مشروع سكني متميز في حي الزهراء بجدة',
      subtitle: 'امتلك منزل أحلامك في أفضل مواقع جدة',
      description: 'مشروع سكني متميز يقع في حي الزهراء بجدة، يوفر شقق عصرية بمساحات متنوعة ومميزات فريدة بأسعار تنافسية تبدأ من 830,000 ريال.',
      
      location: {
        area: 'حي الزهراء',
        city: 'جدة',
        country: 'المملكة العربية السعودية',
        fullAddress: 'حي الزهراء، جدة، المملكة العربية السعودية',
        coordinates: {
          latitude: 21.60813558568744,
          longitude: 39.14033718505742
        },
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3709.430667951573!2d39.14033718505742!3d21.60813558568744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDM2JzI5LjMiTiAzOcKwMDgnMTcuMyJF!5e0!3m2!1sar!2seg!4v1752662254447!5m2!1sar!2seg',
        nearbyPlaces: [
          { name: 'الشوارع الرئيسية', type: 'road', distance: '2 دقيقة', icon: 'road' },
          { name: 'مسجد قريب', type: 'religious', distance: '1 دقيقة', icon: 'mosque' },
          { name: 'الخدمات', type: 'service', distance: '5 دقائق', icon: 'store' },
          { name: 'المراكز التجارية', type: 'shopping', distance: '10 دقائق', icon: 'shopping-bag' },
          { name: 'المطار', type: 'transport', distance: '20 دقيقة', icon: 'plane' },
          { name: 'طريق الأمير سلطان', type: 'road', distance: '5 دقائق', icon: 'route' },
          { name: 'شارع حراء', type: 'road', distance: '3 دقائق', icon: 'route' }
        ]
      },
      
      pricing: {
        startingPrice: {
          amount: 830000,
          currency: 'SAR',
          formatted: '830,000 ريال'
        },
        priceRange: {
          min: 830000,
          max: 1350000
        },
        paymentPlans: [
          {
            name: 'خطة الدفع المرن',
            description: 'إمكانية التقسيط على فترات مريحة',
            terms: ['دفعة أولى 20%', 'باقي المبلغ على أقساط', 'بدون فوائد']
          }
        ]
      },
      
      specifications: {
        totalUnits: 48,
        unitTypes: 4,
        buildingHeight: '4 طوابق',
        constructionYear: '2024',
        deliveryDate: '2025',
        projectStatus: 'construction'
      },
      
      contact: {
        phones: [
          { number: '0555812257', platform: 'meta', isWhatsApp: true },
          { number: '0543766262', platform: 'snapchat', isWhatsApp: true },
          { number: '0539488805', platform: 'tiktok', isWhatsApp: true },
          { number: '0552845403', platform: 'google', isWhatsApp: true },
          { number: '0536667967', platform: 'default', isWhatsApp: true }
        ],
        email: '24_project@raf-advanced.sa',
        website: 'https://project24.raf-advanced.sa'
      },
      
      branding: {
        logo: {
          url: '/logo.jpg',
          alt: 'شعار مشروع 24'
        },
        colors: {
          primary: '#c48765',
          secondary: '#34222e'
        }
      },
      
      seo: {
        metaTitle: 'مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة',
        metaDescription: 'مشروع سكني متميز في حي الزهراء بجدة بأسعار استثنائية تبدأ من 830000 ﷼ فقط',
        keywords: ['مشروع 24', 'حي الزهراء', 'جدة', 'منزل العمر', 'سكني', 'أسعار استثنائية', '830000 ﷼', 'امتلك منزل العمر في جدة']
      },
      
      settings: {
        isActive: true,
        maintenanceMode: false,
        showPrices: true,
        allowInquiries: true
      }
    });

    await projectInfo.save();
    console.log('✅ تم إنشاء معلومات المشروع');
  } catch (error) {
    console.error('❌ خطأ في إنشاء معلومات المشروع:', error);
  }
};

// إنشاء صور المشروع
const createProjectMedia = async () => {
  try {
    const ProjectMedia = require('../models/ProjectMedia');
    
    const mediaItems = [
      {
        title: 'صورة المشروع 1',
        description: 'منظر خارجي للمشروع',
        mediaType: 'image',
        category: 'project-photos',
        file: {
          url: '/1.jpg',
          originalName: '1.jpg',
          fileSize: 500000,
          mimeType: 'image/jpeg',
          dimensions: {
            width: 1200,
            height: 800
          }
        },
        alt: 'صورة المشروع الخارجية',
        isActive: true,
        order: 1
      },
      {
        title: 'صورة المشروع 2',
        description: 'منظر خارجي آخر للمشروع',
        mediaType: 'image',
        category: 'project-photos',
        file: {
          url: '/2.jpg',
          originalName: '2.jpg',
          fileSize: 500000,
          mimeType: 'image/jpeg',
          dimensions: {
            width: 1200,
            height: 800
          }
        },
        alt: 'صورة المشروع الخارجية 2',
        isActive: true,
        order: 2
      },
      {
        title: 'صورة المشروع 3',
        description: 'منظر داخلي للمشروع',
        mediaType: 'image',
        category: 'project-photos',
        file: {
          url: '/3.jpg',
          originalName: '3.jpg',
          fileSize: 500000,
          mimeType: 'image/jpeg',
          dimensions: {
            width: 1200,
            height: 800
          }
        },
        alt: 'صورة المشروع الداخلية',
        isActive: true,
        order: 3
      },
      {
        title: 'صورة المشروع 4',
        description: 'مرافق المشروع',
        mediaType: 'image',
        category: 'project-photos',
        file: {
          url: '/4.jpg',
          originalName: '4.jpg',
          fileSize: 500000,
          mimeType: 'image/jpeg',
          dimensions: {
            width: 1200,
            height: 800
          }
        },
        alt: 'مرافق المشروع',
        isActive: true,
        order: 4
      },
      {
        title: 'صورة المشروع 5',
        description: 'منظر شامل للمشروع',
        mediaType: 'image',
        category: 'project-photos',
        file: {
          url: '/5.jpg',
          originalName: '5.jpg',
          fileSize: 500000,
          mimeType: 'image/jpeg',
          dimensions: {
            width: 1200,
            height: 800
          }
        },
        alt: 'منظر شامل للمشروع',
        isActive: true,
        order: 5
      }
    ];

    for (const mediaData of mediaItems) {
      const media = new ProjectMedia(mediaData);
      await media.save();
    }

    console.log('✅ تم إنشاء صور المشروع (5 صور)');
  } catch (error) {
    console.error('❌ خطأ في إنشاء صور المشروع:', error);
  }
};

// تشغيل السكريبت
const runSeed = async () => {
  console.log('🌱 بدء تهيئة قاعدة البيانات...\n');
  
  await connectDB();
  
  console.log('🧹 تنظيف قاعدة البيانات...');
  await clearDatabase();
  
  console.log('\n📝 إنشاء البيانات الأولية...');
  await createAdmin();
  await createApartmentModels();
  await createProjectFeatures();
  await createProjectWarranties();
  await createProjectInfo();
  await createProjectMedia();
  
  console.log('\n✅ تم الانتهاء من تهيئة قاعدة البيانات بنجاح!');
  console.log('\n📊 ملخص البيانات المنشأة:');
  console.log('👤 1 مدير أساسي');
  console.log('🏠 4 نماذج شقق');
  console.log('⭐ 13 ميزة للمشروع');
  console.log('🛡️ 6 ضمانات');
  console.log('ℹ️ 1 معلومات المشروع');
  console.log('📸 5 صور للمشروع');
  
  console.log('\n🔐 بيانات تسجيل الدخول:');
  console.log('📧 البريد الإلكتروني: admin@project24.sa');
  console.log('🔑 كلمة المرور: Admin@2024!');
  
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
runSeed();
