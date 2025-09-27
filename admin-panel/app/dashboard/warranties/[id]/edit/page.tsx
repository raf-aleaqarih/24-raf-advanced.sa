'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warrantiesApi } from '../../../../../lib/api'
import { LoadingSpinner } from '../../../../../components/ui/LoadingSpinner'
import { 
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface WarrantyFormData {
  title: string
  description: string
  warrantyType: string
  years: number
  category: string
  status: 'active' | 'inactive'
}

const warrantyTypes = [
  { value: 'structural', label: 'ضمان الهيكل الإنشائي' },
  { value: 'electrical', label: 'ضمان الكهرباء' },
  { value: 'plumbing', label: 'ضمان السباكة' },
  { value: 'elevator', label: 'ضمان المصاعد' },
  { value: 'smart_home', label: 'سمارت هوم' },
  { value: 'owners_association', label: 'انجاز مالوك' }
]

export default function EditWarrantyPage() {
  const router = useRouter()
  const params = useParams()
  const warrantyId = params.id as string
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<WarrantyFormData>({
    title: '',
    description: '',
    warrantyType: '',
    years: 1,
    category: '',
    status: 'active'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // جلب بيانات الضمان
  const { data: warranty, isLoading, error } = useQuery({
    queryKey: ['warranty', warrantyId],
    queryFn: () => warrantiesApi.getById(warrantyId),
    enabled: !!warrantyId
  })

  // تحديث الضمان
  const updateMutation = useMutation({
    mutationFn: (data: WarrantyFormData) => warrantiesApi.update(warrantyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
      queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
      router.push('/dashboard/warranties')
    },
    onError: (error: any) => {
      console.error('Error updating warranty:', error)
    }
  })

  // تحديث البيانات عند تحميل الضمان
  useEffect(() => {
    if (warranty?.data) {
      const warrantyData = warranty.data
      setFormData({
        title: warrantyData.title || '',
        description: warrantyData.description || '',
        warrantyType: warrantyData.warrantyType || '',
        years: warrantyData.years || 1,
        category: warrantyData.category || '',
        status: warrantyData.status || 'active'
      })
    }
  }, [warranty])

  const handleInputChange = (field: keyof WarrantyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // إزالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب'
    }

    if (!formData.warrantyType) {
      newErrors.warrantyType = 'نوع الضمان مطلوب'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'فئة الضمان مطلوبة'
    }

    if (formData.years <= 0) {
      newErrors.years = 'المدة يجب أن تكون أكبر من صفر'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل بيانات الضمان</p>
          <Link href="/dashboard/warranties" className="btn-primary">
            العودة للقائمة
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/warranties"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRightIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">تعديل الضمان</h1>
            <p className="text-sm text-gray-600">تعديل بيانات ومعلومات الضمان</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* العنوان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الضمان
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="مثال: ضمان الهيكل الإنشائي"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* النوع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الضمان
              </label>
              <select
                value={formData.warrantyType}
                onChange={(e) => handleInputChange('warrantyType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.warrantyType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">اختر نوع الضمان</option>
                {warrantyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.warrantyType && (
                <p className="mt-1 text-sm text-red-600">{errors.warrantyType}</p>
              )}
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الضمان
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="اكتب وصفاً تفصيلياً للضمان..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* المدة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدة الضمان (بالسنوات)
              </label>
              <input
                type="number"
                min="1"
                value={formData.years}
                onChange={(e) => handleInputChange('years', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.years ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.years && (
                <p className="mt-1 text-sm text-red-600">{errors.years}</p>
              )}
            </div>

            {/* الفئة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فئة الضمان
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="مثال: ضمان شامل، ضمان أساسي"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>


            {/* الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة الضمان
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            {/* الأزرار */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <LoadingSpinner size="small" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </button>
              
              <Link
                href="/dashboard/warranties"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

