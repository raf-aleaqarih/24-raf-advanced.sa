'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

interface NearbyLandmark {
  id: string
  name: string
  type: 'street' | 'landmark' | 'service'
  distance?: string
}

interface MapLocation {
  lat: number
  lng: number
  address: string
  zoom: number
  googleMapsUrl?: string
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
}

export default function MapPage() {
  const router = useRouter()
  const [landmarks, setLandmarks] = useState<NearbyLandmark[]>([
    { id: '1', name: 'طريق الأمير سلطان', type: 'street' },
    { id: '2', name: 'شارع حراء', type: 'street' },
    { id: '3', name: 'شارع فهد بن زعير', type: 'street' }
  ])

  const [editingLandmark, setEditingLandmark] = useState<NearbyLandmark | null>(null)
  const [newLandmark, setNewLandmark] = useState({ name: '', type: 'street' as const, distance: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Map location state
  const [mapLocation, setMapLocation] = useState<MapLocation>({
    lat: 21.60813558568744,
    lng: 39.14033718505742,
    address: 'حي الزهراء، جدة، المملكة العربية السعودية',
    zoom: 15,
    googleMapsUrl: '',
    mapType: 'roadmap'
  })
  
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [isExtractingCoordinates, setIsExtractingCoordinates] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // دالة للتحقق من صحة التوكن
  const checkAuth = () => {
    const token = Cookies.get('admin_token')
    if (!token) {
      alert('يجب تسجيل الدخول أولاً')
      router.push('/login')
      return false
    }
    return true
  }

  // دالة معالجة الأخطاء
  const handleApiError = (error: any, operation: string) => {
    console.error(`خطأ في ${operation}:`, error)
    
    if (error?.response?.status === 401) {
      alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
      router.push('/login')
    } else {
      alert(`حدث خطأ في ${operation}: ${error?.response?.data?.message || error.message || 'خطأ غير معروف'}`)
    }
  }

  // تحميل بيانات الخريطة من الـ API
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
        const response = await fetch(`${apiUrl}/project/info`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('admin_token')}`
          }
        })

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
            googleMapsUrl: location.googleMapsUrl || prev.googleMapsUrl
          }))
          
          // تحميل المعالم القريبة
          if (location.nearbyLandmarks && location.nearbyLandmarks.length > 0) {
            const landmarksFromApi = location.nearbyLandmarks.map((landmark: any, index: number) => ({
              id: `api-${index}`,
              name: landmark.name,
              type: 'landmark' as const,
              distance: landmark.distance
            }))
            setLandmarks(landmarksFromApi)
          }
        }
      } catch (error) {
        handleApiError(error, 'تحميل بيانات الخريطة')
      } finally {
        setIsLoading(false)
      }
    }

    loadMapData()
  }, [])

  const addLandmark = () => {
    if (newLandmark.name.trim()) {
      const landmark: NearbyLandmark = {
        id: Date.now().toString(),
        name: newLandmark.name.trim(),
        type: newLandmark.type,
        distance: newLandmark.distance.trim()
      }
      setLandmarks([...landmarks, landmark])
      setNewLandmark({ name: '', type: 'street', distance: '' })
      setIsAdding(false)
    }
  }

  const updateLandmark = (id: string, updates: Partial<NearbyLandmark>) => {
    setLandmarks(landmarks.map(landmark => 
      landmark.id === id ? { ...landmark, ...updates } : landmark
    ))
    setEditingLandmark(null)
  }

  const deleteLandmark = (id: string) => {
    setLandmarks(landmarks.filter(landmark => landmark.id !== id))
    if (editingLandmark?.id === id) {
      setEditingLandmark(null)
    }
  }

  const updateMapLocation = (updates: Partial<MapLocation>) => {
    setMapLocation(prev => ({ ...prev, ...updates }))
  }

  const generateMapUrl = () => {
    return `https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3709.430667951573!2d${mapLocation.lng}!3d${mapLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDM2JzI5LjMiTiAzOcKwMDgnMTcuMyJF!5e0!3m2!1sar!2seg!4v1752662254447!5m2!1sar!2seg`
  }

  // استخراج الإحداثيات من رابط Google Maps
  const extractCoordinatesFromUrl = async () => {
    if (!googleMapsUrl.trim()) {
      alert('الرجاء إدخال رابط Google Maps')
      return
    }

    if (!checkAuth()) return

    setIsExtractingCoordinates(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
      const response = await fetch(`${apiUrl}/project/extract-coordinates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('admin_token')}`
        },
        body: JSON.stringify({ googleMapsUrl })
      })

      const data = await response.json()
      
      if (data.success) {
        setMapLocation(prev => ({
          ...prev,
          lat: data.data.latitude,
          lng: data.data.longitude,
          googleMapsUrl: data.data.googleMapsUrl
        }))
        setGoogleMapsUrl('')
        alert('تم استخراج الإحداثيات بنجاح!')
      } else {
        alert(data.message || 'حدث خطأ أثناء استخراج الإحداثيات')
      }
    } catch (error) {
      handleApiError(error, 'استخراج الإحداثيات')
    } finally {
      setIsExtractingCoordinates(false)
    }
  }

  const saveChanges = async () => {
    if (!checkAuth()) return

    setIsSaving(true)
    try {
      // تحويل المعالم إلى التنسيق المطلوب للـ API
      const nearbyLandmarks = landmarks.map(landmark => ({
        name: landmark.name,
        distance: landmark.distance || ''
      }))

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
      const response = await fetch(`${apiUrl}/project/map-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('admin_token')}`
        },
        body: JSON.stringify({
          latitude: mapLocation.lat,
          longitude: mapLocation.lng,
          zoom: mapLocation.zoom,
          mapType: mapLocation.mapType,
          googleMapsUrl: mapLocation.googleMapsUrl,
          address: mapLocation.address,
          nearbyLandmarks: nearbyLandmarks
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('تم حفظ التغييرات بنجاح!')
      } else {
        alert(data.message || 'حدث خطأ أثناء الحفظ')
      }
    } catch (error) {
      handleApiError(error, 'حفظ التغييرات')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#c48765] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الخريطة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة الخريطة والمعالم</h1>
          <p className="page-subtitle">
            إدارة موقع المشروع والمعالم القريبة
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditingLocation(!isEditingLocation)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MapPinIcon className="w-4 h-4" />
            {isEditingLocation ? 'إلغاء تعديل الموقع' : 'تعديل الموقع'}
          </button>
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckIcon className="w-4 h-4" />
            )}
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Map Preview */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="text-center py-6 bg-white">
          <h2 className="text-3xl md:text-4xl font-bold text-[#34222e] mb-4">موقع المشروع</h2>
          <div className="w-20 h-1 bg-[#c48765] mx-auto"></div>
        </div>
        
        <div className="relative w-full h-[400px]">
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
                {landmarks.map(landmark => (
                  <li key={landmark.id}>• {landmark.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps URL Extractor */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <LinkIcon className="h-8 w-8 text-[#c48765] ml-3" />
          <h2 className="text-2xl font-bold">استخراج الإحداثيات من رابط Google Maps</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">رابط Google Maps</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
                placeholder="https://maps.google.com/maps?q=21.60813558568744,39.14033718505742"
              />
              <button
                onClick={extractCoordinatesFromUrl}
                disabled={isExtractingCoordinates || !googleMapsUrl.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#c48765] text-white rounded-lg hover:bg-[#34222e] disabled:opacity-50"
              >
                {isExtractingCoordinates ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-4 h-4" />
                )}
                {isExtractingCoordinates ? 'جاري الاستخراج...' : 'استخراج الإحداثيات'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              يمكنك لصق أي رابط من Google Maps وسيتم استخراج الإحداثيات تلقائياً
            </p>
          </div>
        </div>
      </div>

      {/* Map Location Management */}
      {isEditingLocation && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-6">
            <MapPinIcon className="h-8 w-8 text-[#c48765] ml-3" />
            <h2 className="text-2xl font-bold">تعديل موقع المشروع</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">خط العرض (Latitude)</label>
              <input
                type="number"
                step="0.000001"
                value={mapLocation.lat}
                onChange={(e) => updateMapLocation({ lat: parseFloat(e.target.value) })}
                className="w-full p-3 border rounded-lg"
                placeholder="21.60813558568744"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">خط الطول (Longitude)</label>
              <input
                type="number"
                step="0.000001"
                value={mapLocation.lng}
                onChange={(e) => updateMapLocation({ lng: parseFloat(e.target.value) })}
                className="w-full p-3 border rounded-lg"
                placeholder="39.14033718505742"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <input
                type="text"
                value={mapLocation.address}
                onChange={(e) => updateMapLocation({ address: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="حي الزهراء، جدة، المملكة العربية السعودية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">رابط Google Maps</label>
              <input
                type="url"
                value={mapLocation.googleMapsUrl || ''}
                onChange={(e) => updateMapLocation({ googleMapsUrl: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="https://maps.google.com/maps?q=..."
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold mb-2">الإحداثيات الحالية:</h3>
            <p className="text-sm text-gray-600">
              خط العرض: {mapLocation.lat.toFixed(6)}<br/>
              خط الطول: {mapLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Landmarks Management */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-[#c48765] ml-3" />
            <h2 className="text-2xl font-bold">إدارة المعالم القريبة</h2>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#c48765] text-white rounded-lg hover:bg-[#34222e] transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            إضافة معلم
          </button>
        </div>

        {/* Add New Landmark */}
        {isAdding && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-3">إضافة معلم جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المعلم</label>
                <input
                  type="text"
                  value={newLandmark.name}
                  onChange={(e) => setNewLandmark({ ...newLandmark, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="مثال: شارع الملك فهد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع المعلم</label>
                <select
                  value={newLandmark.type}
                  onChange={(e) => setNewLandmark({ ...newLandmark, type: e.target.value as any })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="street">شارع</option>
                  <option value="landmark">معلم</option>
                  <option value="service">خدمة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المسافة (اختياري)</label>
                <input
                  type="text"
                  value={newLandmark.distance}
                  onChange={(e) => setNewLandmark({ ...newLandmark, distance: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="مثال: 5 دقائق"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={addLandmark}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckIcon className="w-4 h-4" />
                  إضافة
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewLandmark({ name: '', type: 'street', distance: '' })
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Landmarks List */}
        <div className="space-y-3">
          {landmarks.map((landmark) => (
            <div key={landmark.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              {editingLandmark?.id === landmark.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      value={editingLandmark.name}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, name: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <select
                      value={editingLandmark.type}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, type: e.target.value as any })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="street">شارع</option>
                      <option value="landmark">معلم</option>
                      <option value="service">خدمة</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editingLandmark.distance || ''}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, distance: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="المسافة"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateLandmark(landmark.id, editingLandmark)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingLandmark(null)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#c48765] rounded-full ml-3"></div>
                    <span className="font-medium">{landmark.name}</span>
                    <span className="mr-3 text-sm text-gray-500">
                      ({landmark.type === 'street' ? 'شارع' : landmark.type === 'landmark' ? 'معلم' : 'خدمة'})
                    </span>
                    {landmark.distance && (
                      <span className="mr-2 text-sm text-blue-600">
                        - {landmark.distance}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingLandmark(landmark)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteLandmark(landmark.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {landmarks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد معالم قريبة. اضغط على "إضافة معلم" لإضافة معلم جديد.
          </div>
        )}
      </div>
    </div>
  )
}
