import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-one-pi-32.vercel.app/api'

// إنشاء instance من axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor لإضافة التوكن للطلبات
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor للتعامل مع الاستجابات والأخطاء
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const original = error.config

    // إذا كان الخطأ 401 والطلب لم يتم إعادة محاولته
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = Cookies.get('admin_refresh_token')
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          })

          if (response.data.success) {
            const { token, refreshToken: newRefreshToken } = response.data.data
            
            // تحديث التوكنز
            Cookies.set('admin_token', token, { expires: 7 })
            Cookies.set('admin_refresh_token', newRefreshToken, { expires: 30 })
            
            // إعادة الطلب الأصلي
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          }
        }
      } catch (refreshError) {
        // فشل في تجديد التوكن، تسجيل الخروج
        Cookies.remove('admin_token')
        Cookies.remove('admin_refresh_token')
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  verify: () =>
    api.get('/auth/verify'),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: any) => {
    const formData = new FormData()
    
    // إضافة البيانات النصية
    if (data.name) formData.append('name', data.name)
    if (data.phone) formData.append('phone', data.phone)
    if (data.department) formData.append('department', data.department)
    if (data.bio) formData.append('bio', data.bio)
    
    // إضافة الصورة إذا كانت موجودة
    if (data.avatar) {
      formData.append('avatar', data.avatar)
    }
    
    return api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
}

