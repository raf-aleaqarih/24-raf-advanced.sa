'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { LoadingSpinner } from '../../../../../components/ui/LoadingSpinner'
import { projectFeaturesAPI } from '../../../../../lib/api'
import { 
  StarIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import IconSelector from '../../../../../components/IconSelector'
import { MapPin, Building2, Shield, Home, Car, Wifi, StoreIcon, Plane, Star } from 'lucide-react'

interface ProjectFeature {
  _id: string
  title: string
  description: string
  icon: string
  featureType: string
  category: string
  displayOrder: number
  status: string
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export default function EditFeaturePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [feature, setFeature] = useState<ProjectFeature | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFeature()
  }, [params.id])

  const fetchFeature = async () => {
    try {
      setLoading(true)
      const response = await projectFeaturesAPI.getFeature(params.id)
      if (response.data.success) {
        console.log('Feature data loaded:', response.data.data)
        setFeature(response.data.data)
      } else {
        setError('فشل في تحميل الميزة')
      }
    } catch (error) {
      console.error('خطأ في تحميل الميزة:', error)
      setError('حدث خطأ أثناء تحميل الميزة')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feature) return

    try {
      setSaving(true)
      setError('')

      const response = await projectFeaturesAPI.updateFeature(feature._id, feature)
      
      if (response.data.success) {
        router.push('/dashboard/features?success=تم تحديث الميزة بنجاح')
      } else {
        setError('فشل في تحديث الميزة')
      }
    } catch (error) {
      console.error('خطأ في تحديث الميزة:', error)
      setError('حدث خطأ أثناء تحديث الميزة')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProjectFeature, value: any) => {
    if (!feature) return
    
    setFeature({
      ...feature,
      [field]: value
    })
  }

  // دالة لعرض الأيقونة المحددة
  const renderSelectedIcon = () => {
    if (!feature) return <span className="text-2xl">📋</span>
    
    console.log('renderSelectedIcon - feature.icon:', feature.icon)
    
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

    const IconComponent = iconComponents[feature.icon]
    console.log('IconComponent found:', IconComponent)
    
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-[#c48765]" />
    }
    
    return <span className="text-2xl">📋</span>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على الميزة</p>
          <Button onClick={() => router.push('/dashboard/features')}>
            العودة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/features')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <StarIcon className="w-8 h-8 text-yellow-600" />
              تحرير الميزة
            </h1>
            <p className="text-gray-600 mt-1">تعديل معلومات الميزة</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات الميزة الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الميزة الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان الميزة</label>
              <Input
                value={feature.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="مثال: مواقف سيارات مغطاة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وصف الميزة</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                value={feature.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="وصف تفصيلي للميزة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الأيقونة</label>
              <IconSelector
                selectedIcon={feature.icon}
                onIconSelect={(iconName) => {
                  console.log('Icon selected:', iconName)
                  handleInputChange('icon', iconName)
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                اختر أيقونة مناسبة للميزة من القائمة المرئية
              </p>
            </div>
          </CardContent>
        </Card>

        {/* تصنيف الميزة */}
        <Card>
          <CardHeader>
            <CardTitle>تصنيف الميزة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">نوع الميزة</label>
              <select
                value={feature.featureType}
                onChange={(e) => handleInputChange('featureType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="project">مميزات المشروع</option>
                <option value="location">مميزات الموقع</option>
                <option value="apartment">مميزات الشقق</option>
                <option value="warranty">الضمانات</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">فئة الميزة</label>
              <Input
                value={feature.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
                placeholder="مثال: الخدمات، المواصلات، التكنولوجيا"
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات العرض */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات العرض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
              <Input
                type="number"
                value={feature.displayOrder}
                onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value))}
                required
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                الميزات ذات الأرقام الأقل تظهر أولاً
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={feature.isVisible}
                  onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isVisible" className="text-sm font-medium">
                  إظهار الميزة في الموقع
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">حالة الميزة</label>
              <select
                value={feature.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* معاينة الميزة */}
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
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.featureType === 'project' ? 'bg-blue-100 text-blue-800' :
                      feature.featureType === 'location' ? 'bg-green-100 text-green-800' :
                      feature.featureType === 'apartment' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feature.featureType === 'project' ? 'مميزات المشروع' :
                       feature.featureType === 'location' ? 'مميزات الموقع' :
                       feature.featureType === 'apartment' ? 'مميزات الشقق' :
                       'الضمانات'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      {feature.category}
                    </span>
                    {feature.isVisible && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" />
                        مرئي
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
