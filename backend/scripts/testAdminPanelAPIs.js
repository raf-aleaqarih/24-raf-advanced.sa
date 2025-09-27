require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://backend-one-pi-32.vercel.app/api';
const ADMIN_PANEL_URL = 'http://localhost:3001';

// اختبار صحة الاتصال
const testConnections = async () => {
  console.log('🔗 اختبار الاتصالات...\n');
  
  try {
    // اختبار الباك إند
    const backendResponse = await axios.get(`${API_URL.replace('/api', '')}/health`);
    if (backendResponse.data.success) {
      console.log('✅ الباك إند: متصل ويعمل');
    }
  } catch (error) {
    console.log('❌ الباك إند: غير متاح');
    return false;
  }
  
  try {
    // اختبار لوحة التحكم
    const adminResponse = await axios.get(ADMIN_PANEL_URL);
    if (adminResponse.status === 200) {
      console.log('✅ لوحة التحكم: متصلة وتعمل');
    }
  } catch (error) {
    console.log('❌ لوحة التحكم: غير متاحة');
    return false;
  }
  
  console.log('');
  return true;
};

// اختبار APIs العامة (بدون مصادقة)
const testPublicAPIs = async () => {
  console.log('🌐 اختبار APIs العامة...\n');
  
  const tests = [
    {
      name: 'بيانات الصفحة الرئيسية',
      url: `${API_URL}/project-info/homepage`,
      expectedFields: ['projectInfo', 'apartmentModels', 'projectFeatures']
    },
    {
      name: 'معلومات المشروع',
      url: `${API_URL}/project-info/info`,
      expectedFields: ['projectName', 'location']
    },
    {
      name: 'نماذج الشقق',
      url: `${API_URL}/apartments/public`,
      expectedFields: ['modelName', 'price', 'area']
    },
    {
      name: 'مميزات المشروع',
      url: `${API_URL}/project/features`,
      expectedFields: ['title', 'featureType']
    },
    {
      name: 'ضمانات المشروع',
      url: `${API_URL}/project/warranties`,
      expectedFields: ['title', 'category']
    },
    {
      name: 'إعدادات التواصل',
      url: `${API_URL}/project-info/contact-settings`,
      expectedFields: ['phoneNumbers', 'welcomeMessages']
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      
      if (response.data.success) {
        const data = response.data.data;
        let hasExpectedFields = true;
        
        if (Array.isArray(data)) {
          if (data.length > 0) {
            hasExpectedFields = test.expectedFields.every(field => 
              data[0].hasOwnProperty(field)
            );
          }
        } else {
          hasExpectedFields = test.expectedFields.every(field => 
            data.hasOwnProperty(field)
          );
        }
        
        if (hasExpectedFields) {
          console.log(`✅ ${test.name}: يعمل بشكل صحيح`);
          passedTests++;
        } else {
          console.log(`⚠️ ${test.name}: يعمل لكن بعض الحقول مفقودة`);
        }
      } else {
        console.log(`❌ ${test.name}: فشل - ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: خطأ في الاتصال - ${error.message}`);
    }
  }
  
  console.log(`\n📊 النتيجة: ${passedTests}/${tests.length} اختبارات نجحت\n`);
  return passedTests === tests.length;
};

// اختبار تسجيل الدخول
const testLogin = async () => {
  console.log('🔐 اختبار تسجيل الدخول...\n');
  
  try {
    const loginData = {
      email: 'admin@project24.sa',
      password: 'Admin@2024!'
    };
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    if (response.data.success && response.data.data.token) {
      console.log('✅ تسجيل الدخول: نجح');
      console.log(`👤 المدير: ${response.data.data.admin.name}`);
      console.log(`🔐 الدور: ${response.data.data.admin.role}`);
      console.log(`🎫 التوكن: ${response.data.data.token.substring(0, 20)}...`);
      
      return response.data.data.token;
    } else {
      console.log('❌ تسجيل الدخول: فشل');
      return null;
    }
  } catch (error) {
    console.log(`❌ تسجيل الدخول: خطأ - ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// اختبار APIs مع المصادقة
const testAuthenticatedAPIs = async (token) => {
  console.log('\n🔒 اختبار APIs مع المصادقة...\n');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const tests = [
    {
      name: 'جلب جميع الشقق (مع مصادقة)',
      method: 'GET',
      url: `${API_URL}/apartments`
    },
    {
      name: 'إحصائيات المشروع',
      method: 'GET',
      url: `${API_URL}/project/stats`
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        headers
      });
      
      if (response.data.success) {
        console.log(`✅ ${test.name}: يعمل بشكل صحيح`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: فشل - ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: خطأ - ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 النتيجة: ${passedTests}/${tests.length} اختبارات نجحت\n`);
  return passedTests === tests.length;
};

// اختبار إنشاء بيانات جديدة
const testCRUDOperations = async (token) => {
  console.log('⚙️ اختبار عمليات CRUD...\n');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  let testsPassed = 0;
  let totalTests = 0;
  
  // اختبار إنشاء ميزة جديدة
  try {
    totalTests++;
    const newFeature = {
      title: 'ميزة اختبار',
      description: 'هذه ميزة للاختبار فقط',
      icon: 'TestIcon',
      featureType: 'project',
      category: 'test',
      displayOrder: 999,
      status: 'active',
      isVisible: true
    };
    
    const createResponse = await axios.post(`${API_URL}/project/features`, newFeature, { headers });
    
    if (createResponse.data.success) {
      console.log('✅ إنشاء ميزة جديدة: نجح');
      testsPassed++;
      
      // اختبار تحديث الميزة
      totalTests++;
      const featureId = createResponse.data.data._id;
      const updateData = { title: 'ميزة اختبار محدثة' };
      
      const updateResponse = await axios.put(`${API_URL}/project/features/${featureId}`, updateData, { headers });
      
      if (updateResponse.data.success) {
        console.log('✅ تحديث الميزة: نجح');
        testsPassed++;
      } else {
        console.log('❌ تحديث الميزة: فشل');
      }
      
      // اختبار حذف الميزة
      totalTests++;
      const deleteResponse = await axios.delete(`${API_URL}/project/features/${featureId}`, { headers });
      
      if (deleteResponse.data.success) {
        console.log('✅ حذف الميزة: نجح');
        testsPassed++;
      } else {
        console.log('❌ حذف الميزة: فشل');
      }
    } else {
      console.log('❌ إنشاء ميزة جديدة: فشل');
    }
  } catch (error) {
    console.log(`❌ عمليات CRUD للمميزات: خطأ - ${error.response?.data?.message || error.message}`);
  }
  
  console.log(`\n📊 نتيجة CRUD: ${testsPassed}/${totalTests} عمليات نجحت\n`);
  return testsPassed === totalTests;
};

// عرض ملخص النتائج
const displaySummary = (results) => {
  console.log('📋 ملخص نتائج الاختبار:');
  console.log('========================\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log(`\n🎯 النتيجة الإجمالية: ${passed}/${total} اختبارات نجحت`);
  
  if (passed === total) {
    console.log('\n🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
  } else {
    console.log('\n⚠️ بعض الاختبارات فشلت. يرجى مراجعة الأخطاء أعلاه.');
  }
  
  console.log('\n📱 روابط مهمة:');
  console.log(`🔗 لوحة التحكم: ${ADMIN_PANEL_URL}/login`);
  console.log(`📧 البريد الإلكتروني: admin@project24.sa`);
  console.log(`🔑 كلمة المرور: Admin@2024!`);
};

// تشغيل جميع الاختبارات
const runAllTests = async () => {
  console.log('🧪 بدء اختبار شامل للنظام...\n');
  console.log('================================\n');
  
  const results = [];
  
  // اختبار الاتصالات
  const connectionsOk = await testConnections();
  results.push({ name: 'الاتصالات الأساسية', passed: connectionsOk });
  
  if (!connectionsOk) {
    console.log('❌ فشل في الاتصالات الأساسية. توقف الاختبار.');
    displaySummary(results);
    return;
  }
  
  // اختبار APIs العامة
  const publicAPIsOk = await testPublicAPIs();
  results.push({ name: 'APIs العامة', passed: publicAPIsOk });
  
  // اختبار تسجيل الدخول
  const token = await testLogin();
  const loginOk = token !== null;
  results.push({ name: 'تسجيل الدخول', passed: loginOk });
  
  if (loginOk) {
    // اختبار APIs مع المصادقة
    const authAPIsOk = await testAuthenticatedAPIs(token);
    results.push({ name: 'APIs مع المصادقة', passed: authAPIsOk });
    
    // اختبار عمليات CRUD
    const crudOk = await testCRUDOperations(token);
    results.push({ name: 'عمليات CRUD', passed: crudOk });
  }
  
  // عرض الملخص
  displaySummary(results);
};

// تشغيل الاختبار
runAllTests().catch(error => {
  console.error('❌ خطأ عام في الاختبار:', error.message);
  process.exit(1);
});