// Apartments API
export const apartmentsApi = {
  getAll: (params?: any) =>
    api.get('/apartments', { params }),
  
  getAllPublic: (params?: any) =>
    api.get('/apartments/public', { params }),
  
  getById: (id: string) =>
    api.get(`/apartments/${id}`),
  
  create: (data: any) => {
    const formData = new FormData()
    
    // إضافة البيانات النصية
    Object.keys(data).forEach(key => {
      if (key !== 'mainImage' && key !== 'galleryImages' && key !== 'floorPlan' && key !== 'images') {
        if (typeof data[key] === 'object') {
          // معالجة خاصة للمميزات
          if (key === 'features' && Array.isArray(data[key])) {
            // إرسال كل ميزة كحقل منفصل
            data[key].forEach((feature: string, index: number) => {
              formData.append(`features[${index}]`, feature)
            })
          } else {
            formData.append(key, JSON.stringify(data[key]))
          }
        } else {
          formData.append(key, data[key])
        }
      }
    })
    
    // إضافة الصور - دعم متعدد الأشكال
    if (data.mainImage) {
      formData.append('mainImage', data.mainImage)
    }
    
    if (data.galleryImages) {
      data.galleryImages.forEach((file: File) => {
        formData.append('galleryImages', file)
      })
    }
    
    if (data.floorPlan) {
      formData.append('floorPlan', data.floorPlan)
    }
    
    // دعم مصفوفة الصور الجديدة
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((image: any, index: number) => {
        if (image instanceof File) {
          formData.append('images', image)
        } else if (image.url && image.url.startsWith('data:')) {
          // تحويل base64 إلى File
          const byteString = atob(image.url.split(',')[1])
          const mimeString = image.url.split(',')[0].split(':')[1].split(';')[0]
          const arrayBuffer = new ArrayBuffer(byteString.length)
          const uint8Array = new Uint8Array(arrayBuffer)
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i)
          }
          const file = new File([arrayBuffer], image.alt || `image-${index}.jpg`, { type: mimeString })
          formData.append('images', file)
        } else if (image.url && image.url.startsWith('http') && image.url.includes('cloudinary.com')) {
          // إرسال URL Cloudinary فقط
          formData.append('images', image.url)
        } else if (image.url && image.url.startsWith('/')) {
          // تجاهل الروابط المحلية
          console.warn('تم تجاهل رابط محلي:', image.url)
        }
      })
    }
    
    return api.post('/apartments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  update: (id: string, data: any) => {
    const formData = new FormData()
    
    // إضافة البيانات النصية
    Object.keys(data).forEach(key => {
      if (key !== 'mainImage' && key !== 'galleryImages' && key !== 'floorPlan' && key !== 'images') {
        if (typeof data[key] === 'object') {
          // معالجة خاصة للمميزات
          if (key === 'features' && Array.isArray(data[key])) {
            // إرسال كل ميزة كحقل منفصل
            data[key].forEach((feature: string, index: number) => {
              formData.append(`features[${index}]`, feature)
            })
          } else {
            formData.append(key, JSON.stringify(data[key]))
          }
        } else {
          formData.append(key, data[key])
        }
      }
    })
    
    // إضافة الصور - دعم متعدد الأشكال
    if (data.mainImage) {
      formData.append('mainImage', data.mainImage)
    }
    
    if (data.galleryImages) {
      data.galleryImages.forEach((file: File) => {
        formData.append('galleryImages', file)
      })
    }
    
    if (data.floorPlan) {
      formData.append('floorPlan', data.floorPlan)
    }
    
    // دعم مصفوفة الصور الجديدة
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((image: any, index: number) => {
        if (image instanceof File) {
          formData.append('images', image)
        } else if (image.url && image.url.startsWith('data:')) {
          // تحويل base64 إلى File
          const byteString = atob(image.url.split(',')[1])
          const mimeString = image.url.split(',')[0].split(':')[1].split(';')[0]
          const arrayBuffer = new ArrayBuffer(byteString.length)
          const uint8Array = new Uint8Array(arrayBuffer)
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i)
          }
          const file = new File([arrayBuffer], image.alt || `image-${index}.jpg`, { type: mimeString })
          formData.append('images', file)
        } else if (image.url && image.url.startsWith('http') && image.url.includes('cloudinary.com')) {
          // إرسال URL Cloudinary فقط
          formData.append('images', image.url)
        } else if (image.url && image.url.startsWith('/')) {
          // تجاهل الروابط المحلية
          console.warn('تم تجاهل رابط محلي:', image.url)
        }
      })
    }
    
    return api.put(`/apartments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  delete: (id: string) =>
    api.delete(`/apartments/${id}`),
  
  updateOrder: (apartments: { id: string; order: number }[]) =>
    api.put('/apartments/order/update', { apartments }),
}

// Project Features API
export const featuresApi = {
  getAll: (params?: any) =>
    api.get('/project/features', { params }),
  
  getById: (id: string) =>
    api.get(`/project/features/${id}`),
  
  create: (data: any) =>
    api.post('/project/features', data),
  
  update: (id: string, data: any) =>
    api.put(`/project/features/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/project/features/${id}`),
  
  updateOrder: (features: { id: string; order: number }[]) =>
    api.put('/project/features/order/update', { features }),
}

// Project Warranties API
export const warrantiesApi = {
  getAll: (params?: any) =>
    api.get('/project/warranties', { params }),
  
  getById: (id: string) =>
    api.get(`/project/warranties/${id}`),
  
  create: (data: any) =>
    api.post('/project/warranties', data),
  
  update: (id: string, data: any) =>
    api.put(`/project/warranties/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/project/warranties/${id}`),
  
  updateOrder: (warranties: { id: string; order: number }[]) =>
    api.put('/project/warranties/order/update', { warranties }),
}

// Project Info API - Updated for new schemas
export const projectApi = {
  getInfo: () =>
    api.get('/project-info/info'),
  
  updateInfo: (id: string, data: any) =>
    api.put(`/project-info/info/${id}`, data),
  
  getHomePageData: () =>
    api.get('/project-info/homepage'),
  
  getApartmentModel: (modelName: string) =>
    api.get(`/project-info/apartment-model/${modelName}`),
  
  getContactSettings: () =>
    api.get('/project-info/contact-settings'),
  
  updateContactSettings: (id: string, data: any) =>
    api.put(`/project-info/contact-settings/${id}`, data),
  
  getPhoneNumber: (platform: string) =>
    api.get(`/project-info/phone/${platform}`),
  
  getWelcomeMessage: (platform: string) =>
    api.get(`/project-info/welcome-message/${platform}`),
  
  getStats: () =>
    api.get('/project/stats'),
}

// Media API
export const mediaApi = {
  getAll: (params?: any) =>
    api.get('/media', { params }),
  
  getById: (id: string) =>
    api.get(`/media/${id}`),
  
  upload: (data: any) => {
    const formData = new FormData()
    
    // إضافة البيانات
    Object.keys(data).forEach(key => {
      if (key !== 'file') {
        formData.append(key, data[key])
      }
    })
    
    // إضافة الملف
    if (data.file) {
      formData.append('file', data.file)
    }
    
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadMultiple: (formData: FormData) => {
    return api.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  update: (id: string, data: any) =>
    api.put(`/media/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/media/${id}`),
}

// Admin Management API
export const adminApi = {
  getAll: (params?: any) =>
    api.get('/admin/users', { params }),
  
  getById: (id: string) =>
    api.get(`/admin/users/${id}`),
  
  create: (data: any) =>
    api.post('/admin/users', data),
  
  update: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/users/${id}`),
  
  updateStatus: (id: string, isActive: boolean) =>
    api.put(`/admin/users/${id}/status`, { isActive }),
}

// Users API (for dashboard)
export const usersApi = {
  getAll: (params?: any) =>
    api.get('/users', { params }),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/users/${id}/status`, { status }),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
}

// Analytics API
export const analyticsApi = {
  getAnalytics: (params?: any) =>
    api.get('/analytics', { params }),
  
  getOverview: () =>
    api.get('/analytics/overview'),
  
  getViews: (params?: any) =>
    api.get('/analytics/views', { params }),
  
  getInquiries: (params?: any) =>
    api.get('/analytics/inquiries', { params }),
}

// Settings API
export const settingsApi = {
  getAll: () =>
    api.get('/settings'),
  
  update: (data: any) =>
    api.put('/settings', data),
}

// Inquiries API
export const inquiriesApi = {
  getAll: (params?: any) =>
    api.get('/inquiries', { params }),
  
  getById: (id: string) =>
    api.get(`/inquiries/${id}`),
  
  create: (data: any) =>
    api.post('/inquiries', data),
  
  update: (id: string, data: any) =>
    api.put(`/inquiries/${id}`, data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/inquiries/${id}/status`, { status }),
  
  addNote: (id: string, content: string) =>
    api.post(`/inquiries/${id}/notes`, { content }),
  
  addFollowUp: (id: string, data: any) =>
    api.post(`/inquiries/${id}/followups`, data),
  
  assign: (id: string, assignedTo: string | null) =>
    api.put(`/inquiries/${id}/assign`, { assignedTo }),
  
  delete: (id: string) =>
    api.delete(`/inquiries/${id}`),
  
  getStats: (params?: any) =>
    api.get('/inquiries/stats', { params }),
}

