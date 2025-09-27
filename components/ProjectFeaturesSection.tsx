'use client'

import { useState, useEffect } from 'react'
import { MapPin, Building2, Shield, Home, Car, Wifi, StoreIcon, Plane, Road, Star } from 'lucide-react'

interface ProjectFeature {
  _id?: string
  title: string
  description?: string
  icon: string
  featureType: 'project' | 'location'
  category: string
  displayOrder: number
  status: string
  isVisible: boolean
}

interface ProjectFeaturesSectionProps {
  className?: string
}

// مكتبة الأيقونات المتاحة
const iconLibrary = {
  MapPin: MapPin,
  Building2: Building2,
  Shield: Shield,
  Home: Home,
  Car: Car,
  Wifi: Wifi,
  StoreIcon: StoreIcon,
  Plane: Plane,
  Road: Road,
  Star: Star,
  // أيقونات مخصصة إضافية
  Mosque: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor">
      <g><rect fill="none" height="24" width="24" /></g>
      <g><g><path d="M7,8h10c0.29,0,0.57,0.06,0.84,0.13C17.93,7.8,18,7.46,18,7.09c0-1.31-0.65-2.53-1.74-3.25L12,1L7.74,3.84 C6.65,4.56,6,5.78,6,7.09C6,7.46,6.07,7.8,6.16,8.13C6.43,8.06,6.71,8,7,8z" /><path d="M24,7c0-1.1-2-3-2-3s-2,1.9-2,3c0,0.74,0.4,1.38,1,1.72V13h-2v-2c0-1.1-0.9-2-2-2H7c-1.1,0-2,0.9-2,2v2H3V8.72 C3.6,8.38,4,7.74,4,7c0-1.1-2-3-2-3S0,5.9,0,7c0,0.74,0.4,1.38,1,1.72V21h9v-4c0-1.1,0.9-2,2-2s2,0.9,2,2v4h9V8.72 C23.6,8.38,24,7.74,24,7z" /></g></g>
    </svg>
  ),
  Building: ({ className }: { className?: string }) => (
    <svg fill="#c48765" className={className} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.00 512.00" xmlSpace="preserve" stroke="#c48765" transform="rotate(0)">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g><g><path d="M366.933,0h-102.4v25.6c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V0h-102.4 c-4.71,0-8.533,3.814-8.533,8.533v494.933c0,4.719,3.823,8.533,8.533,8.533h102.4v-25.6c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V512h102.4c4.71,0,8.533-3.814,8.533-8.533V8.533C375.467,3.814,371.644,0,366.933,0z M196.267,307.2c0,4.719-3.823,8.533-8.533,8.533s-8.533-3.814-8.533-8.533V204.8c0-4.719,3.823-8.533,8.533-8.533 s8.533,3.814,8.533,8.533V307.2z M230.4,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M264.533,441.6c0,4.719-3.823,8.533-8.533,8.533 c-4.71,0-8.533-3.814-8.533-8.533v-29.867c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V441.6z M264.533,366.933c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533v-17.067c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V366.933z M264.533,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M264.533,162.133c0,4.719-3.823,8.533-8.533,8.533 c-4.71,0-8.533-3.814-8.533-8.533v-17.067c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V162.133z M264.533,100.267c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V70.4c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V100.267z M298.667,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M332.8,307.2c0,4.719-3.823,8.533-8.533,8.533 s-8.533-3.814-8.533-8.533V204.8c0-4.719,3.823-8.533,8.533-8.533s8.533,3.814,8.533,8.533V307.2z"></path></g></g>
      </g>
    </svg>
  ),
  Compass: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3L21 21" />
      <path d="M21 3L3 21" />
      <rect x="7" y="7" width="10" height="10" />
    </svg>
  )
}

// دالة للحصول على الأيقونة
const getIcon = (iconName: string, className: string = "h-6 w-6 text-[#c48765] ml-3 flex-shrink-0") => {
  const IconComponent = iconLibrary[iconName as keyof typeof iconLibrary]
  if (IconComponent) {
    return <IconComponent className={className} />
  }
  return <Home className={className} /> // أيقونة افتراضية
}

