'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import toast from 'react-hot-toast'
import IconSelector from '@/components/IconSelector'
import { locationFeaturesAPI } from '@/lib/api'

interface LocationFeatureFormData {
  title: string
  description: string
  icon: string
  category: string
  distance: string
  displayOrder: number
  status: string
  isVisible: boolean
  additionalInfo: string
}

const initialFormData: LocationFeatureFormData = {
  title: '',
  description: '',
  icon: 'MapPin',
  category: 'nearby',
  distance: '',
  displayOrder: 0,
  status: 'active',
  isVisible: true,
  additionalInfo: ''
}

const categoryOptions = [
  { value: 'nearby', label: 'قريب من' },
  { value: 'minutesFrom', label: 'دقائق من' },

]

export default function EditLocationFeaturePage() {
  const router = useRouter()
  const params = useParams()
  const featureId = params.id as string

  const [formData, setFormData] = useState<LocationFeatureFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // جلب بيانات ميزة الموقع
  useEffect(() => {
    const fetchLocationFeature = async () => {
      try {
        setLoadingData(true)
        const response = await locationFeaturesAPI.getFeature(featureId)
        const feature = response.data.data
        
        setFormData({
          title: feature.title || '',
          description: feature.description || '',
          icon: feature.icon || 'MapPin',
          category: feature.category || 'nearby',
          distance: feature.distance || '',
          displayOrder: feature.displayOrder || 0,
          status: feature.status || 'active',
          isVisible: feature.isVisible ?? true,
          additionalInfo: feature.additionalInfo || ''
        })
      } catch (error: any) {
        console.error('خطأ في جلب بيانات ميزة الموقع:', error)
        toast.error(error.response?.data?.message || 'فشل في جلب بيانات ميزة الموقع')
        router.push('/dashboard/location-features')
      } finally {
        setLoadingData(false)
      }
    }

    if (featureId) {
      fetchLocationFeature()
    }
  }, [featureId, router])

  const handleInputChange = (field: keyof LocationFeatureFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // مسح الخطأ عند تغيير القيمة
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب'
    }

    if (!formData.category) {
      newErrors.category = 'الفئة مطلوبة'
    }

    if (!formData.icon) {
      newErrors.icon = 'الأيقونة مطلوبة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج')
      return
    }

    setLoading(true)

    try {
      await locationFeaturesAPI.updateFeature(featureId, formData)

      toast.success('تم تحديث ميزة الموقع بنجاح')
      router.push('/dashboard/location-features')
    } catch (error: any) {
      console.error('خطأ في تحديث ميزة الموقع:', error)
      toast.error(error.response?.data?.message || error.message || 'فشل في تحديث ميزة الموقع')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
        <div>
          <h1 className="text-3xl font-bold">تعديل ميزة الموقع</h1>
          <p className="text-muted-foreground">تعديل بيانات ميزة الموقع</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات أساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="أدخل عنوان ميزة الموقع"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="أدخل وصف ميزة الموقع (اختياري)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">المسافة/الوقت</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  placeholder="مثال: 5 دقائق، 2 كم"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">ترتيب العرض</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأيقونة والإعدادات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اختر الأيقونة *</Label>
              <IconSelector
                selectedIcon={formData.icon}
                onIconSelect={(icon) => handleInputChange('icon', icon)}
              />
              {errors.icon && (
                <p className="text-red-500 text-sm">{errors.icon}</p>
              )}
            </div>

          </CardContent>
        </Card>


        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            حفظ التغييرات
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}
