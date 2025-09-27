'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface ImageUploadBackendProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function ImageUploadBackend({ 
  onImagesChange, 
  maxImages = 10, 
  existingImages = [] 
}: ImageUploadBackendProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      alert(`يمكنك رفع ${maxImages} صور كحد أقصى`)
      return
    }

    setUploading(true)
    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert(`الملف ${file.name} ليس صورة صالحة`)
        continue
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert(`الملف ${file.name} كبير جداً (الحد الأقصى 5MB)`)
        continue
      }

      try {
        // رفع الصورة مباشرة إلى Cloudinary
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'project24-raf')
        formData.append('folder', 'project24/gallery')
        formData.append('api_key', '334711662413772')

        const response = await fetch(`https://api.cloudinary.com/v1_1/dvaz05tc6/image/upload`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          if (data.secure_url) {
            newImages.push(data.secure_url)
          } else {
            console.error('لم يتم العثور على secure_url في الاستجابة:', data)
            alert(`فشل في رفع الصورة ${file.name}: لم يتم الحصول على رابط صحيح`)
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('فشل في رفع الصورة إلى Cloudinary:', file.name, errorData)
          
          // عرض رسالة خطأ للمستخدم
          if (errorData.error?.message) {
            alert(`خطأ في رفع الصورة ${file.name}: ${errorData.error.message}`)
          } else if (errorData.message) {
            alert(`خطأ في رفع الصورة ${file.name}: ${errorData.message}`)
          } else {
            alert(`فشل في رفع الصورة ${file.name}. يرجى المحاولة مرة أخرى.`)
          }
        }
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error)
        alert(`خطأ في رفع الصورة ${file.name}. يرجى المحاولة مرة أخرى.`)
      }
    }

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onImagesChange(updatedImages)
    setUploading(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* منطقة السحب والإفلات */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {uploading ? 'جاري الرفع...' : 'اسحب الصور هنا أو انقر للاختيار'}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF حتى 5MB لكل صورة
          </p>
          <p className="text-xs text-gray-400">
            يمكنك رفع حتى {maxImages} صورة
          </p>
        </div>
        
        <button
          type="button"
          onClick={openFileDialog}
          disabled={uploading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'جاري الرفع...' : 'اختيار الصور'}
        </button>
      </div>

      {/* معاينة الصور */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`صورة ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* عداد الصور */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {images.length} من {maxImages} صورة
        </div>
      )}
    </div>
  )
}
