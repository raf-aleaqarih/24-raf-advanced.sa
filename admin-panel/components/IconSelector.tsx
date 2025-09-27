'use client'

import { useState } from 'react'
import { MapPin, Building2, Shield, Home, Car, Wifi, StoreIcon, Plane, Star, Search, X } from 'lucide-react'

interface IconSelectorProps {
  selectedIcon: string
  onIconSelect: (iconName: string) => void
  className?: string
}

// مكتبة الأيقونات المتاحة
const iconLibrary = {
  MapPin: { component: MapPin, name: 'موقع', category: 'location' },
  Building2: { component: Building2, name: 'مبنى', category: 'building' },
  Shield: { component: Shield, name: 'حماية', category: 'security' },
  Home: { component: Home, name: 'منزل', category: 'home' },
  Car: { component: Car, name: 'سيارة', category: 'transport' },
  Wifi: { component: Wifi, name: 'واي فاي', category: 'technology' },
  StoreIcon: { component: StoreIcon, name: 'متجر', category: 'commerce' },
  Plane: { component: Plane, name: 'طائرة', category: 'transport' },
    // Road: { component: Road, name: 'طريق', category: 'infrastructure' },
  Star: { component: Star, name: 'نجمة', category: 'general' },
  // أيقونات مخصصة إضافية
  Mosque: { 
    component: ({ className }: { className?: string }) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor">
        <g><rect fill="none" height="24" width="24" /></g>
        <g><g><path d="M7,8h10c0.29,0,0.57,0.06,0.84,0.13C17.93,7.8,18,7.46,18,7.09c0-1.31-0.65-2.53-1.74-3.25L12,1L7.74,3.84 C6.65,4.56,6,5.78,6,7.09C6,7.46,6.07,7.8,6.16,8.13C6.43,8.06,6.71,8,7,8z" /><path d="M24,7c0-1.1-2-3-2-3s-2,1.9-2,3c0,0.74,0.4,1.38,1,1.72V13h-2v-2c0-1.1-0.9-2-2-2H7c-1.1,0-2,0.9-2,2v2H3V8.72 C3.6,8.38,4,7.74,4,7c0-1.1-2-3-2-3S0,5.9,0,7c0,0.74,0.4,1.38,1,1.72V21h9v-4c0-1.1,0.9-2,2-2s2,0.9,2,2v4h9V8.72 C23.6,8.38,24,7.74,24,7z" /></g></g>
      </svg>
    ), 
    name: 'مسجد', 
    category: 'religious' 
  },
  Building: { 
    component: ({ className }: { className?: string }) => (
      <svg fill="#c48765" className={className} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.00 512.00" xmlSpace="preserve" stroke="#c48765" transform="rotate(0)">
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g><g><path d="M366.933,0h-102.4v25.6c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V0h-102.4 c-4.71,0-8.533,3.814-8.533,8.533v494.933c0,4.719,3.823,8.533,8.533,8.533h102.4v-25.6c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V512h102.4c4.71,0,8.533-3.814,8.533-8.533V8.533C375.467,3.814,371.644,0,366.933,0z M196.267,307.2c0,4.719-3.823,8.533-8.533,8.533s-8.533-3.814-8.533-8.533V204.8c0-4.719,3.823-8.533,8.533-8.533 s8.533,3.814,8.533,8.533V307.2z M230.4,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M264.533,441.6c0,4.719-3.823,8.533-8.533,8.533 c-4.71,0-8.533-3.814-8.533-8.533v-29.867c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V441.6z M264.533,366.933c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533v-17.067c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V366.933z M264.533,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M264.533,162.133c0,4.719-3.823,8.533-8.533,8.533 c-4.71,0-8.533-3.814-8.533-8.533v-17.067c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V162.133z M264.533,100.267c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V70.4c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V100.267z M298.667,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M332.8,307.2c0,4.719-3.823,8.533-8.533,8.533 s-8.533-3.814-8.533-8.533V204.8c0-4.719,3.823-8.533,8.533-8.533s8.533,3.814,8.533,8.533V307.2z"></path></g></g>
        </g>
      </svg>
    ), 
    name: 'مبنى متعدد الطوابق', 
    category: 'building' 
  },
  Compass: { 
    component: ({ className }: { className?: string }) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3L21 21" />
        <path d="M21 3L3 21" />
        <rect x="7" y="7" width="10" height="10" />
      </svg>
    ), 
    name: 'بوصلة', 
    category: 'navigation' 
  }
}

const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'location', name: 'الموقع' },
  { id: 'building', name: 'المباني' },
  { id: 'home', name: 'المنزل' },
  { id: 'transport', name: 'النقل' },
  { id: 'technology', name: 'التكنولوجيا' },
  { id: 'commerce', name: 'التجارة' },
  { id: 'security', name: 'الأمان' },
  { id: 'infrastructure', name: 'البنية التحتية' },
  { id: 'religious', name: 'دينية' },
  { id: 'navigation', name: 'الملاحة' },
  { id: 'general', name: 'عامة' }
]

export default function IconSelector({ selectedIcon, onIconSelect, className = "" }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  console.log('IconSelector received selectedIcon:', selectedIcon)

  const filteredIcons = Object.entries(iconLibrary).filter(([key, icon]) => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         key.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const selectedIconData = iconLibrary[selectedIcon as keyof typeof iconLibrary]
  console.log('selectedIconData:', selectedIconData)

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          {selectedIconData ? (
            <>
              <selectedIconData.component className="h-5 w-5 text-[#c48765] ml-2" />
              <span className="text-sm font-medium">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">اختر أيقونة</span>
          )}
        </div>
        <Search className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* شريط البحث */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن أيقونة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c48765] focus:border-transparent"
              />
            </div>
          </div>

          {/* فلاتر الفئات */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#c48765] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* قائمة الأيقونات */}
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 p-3">
              {filteredIcons.map(([key, icon]) => (
                <button
                  key={key}
                  onClick={() => {
                    onIconSelect(key)
                    setIsOpen(false)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${
                    selectedIcon === key
                      ? 'border-[#c48765] bg-[#c48765]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={icon.name}
                >
                  <icon.component className="h-6 w-6 text-[#c48765] mx-auto" />
                  <div className="text-xs text-center mt-1 text-gray-600 truncate">
                    {icon.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* زر الإغلاق */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