export default function ProjectFeaturesSection({ className = "" }: ProjectFeaturesSectionProps) {
  const [projectFeatures, setProjectFeatures] = useState<ProjectFeature[]>([])
  const [locationFeatures, setLocationFeatures] = useState<ProjectFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // تحميل المميزات من API
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
        const response = await fetch(`${apiUrl}/project/features`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const features = data.data
          setProjectFeatures(features.filter((f: ProjectFeature) => f.featureType === 'project'))
          setLocationFeatures(features.filter((f: ProjectFeature) => f.featureType === 'location'))
        }
      } catch (error) {
        console.error('خطأ في تحميل المميزات:', error)
        setError('حدث خطأ في تحميل المميزات')
      } finally {
        setIsLoading(false)
      }
    }

    loadFeatures()
  }, [])

  if (isLoading) {
    return (
      <div className={`py-12 bg-gradient-to-b from-slate-50 to-white ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#c48765] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل المميزات...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 bg-gradient-to-b from-slate-50 to-white ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#c48765] text-white rounded-lg hover:bg-[#34222e] transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className={`py-12 bg-gradient-to-b from-slate-50 to-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* مميزات المشروع */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
            <div className="flex items-center mb-8">
              <Home className="h-10 w-10 text-[#c48765]" />
              <h3 className="text-2xl font-bold mr-4">مميزات المشروع</h3>
            </div>
            <ul className="space-y-4 flex-grow">
              {projectFeatures.length > 0 ? projectFeatures.map((feature, index) => (
                <li key={feature._id || index} className="flex items-center p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  {getIcon(feature.icon)}
                  <span className="text-base">{feature.title}</span>
                </li>
              )) : [
                {
                  title: "موقع إستراتيجي قريب من الواجهة البحرية",
                  icon: "MapPin"
                },
                {
                  title: "قريب من جميع الخدمات",
                  icon: "Building2"
                },
                {
                  title: "ضمانات تصل إلى 25 سنة",
                  icon: "Shield"
                },
                {
                  title: "مساحات تصل إلى 220م²",
                  icon: "Home"
                },
                {
                  title: "مواقف سيارات مخصصة",
                  icon: "Car"
                },
                {
                  title: "سمارت هوم",
                  icon: "Wifi"
                }
              ].map((feature, index) => (
                <li key={index} className="flex items-center p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  {getIcon(feature.icon)}
                  <span className="text-base">{feature.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* مميزات الموقع */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
            <div className="flex items-center mb-8">
              <MapPin className="h-10 w-10 text-[#c48765]" />
              <h3 className="text-2xl font-bold mr-4">مميزات الموقع</h3>
            </div>
            <div className="space-y-6 flex-grow">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  <h4 className="text-lg font-bold mb-4">قريب من:</h4>
                  <ul className="space-y-3">
                    {locationFeatures.length > 0 ? locationFeatures.map((feature, index) => (
                      <li key={feature._id || index} className="flex items-center">
                        {getIcon(feature.icon)}
                        <span className="text-base">{feature.title}</span>
                      </li>
                    )) : [
                      {
                        title: "الشوارع الرئيسية",
                        icon: "Building"
                      },
                      {
                        title: "مسجد قريب",
                        icon: "Mosque"
                      },
                      {
                        title: "الخدمات",
                        icon: "StoreIcon"
                      },
                      {
                        title: "المراكز التجارية",
                        icon: "Building2"
                      },
                      {
                        title: "المطار",
                        icon: "Plane"
                      }
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        {getIcon(item.icon)}
                        <span className="text-base">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  <h4 className="text-lg font-bold mb-4">دقائق من:</h4>
                  <ul className="space-y-3">
                    {[
                      {
                        title: "طريق الأمير سلطان",
                        icon: "Road"
                      },
                      {
                        title: "شارع حراء",
                        icon: "Compass"
                      }
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        {getIcon(item.icon)}
                        <span className="text-base">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
