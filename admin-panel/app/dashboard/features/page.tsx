'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { projectFeaturesAPI } from '../../../lib/api'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface ProjectFeature {
  _id: string
  title: string
  description: string
  icon: string
  featureType: string
  category: string
  displayOrder: number
  status: string
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export default function FeaturesPage() {
  const router = useRouter()
  const [features, setFeatures] = useState<ProjectFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await projectFeaturesAPI.getAllFeatures()
      if (response.data.success) {
        const sortedFeatures = response.data.data.sort((a: ProjectFeature, b: ProjectFeature) => 
          a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)
        )
        setFeatures(sortedFeatures)
      } else {
        setError('فشل في تحميل المميزات')
      }
    } catch (error) {
      console.error('خطأ في تحميل المميزات:', error)
      setError('حدث خطأ أثناء تحميل المميزات')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف الميزة "${title}"؟`)) {
      return
    }

    try {
      setDeleting(id)
      const response = await projectFeaturesAPI.deleteFeature(id)
      
      if (response.data.success) {
        setFeatures(features.filter(feature => feature._id !== id))
      } else {
        setError('فشل في حذف الميزة')
      }
    } catch (error) {
      console.error('خطأ في حذف الميزة:', error)
      setError('حدث خطأ أثناء حذف الميزة')
    } finally {
      setDeleting(null)
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await projectFeaturesAPI.updateFeature(id, {
        isVisible: !currentVisibility
      })
      
      if (response.data.success) {
        setFeatures(features.map(feature => 
          feature._id === id 
            ? { ...feature, isVisible: !currentVisibility }
            : feature
        ))
      } else {
        setError('فشل في تحديث حالة العرض')
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة العرض:', error)
      setError('حدث خطأ أثناء تحديث حالة العرض')
    }
  }

  const filteredFeatures = features.filter(feature => {
    if (filterType !== 'all' && feature.featureType !== filterType) return false
    if (filterCategory !== 'all' && feature.category !== filterCategory) return false
    return true
  })

  const getUniqueTypes = () => {
    const types = Array.from(new Set(features.map(f => f.featureType)))
    return types
  }

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(features.map(f => f.category)))
    return categories
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <StarIcon className="w-8 h-8 text-yellow-600" />
            مميزات المشروع
          </h1>
          <p className="text-gray-600 mt-2">إدارة مميزات المشروع والموقع</p>
        </div>
        <Link href="/dashboard/features/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            إضافة ميزة جديدة
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">نوع الميزة</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">جميع الأنواع</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>
                    {type === 'project' ? 'مميزات المشروع' :
                     type === 'location' ? 'مميزات الموقع' :
                     type === 'apartment' ? 'مميزات الشقق' :
                     type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الفئة</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">جميع الفئات</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'location' ? 'الموقع' :
                     category === 'services' ? 'الخدمات' :
                     category === 'warranty' ? 'الضمان' :
                     category === 'space' ? 'المساحة' :
                     category === 'parking' ? 'المواقف' :
                     category === 'technology' ? 'التكنولوجيا' :
                     category === 'transport' ? 'المواصلات' :
                     category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المميزات</p>
                <p className="text-2xl font-bold text-gray-900">{features.length}</p>
              </div>
              <StarIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المميزات المفعلة</p>
                <p className="text-2xl font-bold text-green-600">
                  {features.filter(f => f.isVisible).length}
                </p>
              </div>
              <EyeIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مميزات المشروع</p>
                <p className="text-2xl font-bold text-blue-600">
                  {features.filter(f => f.featureType === 'project').length}
                </p>
              </div>
              <StarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مميزات الموقع</p>
                <p className="text-2xl font-bold text-purple-600">
                  {features.filter(f => f.featureType === 'location').length}
                </p>
              </div>
              <StarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      {filteredFeatures.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مميزات</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة أول ميزة لمشروعك</p>
            <Link href="/dashboard/features/new">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                إضافة ميزة جديدة
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Card key={feature._id} className={`relative ${!feature.isVisible ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold mb-2">
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  {/* <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(feature._id, feature.isVisible)}
                      className="p-2"
                    >
                      {feature.isVisible ? (
                        <EyeIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div> */}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Feature Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">النوع:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.featureType === 'project' ? 'bg-blue-100 text-blue-800' :
                      feature.featureType === 'location' ? 'bg-green-100 text-green-800' :
                      feature.featureType === 'apartment' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {feature.featureType === 'project' ? 'مميزات المشروع' :
                       feature.featureType === 'location' ? 'مميزات الموقع' :
                       feature.featureType === 'apartment' ? 'مميزات الشقق' :
                       feature.featureType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">الفئة:</span>
                    <span className="text-sm text-gray-900">{feature.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">الأيقونة:</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                      {feature.icon}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">ترتيب العرض:</span>
                    <span className="text-sm font-bold text-gray-900">{feature.displayOrder}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/dashboard/features/${feature._id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <PencilIcon className="w-4 h-4 mr-2" />
                      تحرير
                    </Button>
                  </Link>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(feature._id, feature.title)}
                    disabled={deleting === feature._id}
                    className="px-3"
                  >
                    {deleting === feature._id ? (
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
                  feature.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {feature.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div> */}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}