'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { publicApartmentsApi } from '../lib/api'
// import { LoadingSpinner } from './ui/LoadingSpinner'

interface Apartment {
  _id: string
  modelName: string
  modelTitle: string
  modelSubtitle: string
  price: number
  area: number
  rooms: number
  bathrooms: number
  location: string
  direction: string
  images: string[]
  features: string[]
  status: 'active' | 'inactive' | 'sold_out'
}

export default function ApartmentsSection() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true)
        console.log('جاري جلب النماذج من الخادم...')
        const response = await publicApartmentsApi.getAll()
        
        console.log('استجابة الخادم:', response.data)
        
        if (response.data.success) {
          setApartments(response.data.data)
          console.log('تم تحميل النماذج بنجاح:', response.data.data.length)
        } else {
          setError('فشل في تحميل النماذج')
        }
      } catch (err) {
        console.error('Error fetching apartments:', err)
        setError('حدث خطأ في تحميل النماذج')
      } finally {
        setLoading(false)
      }
    }

    fetchApartments()
  }, [])

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل النماذج...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (apartments.length === 0) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">لا توجد نماذج متاحة حالياً</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#34222e] mb-4">
            نماذج الشقق المتاحة
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة متنوعة من النماذج المصممة بعناية لتلبي احتياجاتك المختلفة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apartments.map((apartment) => (
            <div key={apartment._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* صورة الشقة */}
              <div className="h-64 bg-gray-200 relative">
                {apartment.images && apartment.images.length > 0 ? (
                  <Image
                    src={apartment.images[0]}
                    alt={`${apartment.modelTitle} - ${apartment.modelSubtitle}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={85}
                    onError={(e) => {
                      console.error('Error loading image:', apartment.images[0])
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center text-gray-400 ${apartment.images && apartment.images.length > 0 ? 'hidden' : ''}`}>
                  <span>لا توجد صورة</span>
                </div>
                
                {/* السعر */}
                <div className="absolute top-4 right-4">
                  <span className="bg-[#34222e] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {apartment.price.toLocaleString()} ريال
                  </span>
                </div>
              </div>

              {/* محتوى الشقة */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#34222e] mb-2">
                  {apartment.modelTitle}
                </h3>
                
                <p className="text-gray-600 mb-2">
                  {apartment.modelSubtitle}
                </p>

                {/* المواصفات */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c48765]">
                      {apartment.rooms}
                    </div>
                    <div className="text-sm text-gray-500">غرف</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c48765]">
                      {apartment.bathrooms}
                    </div>
                    <div className="text-sm text-gray-500">حمامات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#c48765]">
                      {apartment.area}
                    </div>
                    <div className="text-sm text-gray-500">م²</div>
                  </div>
                </div>

                {/* الموقع والاتجاه */}
                <div className="mb-4 text-sm text-gray-600">
                  <p>الموقع: {apartment.location}</p>
                  <p>الاتجاه: {apartment.direction}</p>
                </div>

                {/* المميزات */}
                {apartment.features && apartment.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">المميزات:</h4>
                    <div className="flex flex-wrap gap-2">
                      {apartment.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-[#c48765]/10 text-[#c48765] text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                      {apartment.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{apartment.features.length - 3} أخرى
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* زر الاستفسار */}
                <button 
                  onClick={() => {
                    // تمرير معلومات الشقة إلى النموذج
                    const form = document.getElementById('contact-form') as HTMLFormElement;
                    if (form) {
                      const messageField = form.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                      if (messageField) {
                        messageField.value = `أريد الاستفسار عن ${apartment.modelTitle}`;
                      }
                      form.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full bg-[#c48765] text-white py-2 px-4 rounded-lg hover:bg-[#34222e] transition-colors duration-200"
                >
                  استفسر عن هذا النموذج
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
