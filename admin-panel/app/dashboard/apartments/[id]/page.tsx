'use client'

import { useQuery } from '@tanstack/react-query'
import { apartmentsApi } from '../../../../lib/api'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { formatPrice } from '../../../../lib/utils'
import { 
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  HomeIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '../../../../lib/utils'

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

export default function ApartmentDetailsPage() {
  const params = useParams()
  const apartmentId = params.id as string

  // جلب بيانات الشقة
  const { data: apartment, isLoading, error } = useQuery({
    queryKey: ['apartment', apartmentId],
    queryFn: () => apartmentsApi.getById(apartmentId),
    enabled: !!apartmentId
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error || !apartment?.data?.data) {
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

  const apartmentData = apartment.data.data

  // معالجة البيانات للتأكد من صحة التنسيق
  const processedApartment = {
    ...apartmentData,
    features: Array.isArray(apartmentData.features) 
      ? cleanFeatures(apartmentData.features.map((feature: any) => {
          if (typeof feature === 'string') {
            return feature;
          }
          if (typeof feature === 'object' && feature !== null) {
            return feature.name || feature.title || feature.label || 'ميزة';
          }
          return 'ميزة';
        }))
      : [],
    images: Array.isArray(apartmentData.images) ? apartmentData.images : [],
    price: apartmentData.price || { amount: 0, currency: 'SAR' },
    area: apartmentData.area || 0,
    rooms: apartmentData.rooms || 0,
    bathrooms: apartmentData.bathrooms || 0,
    title: apartmentData.title || apartmentData.name || 'شقة',
    description: apartmentData.description || '',
    status: apartmentData.status || 'inactive'
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
            <h1 className="page-title">تفاصيل الشقة</h1>
            <p className="page-subtitle">
              {processedApartment.title}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/apartments/${apartmentId}/edit`}
            className="btn-primary flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            تعديل
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {processedApartment.images.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">الصور</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedApartment.images.map((image: any, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.alt || processedApartment.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">الوصف</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {processedApartment.description || 'لا يوجد وصف متاح'}
              </p>
            </div>
          </div>

          {/* Features */}
          {processedApartment.features.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">المميزات</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {processedApartment.features.map((feature: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          {/* <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">الحالة</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                processedApartment.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}>
                {processedApartment.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div> */}

          {/* Specifications */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">المواصفات</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HomeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">المساحة</p>
                  <p className="font-medium">{processedApartment.area} م²</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <HomeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">عدد الغرف</p>
                  <p className="font-medium">{processedApartment.rooms}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <HomeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">عدد الحمامات</p>
                  <p className="font-medium">{processedApartment.bathrooms}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">السعر</h2>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(processedApartment.price.amount)}
                </p>
                <p className="text-sm text-gray-500">
                  {processedApartment.price.currency === 'SAR' ? 'ريال سعودي' : 
                   processedApartment.price.currency === 'USD' ? 'دولار أمريكي' : 
                   processedApartment.price.currency === 'EUR' ? 'يورو' : 
                   processedApartment.price.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="section-card">
            <div className="space-y-3">
              <Link
                href={`/dashboard/apartments/${apartmentId}/edit`}
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                تعديل الشقة
              </Link>
              
              <Link
                href="/dashboard/apartments"
                className="btn-secondary w-full text-center"
              >
                العودة للقائمة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
