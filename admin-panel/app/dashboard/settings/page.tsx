'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../../../lib/api'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  CircleStackIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import { cn } from '../../../lib/utils'

interface Settings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    language: string
    timezone: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    inquiryAlerts: boolean
    systemUpdates: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    primaryColor: string
    fontFamily: string
    sidebarCollapsed: boolean
  }
  api: {
    apiKey: string
    rateLimit: number
    webhookUrl: string
    enableCors: boolean
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'appearance' | 'api'>('general')
  const [formData, setFormData] = useState<Partial<Settings>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  
  const queryClient = useQueryClient()

  // جلب الإعدادات
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  })

  // حفظ الإعدادات
  const saveMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setIsSaving(false)
    },
    onError: (error: any) => {
      setErrors(error.response?.data?.errors || {})
      setIsSaving(false)
    }
  })

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof Settings],
        [field]: value
      }
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Save error:', error)
    }
  }

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
          <p className="text-gray-600">حدث خطأ أثناء تحميل الإعدادات</p>
        </div>
      </div>
    )
  }

  const currentSettings = settings?.data || {}

  const tabs = [
    { id: 'general', name: 'عام', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'التنبيهات', icon: BellIcon },
    { id: 'security', name: 'الأمان', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'المظهر', icon: PaintBrushIcon },
    { id: 'api', name: 'API', icon: CircleStackIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">الإعدادات</h1>
          <p className="page-subtitle">
            إدارة إعدادات النظام والتطبيق
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="small" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ الإعدادات'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="section-card">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="section-card">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="section-header">
                  <h2 className="section-title">الإعدادات العامة</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label required">اسم الموقع</label>
                    <input
                      type="text"
                      value={formData.general?.siteName || currentSettings.general?.siteName || ''}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      className={cn('form-input', errors.siteName && 'error')}
                    />
                    {errors.siteName && <p className="form-error">{errors.siteName}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">وصف الموقع</label>
                    <textarea
                      value={formData.general?.siteDescription || currentSettings.general?.siteDescription || ''}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">رابط الموقع</label>
                      <input
                        type="url"
                        value={formData.general?.siteUrl || currentSettings.general?.siteUrl || ''}
                        onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">اللغة</label>
                      <select
                        value={formData.general?.language || currentSettings.general?.language || 'ar'}
                        onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                        className="form-select"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">المنطقة الزمنية</label>
                    <select
                      value={formData.general?.timezone || currentSettings.general?.timezone || 'Asia/Riyadh'}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className="form-select"
                    >
                      <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                      <option value="Asia/Dubai">دبي (GMT+4)</option>
                      <option value="Asia/Kuwait">الكويت (GMT+3)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="section-header">
                  <h2 className="section-title">إعدادات التنبيهات</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">التنبيهات عبر البريد الإلكتروني</h3>
                      <p className="text-sm text-gray-600">تلقي التنبيهات على البريد الإلكتروني</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.emailNotifications ?? currentSettings.notifications?.emailNotifications ?? false}
                        onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">التنبيهات عبر الرسائل النصية</h3>
                      <p className="text-sm text-gray-600">تلقي التنبيهات على الهاتف المحمول</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.smsNotifications ?? currentSettings.notifications?.smsNotifications ?? false}
                        onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">تنبيهات الاستفسارات</h3>
                      <p className="text-sm text-gray-600">تلقي تنبيهات عند وصول استفسارات جديدة</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.inquiryAlerts ?? currentSettings.notifications?.inquiryAlerts ?? false}
                        onChange={(e) => handleInputChange('notifications', 'inquiryAlerts', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">تنبيهات تحديثات النظام</h3>
                      <p className="text-sm text-gray-600">تلقي تنبيهات عند تحديث النظام</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.systemUpdates ?? currentSettings.notifications?.systemUpdates ?? false}
                        onChange={(e) => handleInputChange('notifications', 'systemUpdates', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="section-header">
                  <h2 className="section-title">إعدادات الأمان</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">المصادقة الثنائية</h3>
                      <p className="text-sm text-gray-600">تفعيل المصادقة الثنائية لزيادة الأمان</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.security?.twoFactorAuth ?? currentSettings.security?.twoFactorAuth ?? false}
                        onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">مهلة الجلسة (بالدقائق)</label>
                    <input
                      type="number"
                      value={formData.security?.sessionTimeout ?? currentSettings.security?.sessionTimeout ?? 30}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value) || 30)}
                      className="form-input"
                      min="5"
                      max="480"
                    />
                  </div>

                  <div className="section-card">
                    <div className="section-header">
                      <h3 className="section-title">سياسة كلمة المرور</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">الحد الأدنى لطول كلمة المرور</label>
                        <input
                          type="number"
                          value={formData.security?.passwordPolicy?.minLength ?? currentSettings.security?.passwordPolicy?.minLength ?? 8}
                          onChange={(e) => handleInputChange('security', 'passwordPolicy', {
                            ...formData.security?.passwordPolicy,
                            minLength: parseInt(e.target.value) || 8
                          })}
                          className="form-input"
                          min="6"
                          max="32"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireUppercase ?? currentSettings.security?.passwordPolicy?.requireUppercase ?? false}
                            onChange={(e) => handleInputChange('security', 'passwordPolicy', {
                              ...formData.security?.passwordPolicy,
                              requireUppercase: e.target.checked
                            })}
                            className="ml-3"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            تتطلب أحرف كبيرة
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireNumbers ?? currentSettings.security?.passwordPolicy?.requireNumbers ?? false}
                            onChange={(e) => handleInputChange('security', 'passwordPolicy', {
                              ...formData.security?.passwordPolicy,
                              requireNumbers: e.target.checked
                            })}
                            className="ml-3"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            تتطلب أرقام
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.security?.passwordPolicy?.requireSymbols ?? currentSettings.security?.passwordPolicy?.requireSymbols ?? false}
                            onChange={(e) => handleInputChange('security', 'passwordPolicy', {
                              ...formData.security?.passwordPolicy,
                              requireSymbols: e.target.checked
                            })}
                            className="ml-3"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            تتطلب رموز خاصة
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="section-header">
                  <h2 className="section-title">إعدادات المظهر</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">السمة</label>
                    <select
                      value={formData.appearance?.theme ?? currentSettings.appearance?.theme ?? 'light'}
                      onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                      className="form-select"
                    >
                      <option value="light">فاتحة</option>
                      <option value="dark">داكنة</option>
                      <option value="auto">تلقائي</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">اللون الأساسي</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.appearance?.primaryColor ?? currentSettings.appearance?.primaryColor ?? '#c48765'}
                        onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.appearance?.primaryColor ?? currentSettings.appearance?.primaryColor ?? '#c48765'}
                        onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                        className="form-input flex-1"
                        placeholder="#c48765"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">خط النص</label>
                    <select
                      value={formData.appearance?.fontFamily ?? currentSettings.appearance?.fontFamily ?? 'IBM Plex Sans Arabic'}
                      onChange={(e) => handleInputChange('appearance', 'fontFamily', e.target.value)}
                      className="form-select"
                    >
                      <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                      <option value="Cairo">Cairo</option>
                      <option value="Tajawal">Tajawal</option>
                      <option value="Amiri">Amiri</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">طي الشريط الجانبي</h3>
                      <p className="text-sm text-gray-600">طي الشريط الجانبي افتراضياً</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.appearance?.sidebarCollapsed ?? currentSettings.appearance?.sidebarCollapsed ?? false}
                        onChange={(e) => handleInputChange('appearance', 'sidebarCollapsed', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="section-header">
                  <h2 className="section-title">إعدادات API</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">مفتاح API</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={formData.api?.apiKey ?? currentSettings.api?.apiKey ?? ''}
                        onChange={(e) => handleInputChange('api', 'apiKey', e.target.value)}
                        className="form-input flex-1"
                        placeholder="أدخل مفتاح API"
                      />
                      <button className="btn-secondary">
                        <KeyIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">حد معدل الطلبات (طلبات/دقيقة)</label>
                    <input
                      type="number"
                      value={formData.api?.rateLimit ?? currentSettings.api?.rateLimit ?? 100}
                      onChange={(e) => handleInputChange('api', 'rateLimit', parseInt(e.target.value) || 100)}
                      className="form-input"
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رابط Webhook</label>
                    <input
                      type="url"
                      value={formData.api?.webhookUrl ?? currentSettings.api?.webhookUrl ?? ''}
                      onChange={(e) => handleInputChange('api', 'webhookUrl', e.target.value)}
                      className="form-input"
                      placeholder="https://example.com/webhook"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">تفعيل CORS</h3>
                      <p className="text-sm text-gray-600">السماح بطلبات من مصادر مختلفة</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.api?.enableCors ?? currentSettings.api?.enableCors ?? false}
                        onChange={(e) => handleInputChange('api', 'enableCors', e.target.checked)}
                        className="sr-only"
                      />
                      <span className="toggle-thumb"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
