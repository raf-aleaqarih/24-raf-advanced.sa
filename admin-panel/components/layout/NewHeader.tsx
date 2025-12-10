'use client'

import { useAuth } from '../../hooks/useAuth'
import { useLayout } from '../providers/LayoutProvider'
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { cn } from '../../lib/utils'

export function NewHeader() {
  const { admin, logout } = useAuth()
  const { isMobile, toggleSidebar, sidebarCollapsed, sidebarOpen } = useLayout()
  const [notifications] = useState([
    {
      id: 1,
      title: 'استفسار جديد',
      message: 'تم استلام استفسار جديد من أحمد محمد',
      time: 'منذ 5 دقائق',
      unread: true,
    },
    {
      id: 2,
      title: 'تحديث النظام',
      message: 'تم تحديث نظام إدارة المحتوى بنجاح',
      time: 'منذ ساعة',
      unread: false,
    },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200/50 backdrop-blur-md bg-white/95">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
              'group relative flex-shrink-0 z-50'
            )}
            title={isMobile ? 'فتح القائمة الجانبية' : (sidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي')}
            aria-label={isMobile ? 'فتح القائمة الجانبية' : (sidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي')}
          >
            <Bars3Icon className={cn(
              'w-6 h-6 text-gray-700 transition-all duration-200 flex-shrink-0',
              !isMobile && sidebarCollapsed ? 'rotate-180' : ''
            )} />
            
            {/* Tooltip */}
            <div className={cn(
              'absolute right-full mr-2 top-1/2 -translate-y-1/2 z-50',
              'bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg',
              'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
              'transition-all duration-200 pointer-events-none',
              'whitespace-nowrap'
            )}>
              {isMobile ? 'فتح القائمة الجانبية' : (sidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي')}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          </button>
        </div>

        {/* Center - Page title */}
        <div className="flex-1 min-w-0 mx-4">
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block truncate">
            لوحة التحكم
          </h1>
        </div>

        {/* Right side - Notifications and User menu */}
        <div className="flex items-center space-x-reverse space-x-2">
          {/* Notifications */}
    

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ml-2 overflow-hidden">
                  {admin?.profile?.avatar?.url ? (
                    <img 
                      src={admin.profile.avatar.url} 
                      alt={admin.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {admin?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {admin?.role === 'super_admin' && 'مدير عام'}
                    {admin?.role === 'admin' && 'مدير'}
                    {admin?.role === 'editor' && 'محرر'}
                  </p>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-600 mr-2" />
              </div>
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
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {admin?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {admin?.email}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm transition-colors text-red-600',
                          active ? 'bg-red-50' : ''
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 ml-3" />
                        تسجيل الخروج
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  )
}
