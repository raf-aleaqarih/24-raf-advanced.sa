'use client'

import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { NewSidebar } from '../../components/layout/NewSidebar'
import { NewHeader } from '../../components/layout/NewHeader'
import { LayoutProvider } from '../../components/providers/LayoutProvider'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import "../../app/globals.css"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // إعادة التوجيه للمستخدمين غير المصادق عليهم
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // عرض التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // إذا لم يكن مصادق عليه، لا نعرض شيء
  if (!isAuthenticated) {
    return null
  }

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex" dir="rtl">
        {/* Sidebar */}
        <NewSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <NewHeader />
          
          {/* Page Content */}
          <main className="flex-1 py-6 fade-in overflow-auto">
            <div className="page-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutProvider>
  )
}
