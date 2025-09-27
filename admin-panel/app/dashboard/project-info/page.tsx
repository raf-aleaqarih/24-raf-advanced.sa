'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { projectInfoAPI } from '../../../lib/api'
import { 
  PencilIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PhotoIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface ProjectInfo {
  _id: string
  projectName: string
  projectTitle: string
  projectSubtitle: string
  projectDescription: string
  location: {
    district: string
    city: string
    country: string
    coordinates: {
      latitude: number
      longitude: number
    }
    nearbyLandmarks: Array<{
      name: string
      distance: string
    }>
  }
  startingPrice: number
  currency: string
  backgroundImage: string
  projectImages: string[]
  projectVideo: {
    title: string
    youtubeId: string
    thumbnail: string
  }
  createdAt: string
  updatedAt: string
}

export default function ProjectInfoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchProjectInfo()
    
    // Check for success message from URL params
    const success = searchParams.get('success')
    if (success) {
      setSuccessMessage(success)
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [searchParams])

  const fetchProjectInfo = async () => {
    try {
      setLoading(true)
      const response = await projectInfoAPI.getProjectInfo()
      if (response.data.success) {
        setProjectInfo(response.data.data)
      } else {
        setError('فشل في تحميل معلومات المشروع')
      }
    } catch (error) {
      console.error('خطأ في تحميل معلومات المشروع:', error)
      setError('حدث خطأ أثناء تحميل معلومات المشروع')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchProjectInfo}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  if (!projectInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">لا توجد معلومات</h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على معلومات المشروع</p>
          <Link href="/dashboard/project-info/edit">
            <Button>إضافة معلومات المشروع</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <InformationCircleIcon className="w-8 h-8 text-blue-600" />
            معلومات المشروع
          </h1>
          <p className="text-gray-600 mt-2">إدارة وعرض معلومات المشروع الأساسية</p>
        </div>
        <Link href="/dashboard/project-info/edit">
          <Button className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
            تحرير المعلومات
          </Button>
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">اسم المشروع</h3>
                <p className="text-lg font-semibold text-gray-900">{projectInfo.projectName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">عنوان المشروع</h3>
                <p className="text-lg text-gray-900">{projectInfo.projectTitle}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">العنوان الفرعي</h3>
                <p className="text-md text-gray-700">{projectInfo.projectSubtitle}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">وصف المشروع</h3>
                <p className="text-gray-700 leading-relaxed">{projectInfo.projectDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">السعر الابتدائي</h3>
                  <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    {projectInfo.startingPrice.toLocaleString()} {projectInfo.currency}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">آخر تحديث</h3>
                  <p className="text-gray-700">
                    {new Date(projectInfo.updatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                معلومات الموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">الحي</h3>
                  <p className="text-gray-900">{projectInfo.location.district}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">المدينة</h3>
                  <p className="text-gray-900">{projectInfo.location.city}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">البلد</h3>
                  <p className="text-gray-900">{projectInfo.location.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">خط العرض</h3>
                  <p className="text-gray-900 font-mono">{projectInfo.location.coordinates.latitude}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">خط الطول</h3>
                  <p className="text-gray-900 font-mono">{projectInfo.location.coordinates.longitude}</p>
                </div>
              </div>

              {projectInfo.location.nearbyLandmarks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">المعالم القريبة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {projectInfo.location.nearbyLandmarks.map((landmark, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-900">{landmark.name}</span>
                        <span className="text-sm text-gray-500">{landmark.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhotoIcon className="w-5 h-5" />
                الوسائط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectInfo.backgroundImage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">صورة الخلفية</h3>
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={projectInfo.backgroundImage}
                      alt="صورة الخلفية"
                      className="w-full h-full object-cover"
                      // onError={(e) => {
                      //   e.currentTarget.src = '/placeholder.svg'
                      // }}
                    />
                  </div>
                </div>
              )}

              {projectInfo.projectImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    صور المشروع ({projectInfo.projectImages.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {projectInfo.projectImages.slice(0, 8).map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`صورة المشروع ${index + 1}`}
                          className="w-full h-full object-cover"
                          // onError={(e) => {
                          //   e.currentTarget.src = '/placeholder.svg'
                          // }}
                        />
                      </div>
                    ))}
                  </div>
                  {projectInfo.projectImages.length > 8 && (
                    <p className="text-sm text-gray-500 mt-2">
                      و {projectInfo.projectImages.length - 8} صورة أخرى...
                    </p>
                  )}
                </div>
              )}

              {projectInfo.projectVideo.youtubeId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">فيديو المشروع</h3>
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{projectInfo.projectVideo.title}</h4>
                      <p className="text-sm text-gray-500">
                        معرف يوتيوب: {projectInfo.projectVideo.youtubeId}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${projectInfo.projectVideo.youtubeId}`, '_blank')}
                    >
                      مشاهدة
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/project-info/edit">
                <Button className="w-full justify-start" variant="outline">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  تحرير معلومات المشروع
                </Button>
              </Link>

              <Link href="/dashboard/contact-settings">
                <Button className="w-full justify-start" variant="outline">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  إعدادات التواصل
                </Button>
              </Link>

              <Link href="/dashboard/apartments">
                <Button className="w-full justify-start" variant="outline">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  نماذج الشقق
                </Button>
              </Link>

              <Link href="/dashboard/features">
                <Button className="w-full justify-start" variant="outline">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  مميزات المشروع
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">صور المشروع</span>
                <span className="font-semibold">{projectInfo.projectImages.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">المعالم القريبة</span>
                <span className="font-semibold">{projectInfo.location.nearbyLandmarks.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">تاريخ الإنشاء</span>
                <span className="font-semibold text-sm">
                  {new Date(projectInfo.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}