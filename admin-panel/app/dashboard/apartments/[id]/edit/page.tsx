'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { apartmentsApi } from '../../../../../lib/api'
import { LoadingSpinner } from '../../../../../components/ui/LoadingSpinner'
import ImageUploadBackend from '../../../../../components/ImageUploadBackend'
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { cn } from '../../../../../lib/utils'

// دالة لتنظيف المميزات من العلامات والأقواس
const cleanFeatures = (features: string[]): string[] => {
  return features.map(feature => {
    // إزالة العلامات والأقواس المختلفة
    return feature
      .replace(/[\[\](){}]/g, '') // إزالة الأقواس
      .replace(/[\/\\]/g, '') // إزالة الشرطات
      .replace(/[|]/g, '') // إزالة الخطوط العمودية
      .replace(/[<>]/g, '') // إزالة علامات أكبر/أصغر
      .replace(/[!@#$%^&*+=]/g, '') // إزالة الرموز الخاصة
      .replace(/['"`]/g, '') // إزالة جميع أنواع علامات التنصيص
      .trim() // إزالة المسافات الزائدة
      .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
  }).filter(feature => feature.length > 0) // إزالة المميزات الفارغة
}

interface ApartmentFormData {
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
  mainImage: string
  features: string[]
  status: string
}

export default function EditApartmentPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const apartmentId = params.id as string
  
  const [formData, setFormData] = useState<ApartmentFormData>({
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
    mainImage: '',
    features: [],
    status: 'active'
  })

  const [newFeature, setNewFeature] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // جلب بيانات الشقة
  const { data: apartment, isLoading, error } = useQuery({
    queryKey: ['apartment', apartmentId],
    queryFn: () => apartmentsApi.getById(apartmentId),
    enabled: !!apartmentId
  })

  // تحديث البيانات عند تحميل الشقة
  useEffect(() => {
    if (apartment?.data?.data) {
      const apartmentData = apartment.data.data
      setFormData({
        modelName: apartmentData.modelName || '',
        modelTitle: apartmentData.modelTitle || '',
        modelSubtitle: apartmentData.modelSubtitle || '',
        price: apartmentData.price || 0,
        area: apartmentData.area || 0,
        roofArea: apartmentData.roofArea || 0,
        rooms: apartmentData.rooms || 0,
        bathrooms: apartmentData.bathrooms || 0,
        location: apartmentData.location || '',
        direction: apartmentData.direction || '',
        images: Array.isArray(apartmentData.images) 
          ? apartmentData.images.map((img: any) => 
              typeof img === 'string' ? { url: img, alt: '' } : img
            )
          : [],
        mainImage: apartmentData.mainImage || '',
        features: Array.isArray(apartmentData.features) 
          ? cleanFeatures(apartmentData.features.map((feature: any) => 
              typeof feature === 'string' ? feature : feature.name || feature.title || 'ميزة'
            ))
          : [],
        status: apartmentData.status || 'active'
      })
    }
  }, [apartment])

  // تحديث الشقة
  const updateMutation = useMutation({
    mutationFn: (data: ApartmentFormData) => apartmentsApi.update(apartmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] })
      router.push('/dashboard/apartments')
    },
    onError: (error: any) => {
      setErrors(error.response?.data?.errors || {})
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // إزالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleImagesChange = (imageUrls: string[]) => {
    setFormData(prev => {
      const newImages = imageUrls.map(url => ({ url, alt: '' }))
      
      // تعيين أول صورة كصورة رئيسية إذا لم تكن هناك صورة رئيسية
      let mainImage = prev.mainImage
      if (!mainImage && newImages.length > 0) {
        mainImage = newImages[0].url
      }
      
      return {
        ...prev,
        images: newImages,
        mainImage: mainImage
      }
    })
  }

  const handlePriceChange = (field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      const cleanedFeature = cleanFeatures([newFeature.trim()])[0]
      if (cleanedFeature && !formData.features.includes(cleanedFeature)) {
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, cleanedFeature]
        }))
        setNewFeature('')
      }
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // محاكاة رفع الصور (في التطبيق الحقيقي، ستكون هناك API لرفع الملفات)
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              url: e.target?.result as string,
              alt: file.name
            }]
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // التحقق من صحة البيانات
    const newErrors: Record<string, string> = {}
    
    if (!formData.modelName.trim()) newErrors.modelName = 'اسم النموذج مطلوب'
    if (!formData.modelTitle.trim()) newErrors.modelTitle = 'عنوان النموذج مطلوب'
    if (!formData.modelSubtitle.trim()) newErrors.modelSubtitle = 'العنوان الفرعي مطلوب'
    if (formData.area <= 0) newErrors.area = 'المساحة يجب أن تكون أكبر من صفر'
    if (formData.rooms <= 0) newErrors.rooms = 'عدد الغرف يجب أن يكون أكبر من صفر'
    if (formData.bathrooms <= 0) newErrors.bathrooms = 'عدد الحمامات يجب أن يكون أكبر من صفر'
    if (formData.price <= 0) newErrors.price = 'السعر يجب أن يكون أكبر من صفر'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      await updateMutation.mutateAsync(formData)
    } catch (error) {
      setIsSubmitting(false)
    }
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
          <p className="text-gray-600">حدث خطأ أثناء تحميل بيانات الشقة</p>
          <Link href="/dashboard/apartments" className="btn-primary mt-4">
            العودة للقائمة
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/apartments"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">تعديل نموذج الشقة</h1>
            <p className="page-subtitle">
              تعديل بيانات النموذج: {formData.modelTitle || 'جاري التحميل...'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">المعلومات الأساسية</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label required">اسم النموذج</label>
                    <input
                      type="text"
                      value={formData.modelName}
                      onChange={(e) => handleInputChange('modelName', e.target.value)}
                      className={cn('form-input', errors.modelName && 'error')}
                      placeholder="مثل: model-3br"
                    />
                    {errors.modelName && <p className="form-error">{errors.modelName}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label required">عنوان النموذج</label>
                    <input
                      type="text"
                      value={formData.modelTitle}
                      onChange={(e) => handleInputChange('modelTitle', e.target.value)}
                      className={cn('form-input', errors.modelTitle && 'error')}
                      placeholder="مثل: شقة فاخرة 3 غرف"
                    />
                    {errors.modelTitle && <p className="form-error">{errors.modelTitle}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">العنوان الفرعي</label>
                  <input
                    type="text"
                    value={formData.modelSubtitle}
                    onChange={(e) => handleInputChange('modelSubtitle', e.target.value)}
                    className={cn('form-input', errors.modelSubtitle && 'error')}
                    placeholder="مثل: في حي الزهراء - جدة"
                  />
                  {errors.modelSubtitle && <p className="form-error">{errors.modelSubtitle}</p>}
                </div>

              </div>
            </div>

            {/* Specifications */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">المواصفات</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required">المساحة (م²)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                    className={cn('form-input', errors.area && 'error')}
                    placeholder="156"
                    min="1"
                  />
                  {errors.area && <p className="form-error">{errors.area}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">مساحة السطح (م²)</label>
                  <input
                    type="number"
                    value={formData.roofArea}
                    onChange={(e) => handleInputChange('roofArea', parseInt(e.target.value) || 0)}
                    className="form-input"
                    placeholder="50"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">عدد الغرف</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 0)}
                    className={cn('form-input', errors.rooms && 'error')}
                    placeholder="4"
                    min="1"
                  />
                  {errors.rooms && <p className="form-error">{errors.rooms}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label required">عدد الحمامات</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                    className={cn('form-input', errors.bathrooms && 'error')}
                    placeholder="4"
                    min="1"
                  />
                  {errors.bathrooms && <p className="form-error">{errors.bathrooms}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">الموقع</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="form-input"
                    placeholder="مثل: حي الزهراء"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الاتجاه</label>
                  <input
                    type="text"
                    value={formData.direction}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                    className="form-input"
                    placeholder="مثل: جنوبي شرقي"
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">السعر</h2>
              </div>
              <div className="form-group">
                <label className="form-label required">السعر (ريال سعودي)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handlePriceChange('price', parseInt(e.target.value) || 0)}
                  className={cn('form-input', errors.price && 'error')}
                  placeholder="830000"
                  min="1"
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>
            </div>

            {/* Features */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">المميزات</h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="form-input flex-1"
                    placeholder="أضف ميزة جديدة..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn-primary flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    إضافة
                  </button>
                </div>

                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Images */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">الصور</h2>
              </div>
              <div className="space-y-6">
                {/* الصور الحالية */}
                {formData.images && formData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">الصور الحالية</h3>
                    {formData.images.length === 1 ? (
                      // صورة واحدة: عرضها بعرض كامل
                      <div className="relative w-full h-64 rounded-lg border border-gray-200 overflow-hidden">
                        <Image
                          src={formData.images[0].url}
                          alt={`صورة 1 - ${formData.modelTitle}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          quality={90}
                          onError={(e) => {
                            console.error('Error loading image:', formData.images[0].url)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                            صورة 1
                          </span>
                        </div>
                      </div>
                    ) : (
                      // أكثر من صورة: شبكة منسقة حسب العدد
                      <div
                        className={
                          formData.images.length === 2
                            ? "grid grid-cols-2 gap-4"
                            : formData.images.length === 3
                            ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        }
                      >
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-32 md:h-36 lg:h-40 rounded-lg border border-gray-200 overflow-hidden">
                              <Image
                                src={image.url}
                                alt={`صورة ${index + 1} - ${formData.modelTitle}`}
                                fill
                                className="object-cover"
                                sizes={
                                  formData.images.length === 2
                                    ? "(max-width: 768px) 100vw, 50vw"
                                    : formData.images.length === 3
                                    ? "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                                    : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                }
                                quality={85}
                                onError={(e) => {
                                  console.error('Error loading image:', image.url)
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                صورة {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* رفع صور جديدة */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">رفع صور جديدة</h3>
                  <ImageUploadBackend
                    onImagesChange={handleImagesChange}
                    maxImages={10}
                    existingImages={formData.images.map(img => img.url)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="section-card">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </button>
                
                <Link
                  href="/dashboard/apartments"
                  className="btn-secondary flex-1 text-center py-3 px-6"
                >
                  إلغاء
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
