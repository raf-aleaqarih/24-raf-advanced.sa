# دليل تكامل معرض الصور

## نظرة عامة

تم تطوير نظام متكامل لإدارة معرض الصور يربط بين لوحة التحكم والموقع الرئيسي من خلال API موحد.

## المكونات الرئيسية

### 1. لوحة التحكم (Admin Panel)

#### معرض الصور (`admin-panel/app/dashboard/gallery/page.tsx`)
- إدارة شاملة لصور المشروع
- رفع صور متعددة
- تعديل وحذف الصور
- تنظيم الصور حسب الفئات

#### مكون إدارة المعرض (`admin-panel/components/GalleryManager.tsx`)
- مكون قابل للإعادة الاستخدام
- دعم رفع الصور
- عرض الصور في شبكة أو قائمة
- بحث وتصفية الصور

#### مكون اختيار الصور (`admin-panel/components/ImageSelector.tsx`)
- اختيار صورة واحدة من المعرض
- معاينة الصورة المختارة
- بحث في الصور

### 2. الموقع الرئيسي

#### معرض الصور (`components/ProjectImagesGallery.tsx`)
- عرض صور المشروع من API
- تصميم متجاوب
- تنقل سلس بين الصور
- صور احتياطية في حالة فشل API

#### مكون اختيار الصور (`components/ImageGallerySelector.tsx`)
- اختيار الصور من المعرض العام
- واجهة مستخدم بسيطة
- بحث في الصور

### 3. API والبيانات

#### API للوسائط (`lib/api.ts`)
```typescript
export const publicMediaApi = {
  getProjectImages: (category?: string) => 
    publicApi.get('/media/public/project-images', { 
      params: category ? { category } : undefined 
    }),
}
```

#### API في لوحة التحكم (`admin-panel/lib/api.ts`)
```typescript
export const mediaApi = {
  getAll: (params?: any) => api.get('/media', { params }),
  uploadMultiple: (formData: FormData) => api.post('/media/upload-multiple', formData),
  update: (id: string, data: any) => api.put(`/media/${id}`, data),
  delete: (id: string) => api.delete(`/media/${id}`),
}
```

## كيفية الاستخدام

### 1. في لوحة التحكم

#### إدارة الصور (صفحة المعرض)
```tsx
// admin-panel/app/dashboard/gallery/page.tsx
import GalleryManager from '../../../components/GalleryManager'

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">صور المشروع</h1>
          <p className="page-subtitle">
            إدارة صور المشروع - رفع، تعديل، وتنظيم
          </p>
        </div>
      </div>

      <GalleryManager 
        showUpload={true}
        category="project-photos"
      />
    </div>
  )
}
```

#### اختيار صورة في نماذج أخرى
```tsx
import ImageSelector from '../components/ImageSelector'

function MyForm() {
  const [selectedImage, setSelectedImage] = useState(null)
  
  return (
    <ImageSelector
      onImageSelect={setSelectedImage}
      selectedImageId={selectedImage?._id}
      category="project-photos"
    />
  )
}
```

### 2. في الموقع الرئيسي

#### عرض معرض الصور
```tsx
import ProjectImagesGallery from '../components/ProjectImagesGallery'

function HomePage() {
  return (
    <ProjectImagesGallery isVisible={true} />
  )
}
```

#### اختيار صورة من المعرض
```tsx
import ImageGallerySelector from '../components/ImageGallerySelector'

function MyComponent() {
  const [selectedImage, setSelectedImage] = useState(null)
  
  return (
    <ImageGallerySelector
      onImageSelect={setSelectedImage}
      selectedImageId={selectedImage?._id}
      category="project-photos"
    />
  )
}
```

## إعدادات البيئة

تأكد من وجود متغير البيئة التالي:

```env
NEXT_PUBLIC_API_URL=https://backend-one-pi-32.vercel.app/api
```

## هيكل البيانات

### واجهة الصورة
```typescript
interface ProjectImage {
  _id: string
  title: string
  description: string
  file?: {
    url: string
    originalName: string
    dimensions?: {
      width: number
      height: number
    }
  }
  alt: string
  category: string
  isActive: boolean
  createdAt?: string | Date
}
```

## الميزات

### 1. رفع الصور
- دعم رفع متعدد
- تحقق من نوع الملف
- معاينة الصور قبل الرفع
- شريط تقدم للرفع

### 2. إدارة الصور
- تعديل معلومات الصورة
- حذف الصور
- تفعيل/إلغاء تفعيل الصور
- تنظيم الصور حسب الفئات

### 3. البحث والتصفية
- بحث في أسماء الصور
- بحث في أوصاف الصور
- تصفية حسب الفئة
- ترتيب حسب التاريخ

### 4. واجهة المستخدم
- تصميم متجاوب
- تحميل تدريجي
- رسائل خطأ واضحة
- صور احتياطية

## استكشاف الأخطاء

### 1. مشاكل الاتصال بـ API
```bash
# تحقق من متغير البيئة
echo $NEXT_PUBLIC_API_URL

# اختبار API مباشرة
curl https://backend-one-pi-32.vercel.app/api/media/public/project-images
```

**الحلول:**
- تحقق من `NEXT_PUBLIC_API_URL` في ملف `.env`
- تأكد من تشغيل خادم API على المنفذ الصحيح
- تحقق من إعدادات CORS في الخادم

### 2. مشاكل رفع الصور
**الأخطاء الشائعة:**
- `File too large`: حجم الملف أكبر من المسموح
- `Invalid file type`: نوع الملف غير مدعوم
- `Upload failed`: فشل في رفع الملف

**الحلول:**
- تحقق من حجم الملف (أقصى 10 ميجابايت)
- تأكد من نوع الملف (JPG, PNG, GIF فقط)
- تحقق من صلاحيات الخادم ومساحة التخزين

### 3. مشاكل عرض الصور
**الأعراض:**
- الصور لا تظهر
- رسائل خطأ في وحدة التحكم
- صور مكسورة

**الحلول:**
- تحقق من روابط الصور في قاعدة البيانات
- تأكد من إعدادات Cloudinary
- تحقق من حالة الصور (isActive = true)
- تحقق من اتصال الإنترنت

### 4. مشاكل في لوحة التحكم
**خطأ `useRef is not defined`:**
```tsx
// تأكد من استيراد useRef
import { useState, useEffect, useRef } from 'react'
```

**خطأ في الأيقونات:**
```tsx
// تأكد من استيراد جميع الأيقونات المطلوبة
import { 
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  // ... باقي الأيقونات
} from '@heroicons/react/24/outline'
```

### 5. اختبار النظام
```javascript
// استخدم ملف test-gallery-api.js للاختبار
node test-gallery-api.js
```

## التطوير المستقبلي

### 1. ميزات إضافية
- تحرير الصور
- ضغط الصور التلقائي
- دعم الفيديو
- معرض ثلاثي الأبعاد

### 2. تحسينات الأداء
- تحميل تدريجي للصور
- ضغط الصور
- CDN للصور
- تخزين مؤقت ذكي

### 3. تحسينات الأمان
- التحقق من نوع الملف
- فحص الفيروسات
- تقييد حجم الملف
- تشفير الصور الحساسة
