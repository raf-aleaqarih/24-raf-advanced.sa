'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { projectFeaturesAPI } from '../../../../lib/api'
import { StarIcon } from '@heroicons/react/24/outline'
import IconSelector from '../../../../components/IconSelector'
import { MapPin, Building2, Shield, Home, Car, Wifi, StoreIcon, Plane, Star } from 'lucide-react'

interface ProjectFeatureForm {
  title: string
  description: string
  icon: string
  featureType: string
  category: string
  displayOrder: number
  status: string
  isVisible: boolean
}

export default function NewFeaturePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ProjectFeatureForm>({
    title: '',
    description: '',
    icon: '',
    featureType: 'project',
    category: '',
    displayOrder: 0,
    status: 'active',
    isVisible: true
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category) {
      setError('الرجاء ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await projectFeaturesAPI.createFeature(formData)
      
      if (response.data.success) {
        router.push('/dashboard/features?success=تم إنشاء الميزة بنجاح')
      } else {
        setError('فشل في إنشاء الميزة')
      }
    } catch (error) {
      console.error('خطأ في إنشاء الميزة:', error)
      setError('حدث خطأ أثناء إنشاء الميزة')
    } finally {
      setSaving(false)
    }
  }


  const featureTypes = [
    { value: 'project', label: 'مميزات المشروع' },
    { value: 'location', label: 'مميزات الموقع' },

  ]

  const categories = [
    { value: 'location', label: 'الموقع' },
    { value: 'services', label: 'الخدمات' },
    { value: 'warranty', label: 'الضمان' },
    { value: 'space', label: 'المساحة' },
    { value: 'parking', label: 'المواقف' },
    { value: 'technology', label: 'التكنولوجيا' },
    { value: 'transport', label: 'المواصلات' },
    { value: 'amenities', label: 'المرافق' },
    { value: 'security', label: 'الأمان' }
  ]

  // دالة لعرض الأيقونة المحددة
  const renderSelectedIcon = () => {
    console.log('renderSelectedIcon - formData.icon:', formData.icon)
    
    const iconComponents: { [key: string]: any } = {
      MapPin,
      Building2,
      Shield,
      Home,
      Car,
      Wifi,
      StoreIcon,
      Plane,
      Star
    }

    const IconComponent = iconComponents[formData.icon]
    console.log('IconComponent found:', IconComponent)
    
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-[#c48765]" />
    }
    
    return <span className="text-2xl">📋</span>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <StarIcon className="w-8 h-8 text-yellow-600" />
            إضافة ميزة جديدة
          </h1>
          <p className="text-gray-600 mt-2">إنشاء ميزة جديدة للمشروع</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/features')}
        >
          العودة للقائمة
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان الميزة *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="موقع إستراتيجي قريب من الواجهة البحرية"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وصف الميزة *</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="وصف مفصل للميزة وفوائدها..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">نوع الميزة *</label>
                <select
                  value={formData.featureType}
                  onChange={(e) => handleInputChange('featureType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  {featureTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الفئة *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon and Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات العرض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الأيقونة</label>
              <IconSelector
                selectedIcon={formData.icon}
                onIconSelect={(iconName) => {
                  console.log('Icon selected in new page:', iconName)
                  handleInputChange('icon', iconName)
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                اختر أيقونة مناسبة للميزة من القائمة المرئية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
                <Input
                  type="number"
                  value={formData.displayOrder || ''}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الرقم الأقل يظهر أولاً
                </p>
              </div>

              {/* <div>
                <label className="block text-sm font-medium mb-2">الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div> */}
            </div>

            {/* <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isVisible" className="text-sm font-medium">
                مرئي في الموقع
              </label>
            </div> */}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>معاينة الميزة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {renderSelectedIcon()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {formData.title || 'عنوان الميزة'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {formData.description || 'وصف الميزة'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      formData.featureType === 'project' ? 'bg-blue-100 text-blue-800' :
                      formData.featureType === 'location' ? 'bg-green-100 text-green-800' :
                      formData.featureType === 'apartment' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {featureTypes.find(t => t.value === formData.featureType)?.label}
                    </span>
                    {formData.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        {categories.find(c => c.value === formData.category)?.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'جاري الحفظ...' : 'إنشاء الميزة'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/features')}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}