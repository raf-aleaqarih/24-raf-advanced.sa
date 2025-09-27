'use client'

import { useState, useEffect } from 'react'

interface MapLocation {
  lat: number
  lng: number
  address: string
  zoom: number
  googleMapsUrl?: string
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  mapEmbedUrl?: string
  nearbyLandmarks?: Array<{
    name: string
    distance?: string
  }>
}

interface MapSectionProps {
  className?: string
}

export default function MapSection({ className = "" }: MapSectionProps) {
  const [mapLocation, setMapLocation] = useState<MapLocation>({
    lat: 21.60813558568744,
    lng: 39.14033718505742,
    address: 'حي الزهراء، جدة، المملكة العربية السعودية',
    zoom: 15,
    googleMapsUrl: '',
    mapType: 'roadmap'
  })
  
  const [isLoading, setIsLoading] = useState(true)

  // تحميل بيانات الخريطة من الـ API
  useEffect(() => {
    const loadMapData = async () => {
      try {
        // التحقق من وجود متغير البيئة
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
        if (!baseUrl) {
          console.log('NEXT_PUBLIC_API_URL غير محدد، استخدام البيانات الافتراضية')
          setIsLoading(false)
          return
        }

        const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
        const response = await fetch(`${apiUrl}/project/info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // إضافة timeout
          signal: AbortSignal.timeout(5000) // 5 ثوان
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data.location) {
          const location = data.data.location
          setMapLocation(prev => ({
            ...prev,
            lat: location.coordinates?.latitude || prev.lat,
            lng: location.coordinates?.longitude || prev.lng,
            address: location.address || prev.address,
            zoom: location.mapSettings?.zoom || prev.zoom,
            mapType: location.mapSettings?.mapType || prev.mapType,
            googleMapsUrl: location.googleMapsUrl || prev.googleMapsUrl,
            mapEmbedUrl: location.mapEmbedUrl || prev.mapEmbedUrl,
            nearbyLandmarks: location.nearbyLandmarks || prev.nearbyLandmarks
          }))
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات الخريطة:', error)
        // لا نعرض خطأ للمستخدم، فقط نستخدم البيانات الافتراضية
        console.log('استخدام البيانات الافتراضية للخريطة')
      } finally {
        setIsLoading(false)
      }
    }

    loadMapData()
  }, [])

  // إنشاء رابط الخريطة
  const generateMapUrl = () => {
    if (mapLocation.mapEmbedUrl) {
      return mapLocation.mapEmbedUrl
    }
    
    return `https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3709.430667951573!2d${mapLocation.lng}!3d${mapLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDM2JzI5LjMiTiAzOcKwMDgnMTcuMyJF!5e0!3m2!1sar!2seg!4v1752662254447!5m2!1sar!2seg&z=${mapLocation.zoom}`
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
        <div className="text-center py-6 bg-white">
          <h2 className="text-3xl md:text-4xl font-bold text-[#34222e] mb-4">موقع المشروع</h2>
          <div className="w-20 h-1 bg-[#c48765] mx-auto"></div>
        </div>
        
        <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#c48765] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      <div className="text-center py-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-[#34222e] mb-4">موقع المشروع</h2>
        <div className="w-20 h-1 bg-[#c48765] mx-auto"></div>
        </div>

      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
              <iframe
          src={generateMapUrl()}
          className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
          title="موقع المشروع على خرائط جوجل"
        />
                </div>

      <div className="bg-[#34222e] text-white py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">العنوان</h3>
            <p className="text-gray-300">{mapLocation.address}</p>
              </div>
          <div>
            <h3 className="text-xl font-bold mb-2">المعالم القريبة</h3>
            <ul className="text-gray-300 space-y-1">
              {mapLocation.nearbyLandmarks && mapLocation.nearbyLandmarks.length > 0 ? (
                mapLocation.nearbyLandmarks.map((landmark, index) => (
                  <li key={index}>• {typeof landmark === 'string' ? landmark : landmark.name} {landmark.distance && `(${landmark.distance})`}</li>
                ))
              ) : (
                <>
                  <li>• طريق الأمير سلطان</li>
                  <li>• شارع حراء</li>
                  <li>• شارع فهد بن زعير</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}