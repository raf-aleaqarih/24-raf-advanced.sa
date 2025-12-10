'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaApi } from '../lib/api'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { 
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
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

interface UploadedFile {
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  result?: any
}

interface GalleryManagerProps {
  onImageSelect?: (image: MediaFile) => void
  selectedImages?: string[]
  multiSelect?: boolean
  showUpload?: boolean
  category?: string
}

export default function GalleryManager({
  onImageSelect,
  selectedImages = [],
  multiSelect = false,
  showUpload = true,
  category = 'project-photos'
}: GalleryManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    alt: '',
    tags: '',
    isActive: true
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // جلب قائمة الوسائط
  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media', category],
    queryFn: () => mediaApi.getAll({ category, mediaType: 'image' }),
  })

  // رفع ملفات جديدة
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => mediaApi.uploadMultiple(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      setUploadedFiles(prev => prev.map(file => ({
        ...file,
        status: 'success' as const,
        progress: 100,
        result: data.data?.data?.find((item: any) => item.file?.originalName === file.file.name) || null
      })))
      setShowUploadModal(false)
      setUploadedFiles([])
    },
    onError: (error: any) => {
      setUploadedFiles(prev => prev.map(file => ({
        ...file,
        status: 'error' as const,
        error: error.message || 'خطأ في الرفع'
      })))
    }
  })

  // حذف ملف
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })

  // تحديث ملف
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => mediaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      setEditingItem(null)
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (item: MediaFile) => {
    setEditingItem(item._id)
    setEditForm({
      title: item.title,
      description: item.description,
      alt: item.alt,
      tags: item.tags.join(', '),
      isActive: item.isActive
    })
  }

  const handleSaveEdit = () => {
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem,
        data: {
          ...editForm,
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditForm({
      title: '',
      description: '',
      alt: '',
      tags: '',
      isActive: true
    })
  }

  const handleImageSelect = (image: MediaFile) => {
    if (onImageSelect) {
      onImageSelect(image)
    }
  }

  // Drag & Drop handlers
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
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length !== files.length) {
      alert('يُسمح برفع الصور فقط')
      return
    }

    const newFiles: UploadedFile[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('يرجى اختيار ملفات للرفع')
      return
    }

    const formDataToSend = new FormData()
    
    // Add files
    uploadedFiles.forEach(file => {
      formDataToSend.append('files', file.file)
    })
    
    // Add category
    formDataToSend.append('category', category)

    // Update files status to uploading
    setUploadedFiles(prev => prev.map(file => ({
      ...file,
      status: 'uploading',
      progress: 0
    })))

    try {
      await uploadMutation.mutateAsync(formDataToSend)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت'
    const k = 1024
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-8 h-8 text-blue-500" />
      case 'video':
        return <VideoCameraIcon className="w-8 h-8 text-red-500" />
      case 'document':
        return <DocumentIcon className="w-8 h-8 text-gray-500" />
      default:
        return <DocumentIcon className="w-8 h-8 text-gray-500" />
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'uploading':
        return <LoadingSpinner size="small" />
      default:
        return <PhotoIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return 'تم الرفع بنجاح'
      case 'error':
        return 'خطأ في الرفع'
      case 'uploading':
        return 'جاري الرفع...'
      default:
        return 'في الانتظار'
    }
  }

  const allMedia = media?.data?.data || []
  const filteredMedia = allMedia.filter((item: MediaFile) => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
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
          <p className="text-gray-600">حدث خطأ أثناء تحميل معرض الصور</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">معرض الصور</h2>
          <p className="text-sm text-gray-600">إدارة صور المشروع</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-secondary flex items-center gap-2"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            {viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكة'}
          </button>
          {showUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              رفع صور جديدة
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="البحث في صور المشروع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pr-10"
        />
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((file: MediaFile) => (
            <div key={file._id} className="card card-hover">
              <div className="relative">
                {/* File Preview */}
                <div className="h-48 bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
                  {file.mediaType === 'image' && file.file?.url ? (
                    <img
                      src={file.file.url}
                      alt={file.alt || file.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleImageSelect(file)}
                    />
                  ) : null}
                  <div className={`text-center ${file.mediaType === 'image' && file.file?.url ? 'hidden' : 'flex flex-col items-center justify-center h-full'}`}>
                    {getFileIcon(file.mediaType)}
                    <p className="text-sm text-gray-600 mt-2">{file.title}</p>
                    {!file.file?.url && (
                      <p className="text-xs text-gray-500 mt-1">لا توجد صورة</p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                {/* <div className="absolute top-2 right-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    file.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {file.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div> */}

                {/* Selection Indicator */}
                {selectedImages.includes(file._id) && (
                  <div className="absolute top-2 left-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Actions Menu */}
                <div className="absolute top-2 left-2">
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-600" />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => file.file?.url ? window.open(file.file.url, '_blank') : null}
                                disabled={!file.file?.url}
                                className={cn(
                                  'flex items-center w-full px-4 py-2 text-sm transition-colors',
                                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700',
                                  !file.file?.url ? 'opacity-50 cursor-not-allowed' : ''
                                )}
                              >
                                <EyeIcon className="w-4 h-4 ml-3" />
                                عرض
                              </button>
                            )}
                          </Menu.Item>
          
                          
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleEdit(file)}
                                className={cn(
                                  'flex items-center w-full px-4 py-2 text-sm transition-colors',
                                  active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                )}
                              >
                                <PencilIcon className="w-4 h-4 ml-3" />
                                تعديل
                              </button>
                            )}
                          </Menu.Item>
                          
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDelete(file._id)}
                                className={cn(
                                  'flex items-center w-full px-4 py-2 text-sm transition-colors text-red-600',
                                  active ? 'bg-red-50' : ''
                                )}
                              >
                                <TrashIcon className="w-4 h-4 ml-3" />
                                حذف
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>

              {/* File Info */}
              <div className="card-body">
                {editingItem === file._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="form-input text-sm"
                      placeholder="العنوان"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="form-input text-sm"
                      rows={2}
                      placeholder="الوصف"
                    />
                    <input
                      type="text"
                      value={editForm.alt}
                      onChange={(e) => setEditForm(prev => ({ ...prev, alt: e.target.value }))}
                      className="form-input text-sm"
                      placeholder="النص البديل"
                    />
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="form-input text-sm"
                      placeholder="التاغات (مفصولة بفواصل)"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="btn-primary btn-sm flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" />
                        حفظ
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-secondary btn-sm flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900 truncate mb-2">
                      {file.title}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>الحجم:</span>
                        <span>{formatFileSize(file.file?.fileSize || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الأبعاد:</span>
                        <span>
                          {file.file?.dimensions?.width && file.file?.dimensions?.height 
                            ? `${file.file.dimensions.width} × ${file.file.dimensions.height}`
                            : 'غير محدد'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>التاريخ:</span>
                        <span>{new Date(file.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    {file.tags && file.tags.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {file.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                          {file.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              +{file.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">الصورة</th>
                <th className="table-header-cell">العنوان</th>
                <th className="table-header-cell">الحالة</th>
                <th className="table-header-cell">الحجم</th>
                <th className="table-header-cell">التاريخ</th>
                <th className="table-header-cell">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredMedia.map((file: MediaFile) => (
                <tr key={file._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {file.mediaType === 'image' && file.file?.url ? (
                          <img
                            src={file.file.url}
                            alt={file.alt || file.title}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${file.mediaType === 'image' && file.file?.url ? 'hidden' : 'flex'}`}>
                          {getFileIcon(file.mediaType)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.title}</p>
                        {file.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">{file.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-gray-900">
                      {file.title}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      file.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    )}>
                      {file.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-600">
                      {formatFileSize(file.file?.fileSize || 0)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-600">
                      {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </td>
                  <td className="table-cell-action">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => file.file?.url ? window.open(file.file.url, '_blank') : null}
                        disabled={!file.file?.url}
                        className={`btn-ghost btn-sm ${!file.file?.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="عرض"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleImageSelect(file)}
                        className="btn-ghost btn-sm"
                        title="اختيار"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(file)}
                        className="btn-ghost btn-sm"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(file._id)}
                        className="btn-ghost btn-sm text-red-600 hover:text-red-700"
                        title="حذف"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhotoIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد صور مشروع متاحة
          </h3>
          <p className="text-gray-600 mb-6">
            ابدأ برفع أول صورة للمشروع
          </p>
          {showUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              رفع صور المشروع
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">رفع صور المشروع</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-300 hover:border-gray-400"
                )}
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
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      اسحب الصور هنا أو انقر للاختيار
                    </h4>
                    <p className="text-gray-600">
                      يُسمح برفع ملفات JPG, PNG, GIF حتى 10 ميجابايت
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary"
                  >
                    اختيار الملفات
                  </button>
                </div>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    الملفات المختارة ({uploadedFiles.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {/* Preview */}
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(file.file.size / 1024 / 1024).toFixed(2)} ميجابايت
                          </p>
                          
                          {/* Progress Bar */}
                          {file.status === 'uploading' && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Error Message */}
                          {file.status === 'error' && file.error && (
                            <p className="text-sm text-red-600 mt-1">
                              {file.error}
                            </p>
                          )}
                        </div>
                        
                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <span className="text-sm text-gray-600">
                            {getStatusText(file.status)}
                          </span>
                        </div>
                        
                        {/* Remove Button */}
                        {file.status !== 'uploading' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadedFiles.length === 0 || uploadMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-5 h-5" />
                      رفع الصور
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
