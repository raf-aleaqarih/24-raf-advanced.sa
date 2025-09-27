'use client'

import GalleryManager from '../../../components/GalleryManager'

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">صور المشروع</h1>
          <p className="page-subtitle">
            إدارة صور المشروع - رفع، تعديل، وتنظيم
          </p>
        </div>
      </div>

      {/* Gallery Manager */}
      <GalleryManager 
        showUpload={true}
        category="project-photos"
      />
    </div>
  )
}
