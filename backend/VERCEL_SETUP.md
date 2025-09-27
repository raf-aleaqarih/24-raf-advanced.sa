# 🚀 إعداد Vercel للـ Backend

## ✅ التكوين الحالي

### 1. ملف `vercel.json` مبسط
```json
{
  "version": 2
}
```

### 2. ملف `api/index.js` جاهز
- يحتوي على جميع الـ routes
- Express app كامل
- Error handling
- CORS و Security

### 3. ملف `package.json` محدث
- إضافة `build` script
- Node.js 18+ requirement

## 🚀 خطوات الرفع

### 1. رفع المشروع
```bash
vercel
```

### 2. رفع للإنتاج
```bash
vercel --prod
```

## 🔧 إعداد متغيرات البيئة

في Vercel Dashboard:
1. اذهب إلى Project Settings
2. Environment Variables
3. أضف:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

## 🧪 اختبار الرفع

```bash
# Health Check
curl https://your-app.vercel.app/health

# Status
curl https://your-app.vercel.app/status

# API
curl https://your-app.vercel.app/api/project-info/homepage
```

## 📊 النتائج المتوقعة

- ✅ Health endpoint يعمل
- ✅ Status endpoint يعمل  
- ✅ جميع API endpoints تعمل
- ✅ Database connection يعمل
- ✅ Authentication يعمل

---

**ملاحظة**: التكوين مبسط لضمان التوافق مع Vercel serverless functions.
