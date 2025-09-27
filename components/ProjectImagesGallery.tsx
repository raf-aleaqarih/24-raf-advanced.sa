'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { publicMediaApi } from '../lib/api'

interface ProjectImage {
  _id: string
  title: string
  description: string
  file?: {
    url: string
    originalName: string
    dimensions?: {
      width: number
      height: number
    }
  }
  alt: string
  category: string
  isActive: boolean
  createdAt?: string | Date
}

interface ProjectImagesGalleryProps {
  isVisible: boolean
}

export default function ProjectImagesGallery({ isVisible }: ProjectImagesGalleryProps) {
  const [images, setImages] = useState<ProjectImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // استخدام صور ثابتة كبديل إذا فشل API
        const fallbackImages: ProjectImage[] = [
          {
            _id: 'fallback-1',
            title: 'صورة المشروع الرئيسية',
            description: 'منظر عام للمشروع',
            file: { url: '/1.jpg', originalName: 'project-main.jpg' },
            alt: 'صورة المشروع الرئيسية',
            category: 'project-photos',
            isActive: true,
            createdAt: new Date()
          },
          {
            _id: 'fallback-2',
            title: 'منظر خارجي',
            description: 'الواجهة الخارجية للمشروع',
            file: { url: '/2.jpg', originalName: 'project-exterior.jpg' },
            alt: 'منظر خارجي',
            category: 'project-photos',
            isActive: true,
            createdAt: new Date()
          },
          {
            _id: 'fallback-3',
            title: 'الحدائق',
            description: 'المناطق الخضراء',
            file: { url: '/3.jpg', originalName: 'project-gardens.jpg' },
            alt: 'الحدائق',
            category: 'project-photos',
            isActive: true,
            createdAt: new Date()
          }
        ]
        
        try {
          // استخدام API المحسن
          const response = await publicMediaApi.getProjectImages('project-photos')
          
          if (response.data?.success && response.data?.data && response.data.data.length > 0) {
            const projectImages = response.data.data
              .filter((img: ProjectImage) => img.isActive && img.file?.url)
              .sort((a: ProjectImage, b: ProjectImage) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return dateB - dateA
              })
            
            console.log('تم جلب', projectImages.length, 'صورة من API')
            setImages(projectImages)
            setLoading(false)
            return
          } else {
            console.log('لا توجد صور في API، استخدام الصور الافتراضية')
          }
        } catch (apiError) {
          console.warn('خطأ في API، استخدام الصور الافتراضية:', apiError)
        }
        
        // استخدام الصور الثابتة كبديل
        setImages(fallbackImages)
        
      } catch (err) {
        console.error('Error fetching images:', err)
        setError('حدث خطأ في تحميل الصور')
        // استخدام الصور الافتراضية حتى في حالة الخطأ
        setImages([
          {
            _id: 'fallback-1',
            title: 'صورة المشروع الرئيسية',
            description: 'منظر عام للمشروع',
            file: { url: '/1.jpg', originalName: 'project-main.jpg' },
            alt: 'صورة المشروع الرئيسية',
            category: 'project-photos',
            isActive: true,
            createdAt: new Date()
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const scrollLeft = () => {
    const container = document.querySelector('.project-images-container')
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.querySelector('.project-images-container')
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center">صور المشروع</h2>
            <div className="w-16 h-1 bg-[#c48765] mr-auto ml-auto mt-2"></div>
          </motion.div>
          
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c48765]"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center">صور المشروع</h2>
            <div className="w-16 h-1 bg-[#c48765] mr-auto ml-auto mt-2"></div>
          </motion.div>
          
          <div className="text-center py-12">
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (images.length === 0) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center">صور المشروع</h2>
            <div className="w-16 h-1 bg-[#c48765] mr-auto ml-auto mt-2"></div>
          </motion.div>
          
          <div className="text-center py-12">
            <p className="text-gray-600">لا توجد صور متاحة حالياً</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center">صور المشروع</h2>
          <div className="w-16 h-1 bg-[#c48765] mr-auto ml-auto mt-2"></div>
        </motion.div>

        <div className="relative">
          <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory scrollbar-hide project-images-container">
            {images.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative aspect-square w-[300px] md:w-[400px] lg:w-[500px] flex-none snap-center rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={image.file?.url || ''}
                  alt={image.alt || image.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
                  quality={90}
                  onError={(e) => {
                    console.error('Error loading gallery image:', image.file?.url)
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 right-4 text-white">
                  <p className="text-sm md:text-base font-medium">{image.title}</p>
                  {image.description && (
                    <p className="text-xs md:text-sm opacity-90">{image.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <div className="block">
              <button 
                className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10"
                onClick={scrollLeft}
                aria-label="الصورة السابقة"
              >
                <ChevronDown className="h-4 w-4 md:h-6 md:w-6 -rotate-90 text-[#c48765]" />
              </button>
              <button 
                className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10"
                onClick={scrollRight}
                aria-label="الصورة التالية"
              >
                <ChevronDown className="h-4 w-4 md:h-6 md:w-6 rotate-90 text-[#c48765]" />
              </button>
            </div>
          )}

          {/* Scroll indicator dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: Math.min(3, Math.ceil(images.length / 2)) }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-[#c48765]/50"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
