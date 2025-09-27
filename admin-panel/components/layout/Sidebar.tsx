'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { 
  HomeIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  StarIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  Bars3Icon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

interface NavItem {
  name: string
  href: string
  icon: any
  permission?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    name: 'لوحة التحكم',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'نماذج الشقق',
    href: '/dashboard/apartments',
    icon: BuildingOfficeIcon,
    permission: 'manage_apartments',
  },
  // {
  //   name: 'الاستفسارات',
  //   href: '/dashboard/inquiries',
  //   icon: ChatBubbleLeftRightIcon,
  //   permission: 'manage_inquiries',
  // },
  {
    name: 'مميزات المشروع',
    href: '/dashboard/features',
    icon: StarIcon,
    permission: 'manage_features',
  },
  {
    name: 'مميزات الموقع',
    href: '/dashboard/location-features',
    icon: MapPinIcon,
    permission: 'manage_location_features',
  },
  {
    name: 'ضمانات المشروع',
    href: '/dashboard/warranties',
    icon: ShieldCheckIcon,
    permission: 'manage_warranties',
  },
  {
    name: 'صور المشروع',
    href: '/dashboard/gallery',
    icon: PhotoIcon,
    permission: 'manage_media',
  },
  {
    name: 'معلومات المشروع',
    href: '/dashboard/project-info',
    icon: InformationCircleIcon,
    permission: 'manage_project_info',
  },
  // {
  //   name: 'الإحصائيات',
  //   href: '/dashboard/analytics',
  //   icon: ChartBarIcon,
  //   permission: 'view_analytics',
  // },
  {
    name: 'إدارة المستخدمين',
    href: '/dashboard/users',
    icon: UsersIcon,
    permission: 'manage_admins',
  },
  {
    name: 'خريطة المشروع',
    href: '/dashboard/map',
    icon: MapPinIcon,
    permission: 'manage_map',
  },
  {
    name: 'إعدادات التواصل',
    href: '/dashboard/contact-settings',
    icon: ChatBubbleLeftRightIcon,
    permission: 'manage_project_info',
  },
  // {
  //   name: 'الإعدادات',
  //   href: '/dashboard/settings',
  //   icon: Cog6ToothIcon,
  // },
]

