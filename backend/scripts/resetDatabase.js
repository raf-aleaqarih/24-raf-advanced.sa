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

// حذف جميع الـ collections
const dropAllCollections = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`✅ تم حذف collection: ${collection.name}`);
    }
    
    console.log('✅ تم حذف جميع الـ collections');
  } catch (error) {
    console.error('❌ خطأ في حذف الـ collections:', error);
  }
};

// تشغيل السكريبت
const runReset = async () => {
  console.log('🗑️ إعادة تعيين قاعدة البيانات...\n');
  
  await connectDB();
  
  console.log('🧹 حذف جميع الـ collections...');
  await dropAllCollections();
  
  console.log('\n✅ تم إعادة تعيين قاعدة البيانات بنجاح!');
  console.log('💡 يمكنك الآن تشغيل سكريبت تحديث البيانات');
  
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
runReset();