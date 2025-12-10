'use client'

import { useQuery } from '@tanstack/react-query'
import { projectApi, apartmentsApi } from '../../lib/api'
import { 
  BuildingOfficeIcon,
  PhoneIcon,
  StarIcon,
  ShieldCheckIcon,
  PhotoIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatPrice } from '../../lib/utils'


export default function DashboardPage() {
  // جلب نماذج الشقق
  const { data: apartments, isLoading: apartmentsLoading } = useQuery({
    queryKey: ['apartments-overview'],
    queryFn: () => apartmentsApi.getAll({ limit: 5 }),
    enabled: true, // تفعيل الاستعلام
    retry: 3,
    refetchOnWindowFocus: false
  })

  // جلب معلومات المشروع
  const { data: projectInfo, isLoading: projectLoading } = useQuery({
    queryKey: ['project-info'],
    queryFn: () => projectApi.getInfo(),
    enabled: true, // تفعيل الاستعلام
    retry: 3,
    refetchOnWindowFocus: false
  })

  const isLoading = apartmentsLoading || projectLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="page-subtitle">
            نظرة عامة على مشروع 24 - حي الزهراء
          </p>
        </div>
      </div>


      {/* Project Overview */}
      <div className="grid grid-cols-1 gap-6">
        {/* Quick Stats */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">
              نظرة سريعة على المشروع
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">اسم المشروع</span>
              <span className="text-sm font-bold text-gray-900">{projectInfo?.data?.name || 'مشروع 24'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">الموقع</span>
              <span className="text-sm font-bold text-gray-900">{projectInfo?.data?.location?.address || 'حي الزهراء، جدة'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">نطاق الأسعار</span>
              <span className="text-sm font-bold text-gray-900">
                {projectInfo?.data?.pricing?.minPrice && projectInfo?.data?.pricing?.maxPrice ? 
                  `${formatPrice(projectInfo.data.pricing.minPrice)} - ${formatPrice(projectInfo.data.pricing.maxPrice)} ريال` : 
                  '830,000 - 1,350,000 ريال'
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">حالة المشروع</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {projectInfo?.data?.status === 'active' ? 'نشط' : 
                 projectInfo?.data?.status === 'completed' ? 'مكتمل' : 
                 projectInfo?.data?.status === 'under_construction' ? 'تحت الإنشاء' : 'نشط'}
              </span>
            </div>
          </div>
        </div>


      </div>

      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            إجراءات سريعة
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/dashboard/apartments/new"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:shadow-md"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-3 group-hover:bg-primary/20 transition-colors">
              <BuildingOfficeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">إضافة نموذج شقة</p>
              <p className="text-xs text-gray-500">إضافة نموذج شقة جديد</p>
            </div>
          </a>
          
          <a
            href="/dashboard/media/upload"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:shadow-md"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-3 group-hover:bg-primary/20 transition-colors">
              <PhotoIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">رفع وسائط</p>
              <p className="text-xs text-gray-500">رفع صور أو فيديوهات</p>
            </div>
          </a>
          
          <a
            href="/dashboard/features/new"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:shadow-md"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-3 group-hover:bg-primary/20 transition-colors">
              <StarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">إضافة ميزة</p>
              <p className="text-xs text-gray-500">إضافة ميزة جديدة للمشروع</p>
            </div>
          </a>

          <a
            href="/dashboard/warranties/new"
            className="group flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:shadow-md"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ml-3 group-hover:bg-primary/20 transition-colors">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">إضافة ضمان</p>
              <p className="text-xs text-gray-500">إضافة ضمان جديد للمشروع</p>
            </div>
          </a>
        </div>
      </div>


    </div>
  )
}
