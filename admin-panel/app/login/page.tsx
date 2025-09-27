'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield } from 'lucide-react'
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // إعادة توجيه المستخدم المصادق عليه
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // معالج تسجيل الدخول
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // معالج تغيير البيانات
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // إزالة رسالة الخطأ عند بدء الكتابة
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // عرض التحميل أثناء التحقق من المصادقة
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // إذا كان المستخدم مصادق عليه، لا نعرض شيء (سيتم إعادة التوجيه)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* الشعار والعنوان */}
      <div className="text-center pt-8 pb-4">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
          <Shield className="h-8 w-8 text-gray-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          لوحة تحكم مشروع 24
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          حي الزهراء - جدة
        </p>
        <p className="text-gray-500 mb-8">
          يرجى تسجيل الدخول للوصول إلى لوحة التحكم
        </p>
      </div>

      {/* النموذج */}
      <div className="max-w-md mx-auto px-4">
        {/* نموذج تسجيل الدخول */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* البريد الإلكتروني */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="admin@project24.sa"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="loading-spinner h-5 w-5 ml-2"></div>
                جاري تسجيل الدخول...
              </div>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {/* رسالة الحساب المقفل */}
            {/* <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">
                    الحساب مقفل مؤقتاً
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>تم قفل الحساب بسبب محاولات دخول خاطئة متكررة.</p>
                    <p>يرجى المحاولة مرة أخرى بعد 5-10 دقائق.</p>
                  </div>
                </div>
              </div>
            </div> 
          )} */}

          {/* معلومات للمطورين */}
          {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              بيانات تسجيل الدخول للاختبار:
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>البريد الإلكتروني:</strong> admin@project24.sa</p>
              <p><strong>كلمة المرور:</strong> !Admin@2024</p>
            </div>
          </div> */}
        </form>
      </div>

      {/* معلومات المشروع */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">مشروع 24</h2>
        <p className="text-lg text-gray-600 mb-2">حي الزهراء - جدة</p>
        <p className="text-gray-500 mb-4">امتلك منزل أحلامك في أفضل مواقع جدة</p>
        <p className="text-sm text-gray-400">لوحة تحكم شاملة لإدارة جميع جوانب المشروع</p>
        <div className="mt-6 flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-xs text-gray-500">نماذج شقق</div>
          </div>
        </div>
      </div>
    </div>
  )
}
