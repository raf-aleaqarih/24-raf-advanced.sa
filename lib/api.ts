import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-one-pi-32.vercel.app/api'

// إنشاء instance من axios للموقع العام
const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor للتعامل مع الاستجابات والأخطاء
publicApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend not running or network error. Using fallback data.')
      // إرجاع استجابة وهمية للتطوير
      return Promise.resolve({
        data: {
          success: true,
          data: null,
          message: 'Backend not available, using fallback'
        }
      })
    }
    
    // معالجة أخطاء HTTP
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - API may require authentication')
      return Promise.resolve({
        data: {
          success: false,
          data: null,
          message: 'Unauthorized access'
        }
      })
    }
    
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded - too many requests')
      return Promise.resolve({
        data: {
          success: false,
          data: null,
          message: 'Rate limit exceeded'
        }
      })
    }
    
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Project API للموقع العام
export const publicProjectApi = {
  // جلب معلومات المشروع
  getInfo: () =>
    publicApi.get('/project/info'),
  
  // جلب مميزات المشروع
  getFeatures: () =>
    publicApi.get('/project/features'),
  
  // جلب ضمانات المشروع
  getWarranties: () =>
    publicApi.get('/project/warranties'),
  
  // جلب إحصائيات عامة
  getPublicStats: () =>
    publicApi.get('/project/public-stats'),
  
  // جلب جميع بيانات التواصل (أرقام الهواتف ورسائل الترحيب)
  getContactData: () =>
    publicApi.get('/project-info/contact-data'),
}

// Apartments API للموقع العام
export const publicApartmentsApi = {
  // جلب جميع نماذج الشقق
  getAll: (params?: any) =>
    publicApi.get('/apartments/public', { params }),
  
  // جلب نموذج شقة بالـ ID
  getById: (id: string) =>
    publicApi.get(`/apartments/public/${id}`),
  
  // جلب نموذج شقة بالاسم
  getByName: (name: string) =>
    publicApi.get(`/apartments/public/name/${name}`),
}

// Media API للموقع العام
export const publicMediaApi = {
  // جلب صور المشروع
  getProjectImages: (category?: string) =>
    publicApi.get('/media/public/project-images', { 
      params: category ? { category } : undefined 
    }),
  
  // جلب فيديوهات المشروع
  getProjectVideos: () =>
    publicApi.get('/media/public/project-videos'),
  
  // جلب صور الشقق
  getApartmentImages: (apartmentId: string) =>
    publicApi.get(`/media/public/apartment/${apartmentId}`),
}

// Inquiries API للموقع العام
export const publicInquiriesApi = {
  // إرسال استفسار جديد
  create: (data: {
    name: string
    phone: string
    message?: string
    source?: string
    platform?: string
    apartmentId?: string
    interestedIn?: string
    status?: string
    priority?: string
    utmParams?: {
      source?: string
      medium?: string
      campaign?: string
      term?: string
      content?: string
    }
  }) =>
    publicApi.post('/inquiries', data),
  
  // تتبع استفسار
  track: (trackingId: string) =>
    publicApi.get(`/inquiries/track/${trackingId}`),
}

// Location Features API للموقع العام
export const publicLocationFeaturesApi = {
  // جلب جميع مميزات الموقع
  getAll: () =>
    publicApi.get('/public/location-features'),
  
  // جلب مميزات الموقع حسب الفئة
  getByCategory: (category: string) =>
    publicApi.get(`/location-features/category/${category}`),
}

// Analytics API للموقع العام (للتتبع)
export const publicAnalyticsApi = {
  // تسجيل مشاهدة صفحة
  trackPageView: (data: {
    page: string
    source?: string
    platform?: string
    userAgent?: string
    referrer?: string
  }) =>
    publicApi.post('/analytics/page-view', data),
  
  // تسجيل تفاعل
  trackInteraction: (data: {
    type: string
    element: string
    page?: string
    data?: any
  }) =>
    publicApi.post('/analytics/interaction', data),
  
  // تسجيل تحويل
  trackConversion: (data: {
    type: string
    source?: string
    platform?: string
    value?: number
  }) =>
    publicApi.post('/analytics/conversion', data),
}

export default publicApi
