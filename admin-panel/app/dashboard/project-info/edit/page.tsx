'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { projectInfoAPI } from '../../../../lib/api'
import ImageUpload from '../../../../components/ImageUpload'
import SingleImageUpload from '../../../../components/SingleImageUpload'

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
}

export default function EditProjectInfoPage() {
  const router = useRouter()
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjectInfo()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectInfo) return

    try {
      setSaving(true)
      setError('')

      const response = await projectInfoAPI.updateProjectInfo(projectInfo._id, projectInfo)
      
      if (response.data.success) {
        router.push('/dashboard/project-info?success=تم تحديث معلومات المشروع بنجاح')
      } else {
        setError('فشل في تحديث معلومات المشروع')
      }
    } catch (error) {
      console.error('خطأ في تحديث معلومات المشروع:', error)
      setError('حدث خطأ أثناء تحديث معلومات المشروع')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!projectInfo) return
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      const parentValue = projectInfo[parent as keyof ProjectInfo] as any
      setProjectInfo({
        ...projectInfo,
        [parent]: {
          ...parentValue,
          [child]: value
        }
      })
    } else {
      setProjectInfo({
        ...projectInfo,
        [field]: value
      })
    }
  }

  const handleCoordinatesChange = (field: 'latitude' | 'longitude', value: string) => {
    if (!projectInfo) return
    
    setProjectInfo({
      ...projectInfo,
      location: {
        ...projectInfo.location,
        coordinates: {
          ...projectInfo.location.coordinates,
          [field]: parseFloat(value) || 0
        }
      }
    })
  }

  const addLandmark = () => {
    if (!projectInfo) return
    
    setProjectInfo({
      ...projectInfo,
      location: {
        ...projectInfo.location,
        nearbyLandmarks: [
          ...projectInfo.location.nearbyLandmarks,
          { name: '', distance: '' }
        ]
      }
    })
  }

  const updateLandmark = (index: number, field: 'name' | 'distance', value: string) => {
    if (!projectInfo) return
    
    const updatedLandmarks = [...projectInfo.location.nearbyLandmarks]
    updatedLandmarks[index] = {
      ...updatedLandmarks[index],
      [field]: value
    }
    
    setProjectInfo({
      ...projectInfo,
      location: {
        ...projectInfo.location,
        nearbyLandmarks: updatedLandmarks
      }
    })
  }

  const removeLandmark = (index: number) => {
    if (!projectInfo) return
    
    setProjectInfo({
      ...projectInfo,
      location: {
        ...projectInfo.location,
        nearbyLandmarks: projectInfo.location.nearbyLandmarks.filter((_, i) => i !== index)
      }
    })
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (!projectInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على معلومات المشروع</p>
          <Button onClick={() => router.push('/dashboard/project-info')}>
            العودة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">تحرير معلومات المشروع</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/project-info')}
        >
          العودة
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات المشروع الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المشروع الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المشروع</label>
              <Input
                value={projectInfo.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">عنوان المشروع</label>
              <Input
                value={projectInfo.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
              <Input
                value={projectInfo.projectSubtitle}
                onChange={(e) => handleInputChange('projectSubtitle', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وصف المشروع</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                value={projectInfo.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">السعر الابتدائي</label>
                <Input
                  type="number"
                  value={projectInfo.startingPrice}
                  onChange={(e) => handleInputChange('startingPrice', parseInt(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">العملة</label>
                <Input
                  value={projectInfo.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات الموقع */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الموقع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الحي</label>
                <Input
                  value={projectInfo.location.district}
                  onChange={(e) => handleInputChange('location.district', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المدينة</label>
                <Input
                  value={projectInfo.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البلد</label>
                <Input
                  value={projectInfo.location.country}
                  onChange={(e) => handleInputChange('location.country', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">خط العرض</label>
                <Input
                  type="number"
                  step="any"
                  value={projectInfo.location.coordinates.latitude}
                  onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">خط الطول</label>
                <Input
                  type="number"
                  step="any"
                  value={projectInfo.location.coordinates.longitude}
                  onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* المعالم القريبة */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">المعالم القريبة</label>
                <Button type="button" onClick={addLandmark} size="sm">
                  إضافة معلم
                </Button>
              </div>
              
              {projectInfo.location.nearbyLandmarks.map((landmark, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم المعلم</label>
                    <Input
                      value={landmark.name}
                      onChange={(e) => updateLandmark(index, 'name', e.target.value)}
                      placeholder="اسم المعلم"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">المسافة</label>
                    <Input
                      value={landmark.distance}
                      onChange={(e) => updateLandmark(index, 'distance', e.target.value)}
                      placeholder="المسافة"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeLandmark(index)}
                      size="sm"
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الوسائط */}
        <Card>
          <CardHeader>
            <CardTitle>الوسائط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* صورة الخلفية */}
            <div>
              <label className="block text-sm font-medium mb-2">صورة الخلفية</label>
              <SingleImageUpload
                onImageChange={(image: string) => handleInputChange('backgroundImage', image)}
                existingImage={projectInfo.backgroundImage}
                placeholder="اسحب صورة الخلفية هنا أو انقر للاختيار"
              />
            </div>

            {/* صور المشروع */}
            <div>
              <label className="block text-sm font-medium mb-2">صور المشروع</label>
              <ImageUpload
                onImagesChange={(images) => handleInputChange('projectImages', images)}
                maxImages={10}
                existingImages={projectInfo.projectImages}
              />
            </div>

            {/* معلومات الفيديو */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان الفيديو</label>
                <Input
                  value={projectInfo.projectVideo.title}
                  onChange={(e) => handleInputChange('projectVideo.title', e.target.value)}
                  placeholder="عنوان الفيديو"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">معرف يوتيوب</label>
                <Input
                  value={projectInfo.projectVideo.youtubeId}
                  onChange={(e) => handleInputChange('projectVideo.youtubeId', e.target.value)}
                  placeholder="معرف الفيديو من يوتيوب"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">صورة الفيديو المصغرة</label>
                <SingleImageUpload
                  onImageChange={(image: string) => handleInputChange('projectVideo.thumbnail', image)}
                  existingImage={projectInfo.projectVideo.thumbnail}
                  placeholder="اسحب صورة الفيديو هنا أو انقر للاختيار"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/project-info')}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}
