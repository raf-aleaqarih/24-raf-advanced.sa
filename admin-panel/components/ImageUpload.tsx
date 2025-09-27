'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function ImageUpload({ 
  onImagesChange, 
  maxImages = 10, 
  existingImages = [] 
}: ImageUploadProps) {
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

        const response = await fetch(`https://api.cloudinary.com/v1_1/dvaz05tc6/image/upload`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          newImages.push(data.secure_url)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('فشل في رفع الصورة إلى Cloudinary:', file.name, errorData)
          
          // عرض رسالة خطأ للمستخدم
          if (errorData.error?.message) {
            alert(`خطأ في رفع الصورة ${file.name}: ${errorData.error.message}`)
          } else if (errorData.message) {
            alert(`خطأ في رفع الصورة ${file.name}: ${errorData.message}`)
          }
        }
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error)
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
      {/* منطقة الرفع */}
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
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="space-y-2">
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-2 text-gray-600">جاري الرفع...</span>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  انقر لاختيار الصور
                </button>
                {' '}أو اسحبها هنا
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF حتى 5MB لكل صورة
              </p>
            </>
          )}
        </div>
      </div>

      {/* معاينة الصور */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="text-xs text-gray-500">
        {images.length} من {maxImages} صور
      </div>
    </div>
  )
}
