'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mediaApi } from '../lib/api'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { 
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { cn } from '../lib/utils'

interface MediaFile {
  _id: string
  title: string
  description: string
  mediaType: 'image' | 'video' | 'document'
  category: string
  file?: {
    url: string
    originalName: string
    fileSize?: number
    mimeType: string
    dimensions?: {
      width: number
      height: number
    }
  }
  alt: string
  tags: string[]
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface ImageSelectorProps {
  onImageSelect: (image: MediaFile) => void
  selectedImageId?: string
  category?: string
  showPreview?: boolean
  className?: string
}

export default function ImageSelector({ 
  onImageSelect, 
  selectedImageId,
  category = 'project-photos',
  showPreview = true,
  className = ''
}: ImageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)

  // جلب قائمة الوسائط
  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media', category],
    queryFn: () => mediaApi.getAll({ category, mediaType: 'image' }),
    enabled: showModal
  })

  const allMedia = media?.data?.data || []
  const filteredMedia = allMedia.filter((item: MediaFile) => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch && item.isActive
  })

  const selectedImage = allMedia.find((item: MediaFile) => item._id === selectedImageId)

  const handleImageSelect = (image: MediaFile) => {
    onImageSelect(image)
    setShowModal(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت'
    const k = 1024
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Image Preview */}
      {showPreview && selectedImage && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
              {selectedImage.file?.url ? (
                <img
                  src={selectedImage.file.url}
                  alt={selectedImage.alt || selectedImage.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{selectedImage.title}</h4>
              {selectedImage.description && (
                <p className="text-sm text-gray-600 truncate">{selectedImage.description}</p>
              )}
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedImage.file?.fileSize || 0)}
              </p>
            </div>
            <button
              onClick={() => onImageSelect(null as any)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Select Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <PhotoIcon className="w-5 h-5" />
        {selectedImage ? 'تغيير الصورة' : 'اختيار صورة'}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">اختيار صورة</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الصور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pr-10"
                />
              </div>

              {/* Images Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="large" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">حدث خطأ في تحميل الصور</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد صور متاحة</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {filteredMedia.map((file: MediaFile) => (
                    <div
                      key={file._id}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all",
                        selectedImageId === file._id 
                          ? "ring-2 ring-primary" 
                          : "hover:ring-2 hover:ring-gray-300"
                      )}
                      onClick={() => handleImageSelect(file)}
                    >
                      {file.file?.url ? (
                        <img
                          src={file.file.url}
                          alt={file.alt || file.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Selection Indicator */}
                      {selectedImageId === file._id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Image Info Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="text-sm font-medium truncate">{file.title}</p>
                          <p className="text-xs opacity-90">
                            {formatFileSize(file.file?.fileSize || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
