import { useState, useEffect } from 'react'
import { publicProjectApi } from '../lib/api'

interface ContactData {
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
}

// Fallback data في حالة فشل API
const fallbackContactData: ContactData = {
  phoneNumbers: {
    meta: '0555812257',
    snapchat: '0543766262',
    tiktok: '0539488805',
    google: '0552845403',
    default: '0536667967'
  },
  welcomeMessages: {
    snapchat: "السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع",
    tiktok: "مرحباً ، السلام عليكم ورحمة الله، ارغب بالاستفسار عن المشروع",
    meta: "مرحباً، أرغب بالاستفسار عن المشروع",
    google: "السلام عليكم ورحمة الله وبركاته، ارغب بالاستفسار عن المشروع",
    facebook: "السلام عليكم ورحمة الله وبركاته 🌟\nأرغب بالاستفسار عن مشروع 24 - حي الزهراء في جدة"
  }
}

export const useContactData = () => {
  const [contactData, setContactData] = useState<ContactData>(fallbackContactData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await publicProjectApi.getContactData()
        
        if (response.data.success && response.data.data) {
          setContactData(response.data.data)
        } else {
          console.warn('API returned unsuccessful response, using fallback data')
          setContactData(fallbackContactData)
        }
      } catch (error) {
        console.warn('Failed to fetch contact data, using fallback:', error)
        setError('فشل في تحميل بيانات التواصل')
        setContactData(fallbackContactData)
      } finally {
        setLoading(false)
      }
    }

    fetchContactData()
  }, [])

  // دالة للحصول على رقم الهاتف حسب المنصة
  const getPhoneNumber = (platform?: string): string => {
    if (!platform) return contactData.phoneNumbers.default
    
    const phoneNumber = contactData.phoneNumbers[platform as keyof typeof contactData.phoneNumbers]
    return phoneNumber || contactData.phoneNumbers.default
  }

  // دالة للحصول على رسالة الترحيب حسب المنصة
  const getWelcomeMessage = (platform?: string): string => {
    if (!platform) return contactData.welcomeMessages.facebook
    
    const welcomeMessage = contactData.welcomeMessages[platform as keyof typeof contactData.welcomeMessages]
    return welcomeMessage || contactData.welcomeMessages.facebook
  }

  // دالة لتحويل الرقم إلى صيغة الواتساب الدولية
  const getWhatsAppNumber = (platform?: string): string => {
    const phoneNumber = getPhoneNumber(platform)
    return '966' + phoneNumber.substring(1)
  }

  // دالة لإنشاء رابط الواتساب
  const getWhatsAppUrl = (platform?: string): string => {
    const whatsappNumber = getWhatsAppNumber(platform)
    const message = getWelcomeMessage(platform)
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  return {
    contactData,
    loading,
    error,
    getPhoneNumber,
    getWelcomeMessage,
    getWhatsAppNumber,
    getWhatsAppUrl
  }
}
