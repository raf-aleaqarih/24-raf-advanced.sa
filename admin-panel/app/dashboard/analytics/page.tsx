'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../../lib/api'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { 
  ChartBarIcon,
  EyeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  // TrendingUpIcon,
  // TrendingDownIcon
} from '@heroicons/react/24/outline'
import { cn } from '../../../lib/utils'

interface AnalyticsData {
  overview: {
    totalViews: number
    totalInquiries: number
    totalApartments: number
    conversionRate: number
  }
  views: {
    daily: Array<{ date: string; views: number }>
    weekly: Array<{ week: string; views: number }>
    monthly: Array<{ month: string; views: number }>
  }
  inquiries: {
    daily: Array<{ date: string; inquiries: number }>
    bySource: Array<{ source: string; count: number }>
    byStatus: Array<{ status: string; count: number }>
  }
  apartments: {
    byStatus: Array<{ status: string; count: number }>
    byPriceRange: Array<{ range: string; count: number }>
    popularTypes: Array<{ type: string; count: number }>
  }
  trends: {
    viewsGrowth: number
    inquiriesGrowth: number
    apartmentsGrowth: number
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'views' | 'inquiries' | 'apartments'>('overview')

  // جلب بيانات التحليلات
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => analyticsApi.getAnalytics({ timeRange }),
  })

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
          <p className="text-gray-600">حدث خطأ أثناء تحميل بيانات التحليلات</p>
        </div>
      </div>
    )
  }

  const data: AnalyticsData = analytics?.data || {
    overview: {
      totalViews: 0,
      totalInquiries: 0,
      totalApartments: 0,
      conversionRate: 0
    },
    views: { daily: [], weekly: [], monthly: [] },
    inquiries: { daily: [], bySource: [], byStatus: [] },
    apartments: { byStatus: [], byPriceRange: [], popularTypes: [] },
    trends: { viewsGrowth: 0, inquiriesGrowth: 0, apartmentsGrowth: 0 }
  }

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }: {
    title: string
    value: string | number
    change?: { value: number; type: 'increase' | 'decrease' }
    icon: any
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500'
    }

    return (
      <div className="stat-card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`stat-card-icon ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mr-4 flex-1 min-w-0">
            <p className="stat-card-label">{title}</p>
            <p className="stat-card-value">{value}</p>
            {change && (
              <p className={`stat-card-change ${change.type === 'increase' ? 'positive' : 'negative'}`}>
                <span className="font-medium">
                  {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                </span>
                <span className="text-gray-500 mr-1">من الفترة السابقة</span>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">الإحصائيات والتحليلات</h1>
          <p className="page-subtitle">
            تحليل أداء المشروع ومراقبة المؤشرات الرئيسية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="form-select"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
            <option value="1y">آخر سنة</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المشاهدات"
          value={data.overview.totalViews.toLocaleString()}
          change={{
            value: data.trends.viewsGrowth,
            type: data.trends.viewsGrowth >= 0 ? 'increase' : 'decrease'
          }}
          icon={EyeIcon}
          color="blue"
        />
        
        <StatCard
          title="إجمالي الاستفسارات"
          value={data.overview.totalInquiries.toLocaleString()}
          change={{
            value: data.trends.inquiriesGrowth,
            type: data.trends.inquiriesGrowth >= 0 ? 'increase' : 'decrease'
          }}
          icon={PhoneIcon}
          color="green"
        />
        
        <StatCard
          title="نماذج الشقق"
          value={data.overview.totalApartments}
          change={{
            value: data.trends.apartmentsGrowth,
            type: data.trends.apartmentsGrowth >= 0 ? 'increase' : 'decrease'
          }}
          icon={BuildingOfficeIcon}
          color="purple"
        />
        
        <StatCard
          title="معدل التحويل"
          value={`${data.overview.conversionRate.toFixed(1)}%`}
          icon={ChartBarIcon}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="section-card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'نظرة عامة', icon: ChartBarIcon },
              { id: 'views', name: 'المشاهدات', icon: EyeIcon },
              { id: 'inquiries', name: 'الاستفسارات', icon: PhoneIcon },
              { id: 'apartments', name: 'الشقق', icon: BuildingOfficeIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views Chart */}
                <div className="section-card">
                  <div className="section-header">
                    <h3 className="section-title">المشاهدات اليومية</h3>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">رسم بياني للمشاهدات</p>
                    </div>
                  </div>
                </div>

                {/* Inquiries Chart */}
                <div className="section-card">
                  <div className="section-header">
                    <h3 className="section-title">الاستفسارات اليومية</h3>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <PhoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">رسم بياني للاستفسارات</p>
                    </div>
                  </div>
                </div>
              </div>

    

            </div>
          )}

          {/* Views Tab */}


        </div>
      </div>
    </div>
  )
}
