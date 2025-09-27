'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'

interface Admin {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'editor'
  permissions: string[]
  profile?: {
    avatar?: {
      url: string
    }
    phone?: string
    department?: string
    bio?: string
  }
}

interface AuthContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: any) => Promise<void>
  hasPermission: (permission: string) => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'admin_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // التحقق من المصادقة عند تحميل التطبيق
  useEffect(() => {
    checkAuth()
  }, [])

  // دالة التحقق من المصادقة
  const checkAuth = async () => {
    try {
      const token = Cookies.get(TOKEN_KEY)
      
      if (!token) {
        setLoading(false)
        return
      }

      // التحقق من صحة التوكن
      const response = await authApi.verify()
      
      if (response.data.success && response.data.data.admin) {
        setAdmin(response.data.data.admin)
      } else {
        // التوكن غير صالح، محاولة التجديد
        await refreshToken()
      }
    } catch (error: any) {
      console.error('خطأ في التحقق من المصادقة:', error)
      
      // إذا كان التوكن منتهي الصلاحية، محاولة التجديد
      if (error?.response?.status === 401) {
        await refreshToken()
      } else {
        // خطأ آخر، تسجيل الخروج
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  // دالة تجديد التوكن
  const refreshToken = async () => {
    try {
      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY)
      
      if (!refreshToken) {
        logout()
        return
      }

      const response = await authApi.refresh(refreshToken)
      
      if (response.data.success) {
        const { token, refreshToken: newRefreshToken } = response.data.data
        
        // حفظ التوكنز الجديدة
        Cookies.set(TOKEN_KEY, token, { expires: 7 }) // 7 أيام
        Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, { expires: 30 }) // 30 يوم
        
        // التحقق من المصادقة مرة أخرى
        await checkAuth()
      } else {
        logout()
      }
    } catch (error) {
      console.error('خطأ في تجديد التوكن:', error)
      logout()
    }
  }

  // دالة تسجيل الدخول
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const response = await authApi.login({ email, password })
      
      if (response.data.success) {
        const { admin, token, refreshToken } = response.data.data
        
        // حفظ التوكنز
        Cookies.set(TOKEN_KEY, token, { expires: 7 })
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 })
        
        setAdmin(admin)
        
        toast.success(`مرحباً ${admin.name}! تم تسجيل الدخول بنجاح`)
        
        // التوجه إلى لوحة التحكم
        router.push('/dashboard')
      } else {
        throw new Error(response.data.message || 'فشل في تسجيل الدخول')
      }
    } catch (error: any) {
      let message = 'خطأ في تسجيل الدخول'
      
      if (error?.response?.status === 423) {
        message = 'الحساب مقفل مؤقتاً بسبب محاولات دخول خاطئة متكررة. يرجى المحاولة لاحقاً.'
      } else if (error?.response?.status === 401) {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      } else if (error?.response?.status === 429) {
        message = 'تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقاً'
      } else if (error?.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      }
      
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // دالة تسجيل الخروج
  const logout = () => {
    try {
      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY)
      
      // إرسال طلب تسجيل الخروج إلى الخادم
      if (refreshToken) {
        authApi.logout(refreshToken).catch(console.error)
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error)
    } finally {
      // حذف التوكنز
      Cookies.remove(TOKEN_KEY)
      Cookies.remove(REFRESH_TOKEN_KEY)
      
      setAdmin(null)
      
      // التوجه إلى صفحة تسجيل الدخول
      router.push('/login')
      
      toast.success('تم تسجيل الخروج بنجاح')
    }
  }

  // دالة تحديث الملف الشخصي
  const updateProfile = async (data: any) => {
    try {
      const response = await authApi.updateProfile(data)
      
      if (response.data.success) {
        setAdmin(response.data.data)
        toast.success('تم تحديث الملف الشخصي بنجاح')
      } else {
        throw new Error(response.data.message || 'فشل في تحديث الملف الشخصي')
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'خطأ في تحديث الملف الشخصي'
      toast.error(message)
      throw error
    }
  }

  // دالة التحقق من الصلاحيات
  const hasPermission = (permission: string): boolean => {
    if (!admin) return false
    
    // السوبر أدمن له كل الصلاحيات
    if (admin.role === 'super_admin') return true
    
    // التحقق من وجود الصلاحية
    return admin.permissions.includes(permission)
  }

  const value: AuthContextType = {
    admin,
    loading,
    login,
    logout,
    updateProfile,
    hasPermission,
    isAuthenticated: !!admin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
