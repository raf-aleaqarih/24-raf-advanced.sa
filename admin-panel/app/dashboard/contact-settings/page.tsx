'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { projectInfoAPI } from '../../../lib/api'
import { 
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  ShareIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface ContactSettings {
  _id: string
  projectName: string
  phoneNumbers: {
    meta: string
    snapchat: string
    tiktok: string
    google: string
    default: string
  }
  welcomeMessages: {
    snapchat: string
    tiktok: string
    meta: string
    google: string
    facebook: string
  }
  emailSettings: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
  }
  trackingSettings: {
    facebookPixel: {
      enabled: boolean
      pixelId: string
    }
    snapchatPixel: {
      enabled: boolean
      pixelId: string
    }
    tiktokPixel: {
      enabled: boolean
      pixelId: string
    }
    googleAnalytics: {
      enabled: boolean
      trackingId: string
    }
    googleTagManager: {
      enabled: boolean
      containerId: string
    }
  }
  formSettings: {
    inquiryForm: {
      enabled: boolean
      fields: {
        name: {
          required: boolean
          placeholder: string
        }
        phone: {
          required: boolean
          placeholder: string
          validation: string
        }
        message: {
          required: boolean
          placeholder: string
        }
      }
    }
  }
  sharingSettings: {
    enabled: boolean
    platforms: {
      whatsapp: {
        enabled: boolean
        message: string
      }
      twitter: {
        enabled: boolean
        message: string
      }
      facebook: {
        enabled: boolean
      }
      telegram: {
        enabled: boolean
        message: string
      }
    }
  }
  createdAt: string
  updatedAt: string
}

export default function ContactSettingsPage() {
  const router = useRouter()
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchContactSettings()
  }, [])

  const fetchContactSettings = async () => {
    try {
      setLoading(true)
      const response = await projectInfoAPI.getContactSettings()
      if (response.data.success) {
        setContactSettings(response.data.data)
      } else {
        setError('فشل في تحميل إعدادات التواصل')
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات التواصل:', error)
      setError('حدث خطأ أثناء تحميل إعدادات التواصل')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!contactSettings) return

    try {
      setSaving(true)
      setError('')

      const response = await projectInfoAPI.updateContactSettings(contactSettings._id, contactSettings)
      
      if (response.data.success) {
        setSuccessMessage('تم تحديث إعدادات التواصل بنجاح')
        setIsEditing(false)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setError('فشل في تحديث إعدادات التواصل')
      }
    } catch (error) {
      console.error('خطأ في تحديث إعدادات التواصل:', error)
      setError('حدث خطأ أثناء تحديث إعدادات التواصل')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!contactSettings) return
    
    if (field.includes('.')) {
      const keys = field.split('.')
      let updatedSettings = { ...contactSettings }
      let current: any = updatedSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      setContactSettings(updatedSettings)
    } else {
      setContactSettings({
        ...contactSettings,
        [field]: value
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (!contactSettings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على إعدادات التواصل</p>
          <Button onClick={fetchContactSettings}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
            إعدادات التواصل
          </h1>
          <p className="text-gray-600 mt-2">إدارة أرقام الهاتف ورسائل الترحيب وإعدادات التتبع</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <PencilIcon className="w-4 h-4" />
              تحرير الإعدادات
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  fetchContactSettings()
                }}
              >
                إلغاء
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Numbers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5" />
              أرقام الهاتف حسب المنصة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(contactSettings.phoneNumbers).map(([platform, phone]) => (
              <div key={platform}>
                <label className="block text-sm font-medium mb-2 capitalize">
                  {platform === 'meta' ? 'Meta/Facebook' : 
                   platform === 'snapchat' ? 'Snapchat' :
                   platform === 'tiktok' ? 'TikTok' :
                   platform === 'google' ? 'Google' :
                   'الافتراضي'}
                </label>
                {isEditing ? (
                  <Input
                    value={phone}
                    onChange={(e) => handleInputChange(`phoneNumbers.${platform}`, e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{phone}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>



      </div>
    </div>
  )
}