export const enhancedMediaApi = {
  ...mediaApi,
  uploadMultiple: (formData: FormData) => {
    return api.post('/media/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Project Info API
export const projectInfoAPI = {
  // الحصول على معلومات المشروع
  getProjectInfo: () => api.get('/project-info/info'),
  
  // تحديث معلومات المشروع
  updateProjectInfo: (id: string, data: any) => api.put(`/project-info/info/${id}`, data),
  
  // الحصول على جميع البيانات للصفحة الرئيسية
  getHomePageData: () => api.get('/project-info/homepage'),
  
  // الحصول على إعدادات التواصل
  getContactSettings: () => api.get('/project-info/contact-settings'),
  
  // تحديث إعدادات التواصل
  updateContactSettings: (id: string, data: any) => api.put(`/project-info/contact-settings/${id}`, data),
  
  // الحصول على رقم الهاتف حسب المنصة
  getPhoneByPlatform: (platform: string) => api.get(`/project-info/phone/${platform}`),
  
  // الحصول على رسالة الترحيب حسب المنصة
  getWelcomeMessage: (platform: string) => api.get(`/project-info/welcome-message/${platform}`),
  
  // الحصول على جميع بيانات التواصل
  getAllContactData: () => api.get('/project-info/contact-data')
}

// New Apartment Models API
export const apartmentModelsAPI = {
  // الحصول على جميع النماذج (استخدام public route للعرض)
  getAllModels: () => api.get('/apartments/public'),
  
  // الحصول على نموذج معين
  getModel: (id: string) => api.get(`/apartments/${id}`),
  
  // إنشاء نموذج جديد
  createModel: (data: any) => api.post('/apartments', data),
  
  // تحديث نموذج
  updateModel: (id: string, data: any) => api.put(`/apartments/${id}`, data),
  
  // حذف نموذج
  deleteModel: (id: string) => api.delete(`/apartments/${id}`)
}

// Project Features API
export const projectFeaturesAPI = {
  // الحصول على جميع المميزات
  getAllFeatures: () => api.get('/project/features'),
  
  // الحصول على ميزة معينة
  getFeature: (id: string) => api.get(`/project/features/${id}`),
  
  // إنشاء ميزة جديدة
  createFeature: (data: any) => api.post('/project/features', data),
  
  // تحديث ميزة
  updateFeature: (id: string, data: any) => api.put(`/project/features/${id}`, data),
  
  // حذف ميزة
  deleteFeature: (id: string) => api.delete(`/project/features/${id}`)
}

// Project Warranties API
export const projectWarrantiesAPI = {
  // الحصول على جميع الضمانات
  getAllWarranties: () => api.get('/project/warranties'),
  
  // الحصول على ضمان معين
  getWarranty: (id: string) => api.get(`/project/warranties/${id}`),
  
  // إنشاء ضمان جديد
  createWarranty: (data: any) => api.post('/project/warranties', data),
  
  // تحديث ضمان
  updateWarranty: (id: string, data: any) => api.put(`/project/warranties/${id}`, data),
  
  // حذف ضمان
  deleteWarranty: (id: string) => api.delete(`/project/warranties/${id}`)
}

// Location Features API
export const locationFeaturesAPI = {
  // الحصول على جميع مميزات الموقع
  getAllFeatures: (params?: any) => api.get('/location-features', { params }),
  
  // الحصول على ميزة موقع معينة
  getFeature: (id: string) => api.get(`/location-features/${id}`),
  
  // إنشاء ميزة موقع جديدة
  createFeature: (data: any) => api.post('/location-features', data),
  
  // تحديث ميزة موقع
  updateFeature: (id: string, data: any) => api.put(`/location-features/${id}`, data),
  
  // حذف ميزة موقع
  deleteFeature: (id: string) => api.delete(`/location-features/${id}`)
}

// Project Media API
export const projectMediaAPI = {
  // الحصول على جميع الوسائط
  getAllMedia: () => api.get('/media'),
  
  // الحصول على وسائط معينة
  getMedia: (id: string) => api.get(`/media/${id}`),
  
  // رفع وسائط جديدة
  uploadMedia: (formData: FormData) => api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // تحديث وسائط
  updateMedia: (id: string, data: any) => api.put(`/media/${id}`, data),
  
  // حذف وسائط
  deleteMedia: (id: string) => api.delete(`/media/${id}`)
}

export default api
