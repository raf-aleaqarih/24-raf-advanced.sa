'use client'

import { useState, useRef } from 'react'

interface SingleImageUploadProps {
  onImageChange: (image: string) => void
  existingImage?: string
  placeholder?: string
}

export default function SingleImageUpload({ 
  onImageChange, 
  existingImage = '',
  placeholder = 'اسحب الصورة هنا أو انقر للاختيار'
}: SingleImageUploadProps) {
  const [image, setImage] = useState<string>(existingImage)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert(`الملف ${file.name} ليس صورة صالحة`)
      return
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      alert(`الملف ${file.name} كبير جداً (الحد الأقصى 5MB)`)
      return
    }

    setUploading(true)

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
        if (data.secure_url) {
          setImage(data.secure_url)
          onImageChange(data.secure_url)
        } else {
          console.error('لم يتم العثور على secure_url في الاستجابة:', data)
          alert(`فشل في رفع الصورة ${file.name}: لم يتم الحصول على رابط صحيح`)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('فشل في رفع الصورة إلى Cloudinary:', file.name, errorData)
        
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
    } finally {
      setUploading(false)
    }
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
      handleFile(e.dataTransfer.files[0])
    }
  }

  const removeImage = () => {
    setImage('')
    onImageChange('')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* معاينة الصورة الحالية */}
      {image && (
        <div className="relative inline-block">
          <img
            src={image}
            alt="الصورة المرفوعة"
            className="w-32 h-20 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* منطقة الرفع */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
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
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="space-y-2">
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="mr-2 text-gray-600">جاري الرفع...</span>
            </div>
          ) : (
            <>
              <div className="mx-auto h-8 w-8 text-gray-400 text-2xl">☁️</div>
              <div className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {placeholder}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF حتى 5MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
