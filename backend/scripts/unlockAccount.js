require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    process.exit(1);
  }
};

const unlockAccount = async () => {
  try {
    console.log('🔓 بدء عملية إلغاء قفل الحساب...');
    
    // البحث عن الحساب المقفل
    const lockedAdmins = await Admin.find({
      $or: [
        { lockoutUntil: { $exists: true, $ne: null } },
        { loginAttempts: { $gt: 0 } }
      ]
    });

    if (lockedAdmins.length === 0) {
      console.log('✅ لا توجد حسابات مقفلة');
      return;
    }

    console.log(`🔍 تم العثور على ${lockedAdmins.length} حساب مقفل:`);
    
    for (const admin of lockedAdmins) {
      console.log(`   - ${admin.name} (${admin.email})`);
      console.log(`     محاولات الدخول: ${admin.loginAttempts}`);
      if (admin.lockoutUntil) {
        console.log(`     تاريخ انتهاء القفل: ${admin.lockoutUntil}`);
      }
    }

    // إلغاء قفل جميع الحسابات
    const result = await Admin.updateMany(
      {
        $or: [
          { lockoutUntil: { $exists: true, $ne: null } },
          { loginAttempts: { $gt: 0 } }
        ]
      },
      {
        $unset: { 
          lockoutUntil: 1, 
          loginAttempts: 1 
        }
      }
    );

    console.log(`✅ تم إلغاء قفل ${result.modifiedCount} حساب بنجاح`);
    
    // التحقق من النتيجة
    const remainingLocked = await Admin.find({
      $or: [
        { lockoutUntil: { $exists: true, $ne: null } },
        { loginAttempts: { $gt: 0 } }
      ]
    });

    if (remainingLocked.length === 0) {
      console.log('🎉 تم إلغاء قفل جميع الحسابات بنجاح!');
    } else {
      console.log(`⚠️  لا يزال هناك ${remainingLocked.length} حساب مقفل`);
    }

  } catch (error) {
    console.error('❌ خطأ في إلغاء قفل الحساب:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
  }
};

// تشغيل السكريبت
connectDB().then(() => {
  unlockAccount();
});
