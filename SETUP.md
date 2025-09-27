# إعداد المشروع

## متغيرات البيئة المطلوبة

أنشئ ملف `.env.local` في المجلد الجذر وأضف المتغيرات التالية:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Configuration (Hostinger)
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password

# API Configuration
NEXT_PUBLIC_API_URL=https://backend-one-pi-32.vercel.app/api
```

## إعداد Cloudinary

1. سجل في [Cloudinary](https://cloudinary.com)
2. احصل على `Cloud Name` من لوحة التحكم
3. أنشئ `Upload Preset` جديد:
   - اذهب إلى Settings > Upload
   - أنشئ preset جديد
   - اختر "Unsigned" للرفع المباشر
   - أضف `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` في ملف البيئة

## إعداد Google Maps

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل Google Maps JavaScript API
4. أنشئ API Key
5. أضف `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` في ملف البيئة

## إعداد البريد الإلكتروني (Hostinger)

1. اذهب إلى لوحة تحكم Hostinger
2. اختر "Email Accounts"
3. أنشئ حساب بريد إلكتروني جديد
4. احصل على كلمة المرور
5. أضف `EMAIL_USER` و `EMAIL_PASS` في ملف البيئة

## المكونات الجديدة

### 1. ApartmentsSection
- يعرض نماذج الشقق من API
- تصميم responsive مع grid layout
- أزرار للاستفسار عن كل نموذج

### 2. MapSection  
- يعرض موقع المشروع على الخريطة
- معلومات المطور والاتصال
- تكامل مع Google Maps

### 3. ImageUpload
- رفع الصور إلى Cloudinary
- دعم السحب والإفلات
- معاينة الصور قبل الرفع

### 4. ImageCarousel
- عرض الصور في carousel
- وضع ملء الشاشة
- أزرار التنقل

## التحديثات المنجزة

✅ إزالة صفحة الاستفسارات بالكامل
✅ إصلاح النموذج لإرسال مباشرة إلى Hostinger
✅ إنشاء مكون عرض النماذج
✅ إنشاء مكون الخريطة
✅ إنشاء مكون رفع الصور
✅ إنشاء مكون عرض الصور
✅ تحديث الصفحة الرئيسية
