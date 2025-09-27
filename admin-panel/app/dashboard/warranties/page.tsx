'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warrantiesApi } from '../../../lib/api'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { cn } from '../../../lib/utils'

interface Warranty {
  _id: string
  title: string
  description: string
  warrantyType: string
  years: number
  category: string
  displayOrder: number
  status: 'active' | 'inactive'
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export default function WarrantiesPage() {
  const queryClient = useQueryClient()

  // جلب قائمة الضمانات
  const { data: warranties, isLoading, error } = useQuery({
    queryKey: ['warranties'],
    queryFn: () => warrantiesApi.getAll({ limit: 50 }),
  })

  // حذف ضمان
  const deleteMutation = useMutation({
    mutationFn: (id: string) => warrantiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الضمان؟')) {
      deleteMutation.mutate(id)
    }
  }

  const warrantiesList = warranties?.data?.data || []

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
          <p className="text-gray-600">حدث خطأ أثناء تحميل قائمة الضمانات</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ضمانات المشروع</h1>
            <p className="text-gray-600 text-sm">إدارة وضبط ضمانات المشروع العقاري</p>
          </div>
        </div>
        <Link
          href="/dashboard/warranties/new"
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          سجل الآن
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* سنة انجاز مالوك */}
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-500 mb-1">1</div>
          <div className="text-xs text-gray-600 mb-1">سنة</div>
          <div className="text-sm font-medium text-gray-800">انجاز مالوك</div>
        </div>
        
        {/* سنتين سمارت هوم */}
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-500 mb-1">2</div>
          <div className="text-xs text-gray-600 mb-1">سنتين</div>
          <div className="text-sm font-medium text-gray-800">سمارت هوم</div>
        </div>
        
        {/* أعمال السباكة والكهرباء */}
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-500 mb-1">2</div>
          <div className="text-xs text-gray-600 mb-1">سنتين</div>
          <div className="text-sm font-medium text-gray-800">أعمال السباكة والكهرباء</div>
        </div>
        
        {/* المصاعد */}
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-500 mb-1">5</div>
          <div className="text-xs text-gray-600 mb-1">سنوات</div>
          <div className="text-sm font-medium text-gray-800">المصاعد</div>
        </div>
        
        {/* الهيكل الإنشائي */}
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-500 mb-1">20</div>
          <div className="text-xs text-gray-600 mb-1">سنوات</div>
          <div className="text-sm font-medium text-gray-800">الهيكل الإنشائي</div>
        </div>
        
        {/* القواطع والأقواس */}
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-500 mb-1">20</div>
          <div className="text-xs text-gray-600 mb-1">سنوات</div>
          <div className="text-sm font-medium text-gray-800">القواطع والأقواس</div>
        </div>
      </div>

      {/* Warranties Management Section */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">إدارة الضمانات</h2>
          <p className="text-sm text-gray-600 mt-1">قائمة جميع ضمانات المشروع والتحكم بها</p>
        </div>
        
        <div className="p-6">
          {warrantiesList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد ضمانات</h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة أول ضمان للمشروع</p>
              <Link
                href="/dashboard/warranties/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                إضافة ضمان جديد
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warrantiesList.map((warranty: Warranty) => (
                <div key={warranty._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">{warranty.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/warranties/${warranty._id}/edit`}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => handleDelete(warranty._id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {warranty.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{warranty.years} سنة</span>
                    </div>
                    
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      warranty.status === 'active'
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {warranty.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}