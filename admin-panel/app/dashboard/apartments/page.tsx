'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { apartmentModelsAPI, apartmentsApi } from '../../../lib/api'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ApartmentModel {
  _id: string
  modelName: string
  modelTitle: string
  modelSubtitle: string
  price: number
  currency: string
  area: number
  roofArea: number
  totalArea: number
  rooms: number
  bathrooms: number
  floor: number
  location: string
  direction: string
  description: string
  images: string[]
  mainImage: string
  features: string[]
  status: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

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

 export default function ApartmentsPage() {
  const router = useRouter()
  const [apartmentModels, setApartmentModels] = useState<ApartmentModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchApartmentModels()
    
    // التحقق من رسالة النجاح في URL
    const urlParams = new URLSearchParams(window.location.search)
    const successMessage = urlParams.get('success')
    if (successMessage) {
      // إظهار رسالة النجاح باستخدام toastify
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      // إزالة المعامل من URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // إعادة تحميل النماذج للتأكد من ظهور النموذج الجديد
      fetchApartmentModels()
    }
  }, [])

  const fetchApartmentModels = async () => {
    try {
      setLoading(true)
      const response = await apartmentsApi.getAll()
      if (response.data.success) {
        const sortedModels = response.data.data.sort((a: ApartmentModel, b: ApartmentModel) => 
          a.displayOrder - b.displayOrder || a.modelName.localeCompare(b.modelName)
        )
        setApartmentModels(sortedModels)
      } else {
        setError('فشل في تحميل نماذج الشقق')
      }
    } catch (error) {
      console.error('خطأ في تحميل نماذج الشقق:', error)
      setError('حدث خطأ أثناء تحميل نماذج الشقق')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, modelName: string) => {
    if (!confirm(`هل أنت متأكد من حذف النموذج ${modelName}؟`)) {
      return
    }

    try {
      setDeleting(id)
      const response = await apartmentsApi.delete(id)
      
      if (response.data.success) {
        setApartmentModels(apartmentModels.filter(model => model._id !== id))
      } else {
        setError('فشل في حذف النموذج')
      }
    } catch (error) {
      console.error('خطأ في حذف النموذج:', error)
      setError('حدث خطأ أثناء حذف النموذج')
    } finally {
      setDeleting(null)
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            نماذج الشقق
          </h1>
          <p className="text-gray-600 mt-2">إدارة نماذج الشقق والوحدات السكنية في المشروع</p>
        </div>
        <Link href="/dashboard/apartments/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            إضافة نموذج جديد
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي النماذج</p>
                <p className="text-2xl font-bold text-gray-900">{apartmentModels.length}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي النماذج</p>
                <p className="text-2xl font-bold text-blue-600">
                  {apartmentModels.length}
                </p>
              </div>
      
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">أقل سعر</p>
                <p className="text-2xl font-bold text-blue-600">
                  {apartmentModels.length > 0 
                    ? Math.min(...apartmentModels.map(m => m.price)).toLocaleString()
                    : 0
                  } ريال
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">أعلى سعر</p>
                <p className="text-2xl font-bold text-purple-600">
                  {apartmentModels.length > 0 
                    ? Math.max(...apartmentModels.map(m => m.price)).toLocaleString()
                    : 0
                  } ريال
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apartment Models Grid */}
      {apartmentModels.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نماذج شقق</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة نموذج الشقة الأول لمشروعك</p>
            <Link href="/dashboard/apartments/new">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                إضافة نموذج جديد
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartmentModels.map((model) => (
            <Card key={model._id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      {model.modelTitle}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{model.modelSubtitle}</p>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/dashboard/apartments/${model._id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Main Image */}
                {model.mainImage && (
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={model.images[0]}
                      alt={`${model.modelTitle} - ${model.modelSubtitle}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={85}
                      onError={(e) => {
                        console.error('Error loading apartment image:', model.images[0])
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Model Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">السعر</span>
                    <span className="text-lg font-bold text-green-600">
                      {model.price.toLocaleString()} {model.currency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المساحة</span>
                      <span className="font-medium">{model.area} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">السطح</span>
                      <span className="font-medium">{model.roofArea} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الغرف</span>
                      <span className="font-medium">{model.rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">دورات المياه</span>
                      <span className="font-medium">{model.bathrooms}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">الاتجاه</p>
                    <p className="text-sm font-medium">{model.direction}</p>
                  </div>

                  <div>
                    {(() => {
                      const cleanedFeatures = cleanFeatures(model.features)
                      return (
                        <>
                          <p className="text-sm text-gray-600 mb-2">المميزات ({cleanedFeatures.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {cleanedFeatures.slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                            {cleanedFeatures.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{cleanedFeatures.length - 3} أخرى
                              </span>
                            )}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/dashboard/apartments/${model._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      عرض
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/apartments/${model._id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <PencilIcon className="w-4 h-4 mr-2" />
                      تحرير
                    </Button>
                  </Link>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(model._id, model.modelName)}
                    disabled={deleting === model._id}
                    className="px-3"
                  >
                    {deleting === model._id ? (
                      <LoadingSpinner />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>

              {/* Status Badge */}
              {/* <div className="absolute top-4 right-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  model.status === 'active' ? 'bg-green-100 text-green-800' :
                  model.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {model.status === 'active' ? 'نشط' :
                   model.status === 'inactive' ? 'غير نشط' :
                   'مباع'}
                </span>
              </div> */}
            </Card>
          ))}
        </div>
      )}
    </div>
    <ToastContainer />
    </>
  )
}