export function Sidebar({ open, setOpen, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const { admin, hasPermission } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile && !collapsed) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [collapsed, setCollapsed])

  // إغلاق الساي بار عند النقر خارجه في الموبايل
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, isMobile, setOpen])

  // إغلاق الساي بار عند تغيير المسار في الموبايل
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false)
    }
  }, [pathname, isMobile, open, setOpen])

  const toggleExpanded = (itemName: string) => {
    if (collapsed && !isMobile) return
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const canAccess = (item: NavItem) => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  }

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed)
      if (!collapsed) {
        setExpandedItems([])
      }
    }
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!canAccess(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.href)
    const showLabel = !collapsed || isMobile || open

    return (
      <div key={item.name} className="relative">
        <div className="relative group">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                'w-full flex items-center rounded-lg transition-all duration-300 group',
                'hover:bg-primary-50 hover:text-primary-700',
                active 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' 
                  : 'text-gray-700',
                collapsed && !isMobile && !open
                  ? 'justify-center px-3 py-3'
                  : 'justify-between px-4 py-3',
                depth > 0 && 'mr-4 ml-2'
              )}
              title={collapsed && !isMobile && !open ? item.name : undefined}
            >
              <div className="flex items-center min-w-0">
                <item.icon 
                  className={cn(
                    'flex-shrink-0 transition-all duration-300',
                    collapsed && !isMobile && !open ? 'h-6 w-6' : 'h-5 w-5 ml-3',
                    active ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'
                  )} 
                />
                {showLabel && (
                  <span className={cn(
                    'transition-all duration-300 font-medium truncate',
                    collapsed && !isMobile && !open ? 'w-0 opacity-0' : 'opacity-100'
                  )}>
                    {item.name}
                  </span>
                )}
              </div>
              {showLabel && (
                <ChevronDownIcon 
                  className={cn(
                    'h-4 w-4 transition-all duration-300 flex-shrink-0',
                    isExpanded ? 'rotate-180' : '',
                    active ? 'text-white' : 'text-gray-400'
                  )}
                />
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={() => isMobile && setOpen(false)}
              className={cn(
                'flex items-center rounded-lg transition-all duration-300 group relative overflow-hidden',
                'hover:bg-primary-50 hover:text-primary-700 hover:transform hover:translate-x-1',
                active 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' 
                  : 'text-gray-700',
                collapsed && !isMobile && !open
                  ? 'justify-center px-3 py-3'
                  : 'px-4 py-3',
                depth > 0 && 'mr-4 ml-2'
              )}
              title={collapsed && !isMobile && !open ? item.name : undefined}
            >
              <item.icon 
                className={cn(
                  'flex-shrink-0 transition-all duration-300',
                  collapsed && !isMobile && !open ? 'h-6 w-6' : 'h-5 w-5 ml-3',
                  active ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'
                )} 
              />
              {showLabel && (
                <span className={cn(
                  'transition-all duration-300 font-medium truncate',
                  collapsed && !isMobile && !open ? 'w-0 opacity-0 ml-0' : 'opacity-100'
                )}>
                  {item.name}
                </span>
              )}
              
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full opacity-90" />
              )}
              
              {/* Hover effect */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 opacity-0 transition-opacity duration-300',
                'group-hover:opacity-100'
              )} />
            </Link>
          )}

          {/* Tooltip for collapsed state */}
          {collapsed && !isMobile && !open && (
            <div className={cn(
              'absolute right-full mr-2 top-1/2 -translate-y-1/2 z-50',
              'bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg',
              'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
              'transition-all duration-200 pointer-events-none',
              'whitespace-nowrap'
            )}>
              {item.name}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && showLabel && (
          <div className={cn(
            'mt-1 space-y-1 transition-all duration-300',
            collapsed && !isMobile && !open ? 'opacity-0 max-h-0' : 'opacity-100 max-h-96'
          )}>
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          'bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col',
          'border-l border-gray-200/50 backdrop-blur-md bg-white/95 sidebar-optimized sidebar-content-container',
          // Mobile styles - fixed positioning for mobile
          isMobile ? (
            cn(
              'fixed top-0 right-0 z-50 h-full',
              open ? 'translate-x-0 w-80' : 'translate-x-full w-80'
            )
          ) : (
            // Desktop styles - relative positioning for desktop
            cn(
              'relative flex-shrink-0 h-screen',
              collapsed ? 'w-20' : 'w-64'
            )
          )
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center border-b border-gray-200/50 transition-all duration-300',
          collapsed && !isMobile && !open ? 'justify-center px-4 py-4 h-20' : 'justify-between px-4 py-4 h-16'
        )}>
          <div className={cn(
            'flex items-center transition-all duration-300',
            collapsed && !isMobile && !open ? 'justify-center' : ''
          )}>
            <div className="flex-shrink-0">
              <div className={cn(
                'bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300',
                collapsed && !isMobile && !open ? 'w-12 h-12' : 'w-10 h-10'
              )}>
                <BuildingOfficeIcon className={cn(
                  'text-white transition-all duration-300',
                  collapsed && !isMobile && !open ? 'w-7 h-7' : 'w-6 h-6'
                )} />
              </div>
            </div>
            
            {(!collapsed || isMobile || open) && (
              <div className={cn(
                'mr-3 transition-all duration-300',
                collapsed && !isMobile && !open ? 'opacity-0 w-0' : 'opacity-100'
              )}>
                <h1 className="text-lg font-bold text-gray-900 gradient-text whitespace-nowrap">مشروع 24</h1>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">لوحة التحكم</p>
              </div>
            )}
          </div>
          
          {/* Toggle/Close buttons */}
          <div className="flex items-center gap-2">
            {/* Desktop collapse toggle */}
            {!isMobile && (
              <button
                onClick={handleToggleCollapse}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200 hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
                )}
                title={collapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
              >
          
              </button>
            )}
            
            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Admin info */}
        {(!collapsed || isMobile || open) && (
          <div className={cn(
            'border-b border-gray-200/50 transition-all duration-300',
            collapsed && !isMobile && !open ? 'p-2 opacity-0' : 'p-4 opacity-100'
          )}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {admin?.profile?.avatar?.url ? (
                    <img 
                      src={admin.profile.avatar.url} 
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {admin?.name?.charAt(0) || ' م'}
                    </span>
                  )}
                </div>
              </div>
              <div className="mr-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {admin?.name || 'مدير النظام'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {admin?.role === 'super_admin' && 'مدير عام'}
                  {admin?.role === 'admin' && 'مدير'}
                  {admin?.role === 'editor' && 'محرر'}
                  {!admin?.role && 'مدير'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 sidebar-scrollbar sidebar-nav-optimized',
          collapsed && !isMobile && !open ? 'px-2 py-4' : 'px-4 py-4'
        )}>
          <div className={cn(
            'space-y-2 transition-all duration-300',
            collapsed && !isMobile && !open ? 'space-y-3' : 'space-y-2'
          )}>
            {navigation.map((item, index) => (
              <div 
                key={item.name} 
                className="animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {renderNavItem(item)}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {(!collapsed || isMobile || open) && (
          <div className={cn(
            'border-t border-gray-200/50 transition-all duration-300',
            collapsed && !isMobile && !open ? 'p-2 opacity-0' : 'p-4 opacity-100'
          )}>
            <div className="text-xs text-gray-500 text-center">
              <p>© 2024 مشروع 24</p>
              <p className="text-gray-400">الإصدار 1.0.0</p>
            </div>
          </div>
        )}

        {/* Resize handle for desktop */}
        {!isMobile && (
          <div 
            className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-primary-500/20 transition-colors duration-200"
            onDoubleClick={handleToggleCollapse}
          />
        )}
      </div>
    </>
  )
}
