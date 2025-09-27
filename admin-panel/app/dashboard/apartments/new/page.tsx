'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { apartmentModelsAPI } from '../../../../lib/api'
import ImageUploadBackend from '../../../../components/ImageUploadBackend'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface ApartmentModelForm {
  modelName: string
  modelTitle: string
  modelSubtitle: string
  price: number
  area: number
  roofArea: number
  rooms: number
  bathrooms: number
  location: string
  direction: string
  images: Array<{
    url: string
    alt: string
  }>
  features: string[]
  status: string
}

export default function NewApartmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newFeature, setNewFeature] = useState('')

  const [formData, setFormData] = useState<ApartmentModelForm>({
    modelName: '',
    modelTitle: '',
    modelSubtitle: '',
    price: 0,
    area: 0,
    roofArea: 0,
    rooms: 0,
    bathrooms: 0,
    location: '',
    direction: '',
    images: [],
    features: [],
    status: 'active'
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleImagesChange = (imageUrls: string[]) => {
    setFormData({
      ...formData,
      images: imageUrls.map(url => ({ url, alt: '' }))
    })
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.modelName || !formData.modelTitle || !formData.modelSubtitle || 
        formData.area <= 0 || formData.rooms <= 0 || formData.bathrooms <= 0 || 
        formData.price <= 0) {
      setError('الرجاء ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await apartmentModelsAPI.createModel(formData)
      
      if (response.data.success) {
        router.push('/dashboard/apartments?success=تم إنشاء النموذج بنجاح')
      } else {
        setError('فشل في إنشاء النموذج')
      }
    } catch (error) {
      console.error('خطأ في إنشاء النموذج:', error)
      setError('حدث خطأ أثناء إنشاء النموذج')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            إضافة نموذج شقة جديد
          </h1>
          <p className="text-gray-600 mt-2">إنشاء نموذج شقة جديد في المشروع</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/apartments')}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم النموذج *</label>
                <Input
                  value={formData.modelName}
                  onChange={(e) => handleInputChange('modelName', e.target.value)}
                  placeholder="A, B, C, D"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">عنوان النموذج *</label>
                <Input
                  value={formData.modelTitle}
                  onChange={(e) => handleInputChange('modelTitle', e.target.value)}
                  placeholder="نموذج A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                <Input
                  value={formData.modelSubtitle}
                  onChange={(e) => handleInputChange('modelSubtitle', e.target.value)}
                  placeholder="على شارع جنوبي شرقي"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>المواصفات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">مساحة البناء (م²) *</label>
                <Input
                  type="number"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                  placeholder="156"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">مساحة السطح (م²)</label>
                <Input
                  type="number"
                  value={formData.roofArea || ''}
                  onChange={(e) => handleInputChange('roofArea', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">عدد الغرف *</label>
                <Input
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 0)}
                  placeholder="4"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عدد الحمامات *</label>
                <Input
                  type="number"
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                  placeholder="4"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الموقع</label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="مثل: حي الزهراء"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الاتجاه</label>
                <Input
                  value={formData.direction}
                  onChange={(e) => handleInputChange('direction', e.target.value)}
                  placeholder="مثل: جنوبي شرقي"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle>السعر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">السعر (ريال سعودي) *</label>
              <Input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                placeholder="830000"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>الصور</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadBackend
              onImagesChange={handleImagesChange}
              maxImages={10}
              existingImages={formData.images.map(img => img.url)}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>المميزات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="إضافة ميزة جديدة"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <Button type="button" onClick={addFeature}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>

            {formData.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1 text-sm">{feature}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'جاري الحفظ...' : 'إنشاء النموذج'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/apartments')}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}