'use client'

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Header({ onMenuClick, collapsed, onToggleCollapse }: HeaderProps) {
  const { admin, logout } = useAuth()
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
    <header className="admin-header px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Menu buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible lg:hidden"
            title="فتح القائمة الجانبية"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Desktop toggle button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible"
              title={collapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
            >
              <Bars3Icon className={cn(
                'w-6 h-6 text-gray-700 transition-transform duration-200',
                collapsed ? 'rotate-180' : ''
              )} />
            </button>
          )}
        </div>

          {/* Page title and breadcrumb would go here */}
          <div className="flex-1 min-w-0 mx-4">
            <h1 className="text-2xl font-semibold text-gray-900 hidden lg:block">
              لوحة التحكم
            </h1>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-reverse space-x-4">
            {/* Notifications */}
            {/* <Menu as="div" className="relative">
              <Menu.Button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <BellIcon className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
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
                <Menu.Items className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">التنبيهات</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <div
                              className={cn(
                                'px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer',
                                active ? 'bg-gray-50' : '',
                                notification.unread ? 'bg-blue-50' : ''
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        لا توجد تنبيهات جديدة
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <Link 
                      href="/dashboard/notifications"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      عرض جميع التنبيهات
                    </Link>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu> */}

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ml-2">
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
                    <p className="text-sm font-medium text-gray-900">
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
                    <p className="text-sm font-medium text-gray-900">
                      {admin?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {admin?.email}
                    </p>
                  </div>
                  
                  {/* <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/profile"
                          className={cn(
                            'flex items-center px-4 py-2 text-sm transition-colors',
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                          )}
                        >
                          <UserCircleIcon className="w-4 h-4 ml-3" />
                          الملف الشخصي
                        </Link>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/settings"
                          className={cn(
                            'flex items-center px-4 py-2 text-sm transition-colors',
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                          )}
                        >
                          <Cog6ToothIcon className="w-4 h-4 ml-3" />
                          الإعدادات
                        </Link>
                      )}
                    </Menu.Item>
                  </div> */}
                  
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
