"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Building2, MapPin, Shield, Home, Car, Wifi, Check, ChevronDown, X, Share2, PhoneIcon, Rotate3D, Plane, StoreIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import image from "next/image"
import Link from "next/link"
import { StaticImport } from "next/dist/shared/lib/get-img-props"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { trackFBEvent } from './components/FacebookPixel';
import { trackSnapEvent } from './components/SnapchatPixel';
import { trackTikTokEvent } from './components/TikTokPixel';
import { pushToDataLayer } from './components/GoogleTagManager';
import { trackGoogleEvent } from './components/GoogleAnalytics';
import ProjectImagesGallery from '../components/ProjectImagesGallery';
import MapSection from '../components/MapSection';
import { publicApartmentsApi, publicProjectApi, publicLocationFeaturesApi } from '../lib/api';
import { useContactData } from '../hooks/useContactData';
// import nodemailer from 'nodemailer';

// Create a transporter object
// const transporter = nodemailer.createTransport({
//   host: 'smtp.hostinger.com',
//   port: 465,
//   secure: false,
//   auth: {
//     user: '24_project@raf-advanced.sa', // Replace with your email
//     pass: 'Yussefali@1234' // Replace with your app password
//   }
// });

export default function LandingPage({ platform: propPlatform, defaultMessage }: { platform?: string, defaultMessage?: string } = {}) {
  // Platform detection (would be server-side in production)
  const [platform, setPlatform] = useState<string>(propPlatform || "facebook")
  
  // استخدام hook جديد لإدارة بيانات التواصل
  const { 
    contactData, 
    loading: contactLoading, 
    error: contactError,
    getPhoneNumber, 
    getWelcomeMessage, 
    getWhatsAppUrl 
  } = useContactData()

  interface MobileModelCardProps {
    title: string;
    subtitle: string;
    image: string | StaticImport;
    area: number;
    roofArea: number;
    rooms: number;
    bathrooms: number;
    price: string;
    features: string[];
    onInquire: (modelName: string) => void; // Add this prop
  }
  
  // Set RTL direction for Arabic content
  useEffect(() => {
    document.documentElement.dir = "rtl"
    document.documentElement.lang = "ar"

    // Detect platform from URL params in a real implementation
    const url = new URL(window.location.href)
    const platformParam = url.searchParams.get("platform")
    if (platformParam) {
      setPlatform(platformParam)
    }
  }, [])

  // For scroll animations
  const [isVisible, setIsVisible] = useState<Record<number, boolean>>({})
  const observerRefs = useRef<(HTMLElement | null)[]>([])

  // For expandable sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // For video modal
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false)

  // For share modal
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false)

  // For CTA sticky state
  const [isSticky, setIsSticky] = useState<boolean>(false)

  // For scroll progress
  const [scrollProgress, setScrollProgress] = useState<number>(0)



  // Function to share the project
  const shareProject = async () => {
    const shareData = {
      title: "مشروع سكني متميز في حي الزهراء بجدة",
      text: "مشروع سكني متميز في حي الزهراء بجدة بأسعار استثنائية تبدأ من 830000 ﷼ فقط",
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        setShareModalOpen(true)
      }
    } catch (error) {
      console.error("Error sharing:", error)
      setShareModalOpen(true)
    }
  }

  useEffect(() => {
    const observers = observerRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible((prev) => ({ ...prev, [index]: entry.isIntersecting }))
        },
        { threshold: 0.1 },
      )

      if (ref) observer.observe(ref)
      return observer
    })

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)

      // Set sticky state for CTA
      if (window.scrollY > 300) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      observers.forEach((observer, index) => {
        if (observerRefs.current[index]) observer.unobserve(observerRefs.current[index] as HTMLElement)
      })
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  // جلب بيانات المشروع من الخادم
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setProjectLoading(true);
        
        // جلب معلومات المشروع
        const projectInfoResponse = await publicProjectApi.getInfo();
        if (projectInfoResponse.data.success) {
          setProjectInfo(projectInfoResponse.data.data);
        }
        
        // جلب مميزات المشروع
        const featuresResponse = await publicProjectApi.getFeatures();
        if (featuresResponse.data.success) {
          setProjectFeatures(featuresResponse.data.data);
        }
        
        // جلب ضمانات المشروع
        const warrantiesResponse = await publicProjectApi.getWarranties();
        if (warrantiesResponse.data.success) {
          setProjectWarranties(warrantiesResponse.data.data);
        }
        
        // جلب مميزات الموقع
        const locationFeaturesResponse = await publicLocationFeaturesApi.getAll();
        if (locationFeaturesResponse.data.success && locationFeaturesResponse.data.data) {
          setLocationFeatures(locationFeaturesResponse.data.data);
        }
        
      } catch (err) {
        console.error('Error fetching project data:', err);
      } finally {
        setProjectLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  const [apartmentsRefreshKey, setApartmentsRefreshKey] = useState<number>(0);

  // دالة لإعادة تحميل النماذج
  const refreshApartments = () => {
    setApartmentsRefreshKey(prev => prev + 1);
  };

  // جلب بيانات النماذج من الخادم
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setApartmentsLoading(true);
        const response = await publicApartmentsApi.getAll();
        
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          // ترتيب النماذج حسب modelName
          const sortedApartments = response.data.data.sort((a: any, b: any) => 
            a.modelName.localeCompare(b.modelName)
          );
          setApartments(sortedApartments);
          console.log('تم تحميل النماذج بنجاح:', sortedApartments.length);
        } else {
          console.log('لا توجد نماذج متاحة من الخادم، استخدام البيانات الثابتة');
          // استخدام البيانات الثابتة فقط إذا لم توجد بيانات من الخادم
          const fallbackData = [
          {
            _id: 'fallback-a',
            modelName: 'A',
            modelTitle: 'نموذج A',
            modelSubtitle: 'على شارع جنوبي شرقي',
            price: 830000,
            area: 156,
            roofArea: 156,
            rooms: 4,
            bathrooms: 4,
            location: 'قريب من المطار',
            direction: 'جنوبي شرقي',
            images: ['/a.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
            ]
          },
          {
            _id: 'fallback-b',
            modelName: 'B',
            modelTitle: 'نموذج B',
            modelSubtitle: 'خلفية شرقي شمالي غربي',
            price: 930000,
            area: 190,
            roofArea: 190,
            rooms: 5,
            bathrooms: 4,
            location: 'قريب من المطار',
            direction: 'شرقي شمالي غربي',
            images: ['/b.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
            ]
          },
          {
            _id: 'fallback-c',
            modelName: 'C',
            modelTitle: 'نموذج C',
            modelSubtitle: 'واجهة جنوبية غربية',
            price: 830000,
            area: 156,
            roofArea: 0,
            rooms: 4,
            bathrooms: 4,
            location: 'قريب من المطار',
            direction: 'جنوبية غربية',
            images: ['/c.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
            ]
          },
          {
            _id: 'fallback-d',
            modelName: 'D',
            modelTitle: 'نموذج D',
            modelSubtitle: 'ملحق شرقي شمالي',
            price: 1350000,
            area: 180,
            roofArea: 40,
            rooms: 5,
            bathrooms: 5,
            location: 'قريب من المطار',
            direction: 'شرقي شمالي',
            images: ['/a.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
              "اجمالي المساحه 220 متر"
            ]
          }
          ];
          setApartments(fallbackData);
        }
      } catch (err) {
        console.error('Error fetching apartments:', err);
        // في حالة فشل الاتصال، استخدم البيانات الثابتة كبديل
        const fallbackData = [
          {
            _id: 'fallback-a',
            modelName: 'A',
            modelTitle: 'نموذج A',
            modelSubtitle: 'على شارع جنوبي شرقي',
            price: 830000,
            area: 156,
            roofArea: 156,
            rooms: 4,
            bathrooms: 4,
            location: 'قريب من المطار',
            direction: 'جنوبي شرقي',
            images: ['/a.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
            ]
          },
          {
            _id: 'fallback-b',
            modelName: 'B',
            modelTitle: 'نموذج B',
            modelSubtitle: 'خلفية شرقي شمالي غربي',
            price: 930000,
            area: 190,
            roofArea: 190,
            rooms: 5,
            bathrooms: 4,
            location: 'قريب من المطار',
            direction: 'شرقي شمالي غربي',
            images: ['/b.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
            ]
          },
          {
            _id: 'fallback-c',
            modelName: 'C',
            modelTitle: 'نموذج C',
            modelSubtitle: 'واجهة جنوبية غربية',
            price: 830000,
            area: 156,
            roofArea: 0,
            rooms: 4,
            bathrooms: 4,
            location: 'قريب من المطار',
            direction: 'جنوبية غربية',
            images: ['/c.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
            ]
          },
          {
            _id: 'fallback-d',
            modelName: 'D',
            modelTitle: 'نموذج D',
            modelSubtitle: 'ملحق شرقي شمالي',
            price: 1350000,
            area: 180,
            roofArea: 40,
            rooms: 5,
            bathrooms: 5,
            location: 'قريب من المطار',
            direction: 'شرقي شمالي',
            images: ['/a.jpg'],
            features: [
              "غرفة خادمة",
              "غرفة سائق",
              "شقق مودرن",
              "أسقف مرتفعة",
              "نوافذ كبيرة",
              "صالة",
              "مطبخ",
              "بلكونة",
              "سمارت هوم",
              "موقف خاص",
              "مصعد",
              "كاميرات مراقبة",
              "اجمالي المساحه 220 متر"
            ]
          }
        ];
        setApartments(fallbackData);
      } finally {
        setApartmentsLoading(false);
      }
    };

    fetchApartments();
  }, [apartmentsRefreshKey]);

  // التحقق من النماذج الجديدة كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      refreshApartments();
    }, 30000); // 30 ثانية

    return () => clearInterval(interval);
  }, []);

  // التحقق من النماذج الجديدة عند التركيز على النافذة
  useEffect(() => {
    const handleFocus = () => {
      refreshApartments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const addToRefs = (el: HTMLElement | null, index: number) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current[index] = el
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? '' : section);
  };

  const [selectedModel, setSelectedModel] = useState(0);
  const [apartments, setApartments] = useState<any[]>([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(true);
  
  // Project data states
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [projectFeatures, setProjectFeatures] = useState<any[]>([]);
  const [projectWarranties, setProjectWarranties] = useState<any[]>([]);
  const [locationFeatures, setLocationFeatures] = useState<any>({});
  const [projectLoading, setProjectLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: defaultMessage || '' });
  interface FormErrors {
    name?: string;
    phone?: string;
    message?: string;
  }
  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate form
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = 'الرجاء إدخال الاسم';
    if (!formData.phone || !/^05\d{8}$/.test(formData.phone)) newErrors.phone = 'الرجاء إدخال رقم هاتف صحيح';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Send email through API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
          source: platform
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Track form submission across all platforms
      const eventData = {
        content_name: 'مشروع 24 - نموذج الاتصال',
        status: 'success',
        platform: platform
      };

      // Facebook Pixel
      trackFBEvent('Lead', eventData);

      // Snapchat Pixel
      trackSnapEvent('SIGN_UP', eventData);

      // TikTok Pixel
      trackTikTokEvent('Form', eventData);

      // Google Tag Manager
      pushToDataLayer({
        event: 'form_submission',
        ...eventData
      });

      // Show success toast
      toast.success('تم إرسال استفسارك بنجاح! سنتواصل معك قريباً', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        rtl: true,
      });

      // Prevent going back to the homepage after form submission
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
      };

      // Redirect to thank you page
      window.history.replaceState(null, '', '/thank-you');
      window.location.href = '/thank-you';
    } catch (error) {
      console.error('Error:', error);
      // Show error toast
      toast.error('حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        rtl: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Model Data
  const modelData = [
    {
      name: 'A',
      price: 'ريال 830,000 ',
      area: '156 م²',
      rooms: 4,
      bathrooms: 4,
      floor: 1,
      location: 'قريب من المطار',
      description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.'
    },
    {
      name: 'B',
      price: 'ريال 930,000 ',
      area: '190 م²',
      rooms: 5,
      bathrooms: 4,
      floor: 1,
      location: 'قريب من المطار',
      description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.'
    },
    // {
    //   name: 'C',
    //   price: '830,000 ريال',
    //   area: '156 م²',
    //   rooms: 4,
    //   bathrooms: 4,
    //   floor: 1,
    //   location: 'قريب من المطار',
    //   description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.'
    // },
    {
      name: 'D',
      price: '1,350,000 ريال',
      area: '220 م²',
      areaDetails: 'مساحة المباني ١٨٠ متر ومساحة السطح ٤٠ متر',
      rooms: 5,
      bathrooms: 5,
      floor: 1,
      location: 'قريب من المطار',
      description: 'هذا النموذج يتميز بتصميم عصري ومساحات واسعة تناسب العائلات الكبيرة، مع إطلالة مميزة على الحديقة الخلفية.'
    }
  ];

  // استخدام الدالة الجديدة من hook
  // getPhoneNumber الآن متاحة من useContactData hook

  // Add phone tracking function
  const handlePhoneClick = () => {
    const phoneNumber = getPhoneNumber(platform);
    const timestamp = new Date().toISOString();
    const eventData = {
      event_time: timestamp,
      content_name: 'Phone Call',
      content_category: 'Contact',
      platform: platform,
      phone_number: phoneNumber,
      phone_url: `tel:${phoneNumber}`,
      page_location: window.location.href,
      page_title: document.title,
      interaction_type: 'Phone Click',
      device_type: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      source: document.referrer || 'direct'
    };

    trackFBEvent('Contact', eventData);
    trackSnapEvent('CONTACT', eventData);
    trackTikTokEvent('Contact', eventData);
    trackGoogleEvent('Contact', eventData);
    pushToDataLayer({
      event: 'phone_click',
      ...eventData
    });
  };

  // Add WhatsApp tracking function
  // دالة لعرض الأيقونة المناسبة للميزة
  const getFeatureIcon = (iconName: string) => {
    const iconProps = "h-6 w-6 text-[#c48765] ml-3 flex-shrink-0";
    
    switch (iconName) {
      case 'MapPin':
        return <MapPin className={iconProps} />;
      case 'Building2':
        return <Building2 className={iconProps} />;
      case 'Shield':
        return <Shield className={iconProps} />;
      case 'Home':
        return <Home className={iconProps} />;
      case 'Car':
        return <Car className={iconProps} />;
      case 'Wifi':
        return <Wifi className={iconProps} />;
      case 'StoreIcon':
        return <StoreIcon className={iconProps} />;
      case 'Plane':
        return <Plane className={iconProps} />;
      default:
        return <Home className={iconProps} />; // أيقونة افتراضية
    }
  };

  const handleWhatsAppClick = () => {
    const timestamp = new Date().toISOString();
    
    // استخدام النظام الجديد للحصول على رابط الواتساب
    const whatsappUrl = getWhatsAppUrl(platform);
    window.open(whatsappUrl, '_blank');
    
    // استخراج رقم الواتساب من الرابط للتتبع
    const whatsappNumber = whatsappUrl.match(/wa\.me\/(\d+)/)?.[1] || '';

    const eventData = {
      event_time: timestamp,
      content_name: 'WhatsApp Click',
      content_category: 'Contact',
      platform: platform,
      whatsapp_number: whatsappNumber,
      whatsapp_url: whatsappUrl,
      page_location: window.location.href,
      page_title: document.title,
      interaction_type: 'WhatsApp Click',
      device_type: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      source: document.referrer || 'direct'
    };

    // Track across all platforms
    trackFBEvent('Contact', eventData);
    trackSnapEvent('CONTACT', eventData);
    trackTikTokEvent('Contact', eventData);
    trackGoogleEvent('Contact', eventData);
    pushToDataLayer({
      event: 'whatsapp_click',
      ...eventData
    });
  };

  return (
    <div className="bg-white min-h-screen overflow-x-hidden text-slate-900 text-right" dir="rtl" style={{
      backgroundImage: 'url("/1.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
         <div className="absolute inset-0 bg-white/90 -z-10"></div>
      <ToastContainer />
      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 text-slate-500 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">تواصل مع مستشار المبيعات</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الأسم (مطلوب)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1"> رقم الهاتف (مطلوب)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="05XXXXXXXX"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">استفسارك (اختياري)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  placeholder="اكتب استفسارك هنا (اختياري)"
                  required={false}
                />
                {/* Only show error if message validation is enabled */}
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-[#c48765] text-white py-2 rounded-lg hover:bg-[#34222e] transition-colors"
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-[#c48765]"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Platform badge */}
      {/* {platform !== "social" && (
        <div className="fixed top-3 left-3 z-40 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-md">
          {platform === "google" && "إعلان Google"}
          {platform === "tiktok" && "إعلان TikTok"}
          {platform === "snapchat" && "إعلان Snapchat"}
          {platform === "meta" && "إعلان Meta"}
        </div>
      )} */}

      {/* Share button */}
      <button
        onClick={shareProject}
        className="fixed top-3 right-3 z-40 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md"
        aria-label="مشاركة"
      >
        <Share2 className="h-5 w-5 text-[#c48765]" />
      </button>

      {/* Hero Section */}
      <section className="relative bg-[#34222e]/5 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div> {/* Added dark overlay */}
        <div className="container mx-auto px-4 relative"> {/* Added relative positioning */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {projectInfo?.projectName || 'مشروع سكني متميز'} <br />
              {projectInfo?.location?.district || projectInfo?.location?.address || 'في حي الزهراء بجدة'}
            </h1>
        
            <h2 className="text-2xl md:text-3xl text-white font-medium mb-4">
              {projectInfo?.startingPrice ? `بأسعار تبدأ من ${projectInfo.startingPrice.toLocaleString()} ${projectInfo.currency || 'ريال'}` : 'بأسعار تبدأ من 830,000 ريال'}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mt-4">
              {projectInfo?.description || 'امتلك منزل أحلامك في أفضل مواقع جدة'}
            </p>
          </div>
 
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#34222e]/20">
              <div className="text-center mb-8">
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-base md:text-lg font-medium text-slate-700">الأسم (مطلوب)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 md:p-4 text-base md:text-lg border-2 rounded-xl md:rounded-2xl bg-[#34222e]/5"
                    placeholder="الاسم الكامل"
                  />
                  {errors.name && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <label className="block text-base md:text-lg font-medium text-slate-700"> رقم الهاتف (مطلوب)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 md:p-4 text-base md:text-lg border-2 rounded-xl md:rounded-2xl bg-[#34222e]/5"
                      placeholder="05XXXXXXXX"
                    />
                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-[#c48765]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <label className="block text-base md:text-lg font-medium text-slate-700">استفسارك (اختياري)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 md:p-4 text-base md:text-lg border-2 rounded-xl md:rounded-2xl bg-[#34222e]/5 resize-none"
                    rows={3}
                    placeholder="اكتب استفسارك هنا"
                    required={false}
                  />
                  {errors.message && <p className="text-red-500 text-xs md:text-sm mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#34222e] text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-base md:text-xl font-medium hover:from-[#34222e] hover:to-[#1d0728] transition-all duration-300"
                >
                  تواصل مع مستشار المبيعات
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Quick Stats */}
      {/* <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 text-right">
            <div className="bg-[#34222e]/10 p-3 rounded-xl text-center">
              <div className="text-[#c48765] font-bold text-xl md:text-2xl">156+</div>
              <div className="text-xs md:text-sm">م² مساحة</div>
            </div>
            <div className="bg-[#34222e]/10 p-3 rounded-xl text-center">
              <div className="text-[#c48765] font-bold text-xl md:text-2xl">4-5</div>
              <div className="text-xs md:text-sm">غرف</div>
            </div>
            <div className="bg-[#34222e]/10 p-3 rounded-xl text-center">
              <div className="text-[#c48765] font-bold text-xl md:text-2xl">25</div>
              <div className="text-xs font-medium">
                سنة ضمان
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Project Images */}
      <div ref={(el) => addToRefs(el, 0)}>
        <ProjectImagesGallery isVisible={isVisible[0]} />
      </div>

      {/* Expandable Sections */}
<section className="py-12 bg-gradient-to-b from-slate-50 to-white">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Features Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="flex items-center mb-8">
          <Home className="h-10 w-10 text-[#c48765]" />
          <h3 className="text-2xl font-bold mr-4">مميزات المشروع</h3>
        </div>
        <ul className="space-y-4 flex-grow">
          {Array.isArray(projectFeatures) && projectFeatures.filter(feature => feature.featureType === 'project' || !feature.featureType).length > 0 ? 
            projectFeatures
              .filter(feature => feature.featureType === 'project' || !feature.featureType)
              .map((feature, index) => (
                <li key={feature._id || index} className="flex items-center p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  {getFeatureIcon(feature.icon || 'Home')}
                  <span className="text-base">{feature.title || 'ميزة'}</span>
                </li>
              )) : [
                  {
                    text: "موقع إستراتيجي قريب من الواجهة البحرية",
                    icon: <MapPin className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" />
                  },
                  {
                    text: "قريب من جميع الخدمات",
                    icon: <Building2 className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" />
                  },
                  {
                    text: "ضمانات تصل إلى 25 سنة",
                    icon: <Shield className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" />
                  },
                  {
                    text: "مساحات تصل إلى 220م²",
                    icon: <Home className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" />
                  },
                  {
                    text: "مواقف سيارات مخصصة",
                    icon: <Car className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" />
                  },
                  {
                    text: "سمارت هوم",
                    icon: <Wifi className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" />
                  }
          ].map((feature, index) => (
            <li key={index} className="flex items-center p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all duration-200">
                    {feature.icon}
                    <span className="text-base">{feature.text}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setIsModalOpen(true)}
                className="mt-8 w-full bg-[#c48765] text-white px-6 py-4 rounded-xl text-lg font-medium hover:bg-[#34222e] transition-all duration-300 hover:shadow-lg"
        >
          احجز الآن
        </button>
      </div>

        {/* Location Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="flex items-center mb-8">
          <MapPin className="h-10 w-10 text-[#c48765]" />
          <h3 className="text-2xl font-bold mr-4">مميزات الموقع</h3>
        </div>
        <div className="space-y-6 flex-grow">
          <div className="grid grid-cols-1 gap-6">
            {/* عرض مميزات الموقع من API الجديد */}
            {locationFeatures && Object.keys(locationFeatures).length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {/* مجموعة قريب من */}
                {locationFeatures.nearby && locationFeatures.nearby.length > 0 && (
                  <div className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                    <h4 className="text-lg font-bold mb-4">قريب من:</h4>
                    <ul className="space-y-3">
                      {locationFeatures.nearby.map((feature: any, index: number) => (
                        <li key={feature._id || index} className="flex items-center">
                          {getFeatureIcon(feature.icon || 'MapPin')}
                          <span className="text-base">{feature.title || 'ميزة موقع'}</span>
                          {feature.distance && (
                            <span className="text-sm text-gray-500 mr-2">({feature.distance})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* مجموعة دقائق من */}
                {locationFeatures.minutesFrom && locationFeatures.minutesFrom.length > 0 && (
                  <div className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                    <h4 className="text-lg font-bold mb-4">دقائق من:</h4>
                    <ul className="space-y-3">
                      {locationFeatures.minutesFrom.map((feature: any, index: number) => (
                        <li key={feature._id || index} className="flex items-center">
                          {getFeatureIcon(feature.icon || 'MapPin')}
                          <span className="text-base">{feature.title || 'ميزة موقع'}</span>
                          {feature.distance && (
                            <span className="text-sm text-gray-500 mr-2">({feature.distance})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* الفئات الأخرى */}
                {['transport', 'services', 'entertainment'].map((category) => {
                  if (!locationFeatures[category] || locationFeatures[category].length === 0) return null;
                  
                  const categoryLabels: { [key: string]: string } = {
                    transport: 'المواصلات',
                    services: 'الخدمات',
                    entertainment: 'الترفيه'
                  };
                  
                  return (
                    <div key={category} className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                      <h4 className="text-lg font-bold mb-4">{categoryLabels[category]}:</h4>
                      <ul className="space-y-3">
                        {locationFeatures[category].map((feature: any, index: number) => (
                          <li key={feature._id || index} className="flex items-center">
                            {getFeatureIcon(feature.icon || 'MapPin')}
                            <span className="text-base">{feature.title || 'ميزة موقع'}</span>
                            {feature.distance && (
                              <span className="text-sm text-gray-500 mr-2">({feature.distance})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* مميزات افتراضية إذا لم توجد بيانات من API */
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  <h4 className="text-lg font-bold mb-4">قريب من:</h4>
                  <ul className="space-y-3">
                    {[
                      {
                        text: "الشوارع الرئيسية", icon:
<svg 
  fill="#c48765" 
  className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0"
  
  version="1.1" 
  id="Layer_1" 
  xmlns="http://www.w3.org/2000/svg" 
  xmlnsXlink="http://www.w3.org/1999/xlink" 
  viewBox="0 0 512.00 512.00" 
  xmlSpace="preserve" 
  stroke="#c48765" 
  transform="rotate(0)"
>
  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <g>
      <g>
        <path d="M366.933,0h-102.4v25.6c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V0h-102.4 c-4.71,0-8.533,3.814-8.533,8.533v494.933c0,4.719,3.823,8.533,8.533,8.533h102.4v-25.6c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V512h102.4c4.71,0,8.533-3.814,8.533-8.533V8.533C375.467,3.814,371.644,0,366.933,0z M196.267,307.2c0,4.719-3.823,8.533-8.533,8.533s-8.533-3.814-8.533-8.533V204.8c0-4.719,3.823,8.533,8.533-8.533 s8.533,3.814,8.533,8.533V307.2z M230.4,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M264.533,441.6c0,4.719-3.823,8.533-8.533,8.533 c-4.71,0-8.533-3.814-8.533-8.533v-29.867c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V441.6z M264.533,366.933c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533v-17.067c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V366.933z M264.533,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M264.533,162.133c0,4.719-3.823,8.533-8.533,8.533 c-4.71,0-8.533-3.814-8.533-8.533v-17.067c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V162.133z M264.533,100.267c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V70.4c0-4.719,3.823-8.533,8.533-8.533 c4.71,0,8.533,3.814,8.533,8.533V100.267z M298.667,307.2c0,4.719-3.823,8.533-8.533,8.533c-4.71,0-8.533-3.814-8.533-8.533V204.8 c0-4.719,3.823-8.533,8.533-8.533c4.71,0,8.533,3.814,8.533,8.533V307.2z M332.8,307.2c0,4.719-3.823,8.533-8.533,8.533 s-8.533-3.814-8.533-8.533V204.8c0-4.719,3.823-8.533,8.533-8.533s8.533,3.814,8.533,8.533V307.2z"></path>
      </g>
    </g>
  </g>
</svg>
                      },
                      { text: "مسجد قريب", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor"><g><rect fill="none" height="24" width="24" /></g><g><g><path d="M7,8h10c0.29,0,0.57,0.06,0.84,0.13C17.93,7.8,18,7.46,18,7.09c0-1.31-0.65-2.53-1.74-3.25L12,1L7.74,3.84 C6.65,4.56,6,5.78,6,7.09C6,7.46,6.07,7.8,6.16,8.13C6.43,8.06,6.71,8,7,8z" /><path d="M24,7c0-1.1-2-3-2-3s-2,1.9-2,3c0,0.74,0.4,1.38,1,1.72V13h-2v-2c0-1.1-0.9-2-2-2H7c-1.1,0-2,0.9-2,2v2H3V8.72 C3.6,8.38,4,7.74,4,7c0-1.1-2-3-2-3S0,5.9,0,7c0,0.74,0.4,1.38,1,1.72V21h9v-4c0-1.1,0.9-2,2-2s2,0.9,2,2v4h9V8.72 C23.6,8.38,24,7.74,24,7z" /></g></g></svg> },
                      { text: "الخدمات", icon: <StoreIcon className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" /> },
                      { text: "المراكز التجارية", icon: <Building2 className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" /> },
                      { text: "المطار", icon: <Plane className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0" /> }
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        {item.icon}
                        <span className="text-base">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50/50 p-6 rounded-xl hover:bg-amber-50 transition-all duration-200">
                  <h4 className="text-lg font-bold mb-4">دقائق من:</h4>
                  <ul className="space-y-3">
                    {[
                      {
                        text: "طريق الأمير سلطان",
                        icon: (
                          <svg
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 19L8 19" />
                            <path d="M12 19L20 19" />
                            <path d="M4 15L20 15" />
                            <path d="M4 11L20 11" />
                            <path d="M4 7L20 7" />
                            <path d="M4 3L20 3" />
                          </svg>
                        ),
                      },
                      {
                        text: "شارع حراء",
                        icon: (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-[#c48765] ml-3 flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor" 
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3L21 21" />
                            <path d="M21 3L3 21" />
                            <rect x="7" y="7" width="10" height="10" />
                            <path d="M12 7V17" />
                            <path d="M7 12H17" />
                          </svg>
                        ),
                      }].map((item, index) => (
                      <li key={index} className="flex items-center">
                        {item.icon}
                        <span className="text-base">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
                className="mt-8 w-full bg-[#c48765] text-white px-6 py-4 rounded-xl text-lg font-medium hover:bg-[#34222e] transition-all duration-300 hover:shadow-lg"
        >
          احجز شقتك الآن
        </button>
      </div>
    </div>

    {/* Project Video Section */}
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">فيديو المشروع</h2>
        <div className="w-20 h-1 bg-[#c48765] mx-auto mt-4"></div>
      </div>

      <div 
        className="relative aspect-video max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 cursor-pointer"
        onClick={() => setVideoModalOpen(true)}
      >
        <Image
          src="/1.jpg"
          alt="فيديو المشروع"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#c48765] w-20 h-20 rounded-full flex items-center justify-center shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="white"
              className="ml-2"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 text-white">
          <p className="text-xl font-bold mb-1">فيديو المشروع</p>
          <p className="text-base">اضغط للمشاهدة</p>
        </div>
      </div>

      {/* Book now button */}
      <div className="text-center mt-8">
        <button
          onClick={() => setIsModalOpen(true)}
                className="bg-[#c48765] hover:bg-[#34222e] text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          احجز وتملك الآن شقة العمر
        </button>
      </div>
    </div>
    {/* Warranty Card - Full Width */}
    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center mb-8">
        <Shield className="h-10 w-10 text-[#c48765]" />
        <h3 className="text-2xl font-bold mr-4">ضمانات المشروع</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.isArray(projectWarranties) && projectWarranties.length > 0 ? projectWarranties.map((warranty, index) => (
          <div key={warranty._id || index} className="p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all duration-200 flex flex-col justify-center">
            <div className="text-2xl font-bold text-[#c48765]">{warranty.years}</div>
            <div className="text-sm font-medium">
              {warranty.years === 1 ? "سنة" : warranty.years === 2 ? "سنتين" : "سنوات"}
            </div>
            <div className="text-base mt-2">{warranty.description}</div>
          </div>
        )) : [
                { years: "20", description: "القواطع والأفياش" },
          { years: "20", description: "الهيكل الإنشائي" },
          { years: "5", description: "المصاعد" },
          { years: "2", description: "أعمال السباكة والكهرباء" },
          { years: "2", description: "سمارت هوم" },
          { years: "1", description: "اتحاد ملاك" }
        ].map((warranty, index) => (
          <div key={index} className="p-4 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all duration-200 flex flex-col justify-center">
            <div className="text-2xl font-bold text-[#c48765]">{warranty.years}</div>
            <div className="text-sm font-medium">
              {warranty.years === "1" ? "سنة" : warranty.years === "2" ? "سنتين" : "سنوات"}
            </div>
            <div className="text-base mt-2">{warranty.description}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
              className="mt-8 w-full bg-[#c48765] text-white px-6 py-4 rounded-xl text-lg font-medium hover:bg-[#34222e] transition-all duration-300 hover:shadow-lg"
      >
        سجل الآن
      </button>
    </div>
  </div>
</section>

      {/* Project Models */}
      <section ref={(el) => addToRefs(el, 2)} className="py-10 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible[2] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center">نماذج المشروع</h2>
            <div className="w-16 h-1 bg-[#c48765] mr-auto ml-auto mt-2"></div>
          </motion.div>
          
          {apartmentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c48765] mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل النماذج...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible[2] ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Tabs defaultValue={`model-${apartments[0]?.modelName?.toLowerCase() || 'a'}`} className="w-full">
                <div className="mb-6 overflow-x-auto">
                  <TabsList className={`grid bg-slate-100 p-1 rounded-full w-full min-w-max ${apartments && apartments.length <= 4 ? 'grid-cols-4' : apartments && apartments.length <= 6 ? 'grid-cols-6' : apartments && apartments.length <= 8 ? 'grid-cols-8' : 'grid-cols-10'}`}>
                  {apartments && apartments.map((apartment, index) => (
                    <TabsTrigger
                      key={index}
                      value={`model-${apartment.modelName.toLowerCase()}`}
                      className="rounded-full data-[state=active]:bg-[#c48765] data-[state=active]:text-white py-2"
                    >
                      {apartment.modelName}
                    </TabsTrigger>
                  ))}
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  {apartments && apartments.map((apartment, index) => (
                    <TabsContent key={apartment._id} value={`model-${apartment.modelName.toLowerCase()}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-4xl mx-auto"
                      >
                        <MobileModelCard
                          title={apartment.modelTitle}
                          image={apartment.images && apartment.images.length > 0 ? apartment.images[0].trim() : '/placeholder.svg'}
                          subtitle={apartment.modelSubtitle}
                          area={apartment.area}
                          roofArea={apartment.roofArea || 0}
                          rooms={apartment.rooms}
                          bathrooms={apartment.bathrooms}
                          price={apartment.price.toLocaleString()}
                          features={apartment.features || []}
                          onInquire={handleWhatsAppClick}
                        />
                      </motion.div>
                    </TabsContent>
                  ))}
                </AnimatePresence>
              </Tabs>
            </motion.div>
          )}
        </div>
      </section>

      {/* Interactive Model Display Section */}

      {/* Project Map */}
      <section ref={(el) => addToRefs(el, 3)} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible[3] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#34222e]">موقع المشروع</h2>
            <div className="w-20 h-1 bg-[#c48765] mx-auto mt-4"></div>
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible[3] ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <MapSection />
          </motion.div>
        </div>
      </section>


      {/* Sticky CTA */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-slate-200 p-3 z-40"
          >
            <div className="container mx-auto flex items-center justify-between">
                            <a href={`tel:${getPhoneNumber(platform)}`}>
                              <Button
                                onClick={handlePhoneClick}
                                className="bg-[#34222e] hover:bg-[#c48765] text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
                                id="phone-sticky-button"
                              >
                                اتصل الآن
                                <PhoneIcon className="h-4 w-4" />
                              </Button>
                            </a>
                            <Link href={getWhatsAppUrl(platform)} target="_blank">
<Button onClick={handleWhatsAppClick} className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full shadow-md">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
  احجز الان
</Button>
</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full z-10"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/l9cH8RJQnYg"
                title="امتلك شقتك الآن في مدينة جدة - حي الزهراء"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen

              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShareModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#34222e] p-4 text-white">
                <h3 className="text-lg font-bold text-center">مشاركة المشروع</h3>
                <p className="text-sm text-center">شارك المشروع مع أصدقائك وعائلتك</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { 
                      name: "واتساب", 
                      color: "#c48765", 
                      icon: "whatsapp.svg",
                      action: () => {
                        const shareText = encodeURIComponent("مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة\n\nاستفسر الآن عن مشروع 24 في حي الزهراء\n" + window.location.href);
                        window.open(`https://wa.me/?text=${shareText}`, "_blank");
                      }
                    },
                    { 
                      name: "تويتر", 
                      color: "#d68c3c", 
                      icon: "twitter.svg",
                      action: () => {
                        const shareText = encodeURIComponent("مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة");
                        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(window.location.href)}`, "_blank");
                      }
                    },
                    { 
                      name: "فيسبوك", 
                      color: "#34222e", 
                      icon: "facebook.svg",
                      action: () => {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
                      }
                    },
                    { 
                      name: "تلجرام", 
                      color: "#1d0728", 
                      icon: "telegram.svg",
                      action: () => {
                        const shareText = encodeURIComponent("مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة");
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${shareText}`, "_blank");
                      }
                    },
                  ].map((platform, index) => (
                    <button 
                      key={index} 
                      className="flex flex-col items-center"
                      onClick={() => {
                        platform.action();
                        setShareModalOpen(false);
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                        style={{ backgroundColor: platform.color }}
                      >
                        <span className="text-white text-lg font-bold">
                          {platform.name === "واتساب" ? "📱" : 
                           platform.name === "تويتر" ? "🐦" : 
                           platform.name === "فيسبوك" ? "📘" : 
                           platform.name === "تلجرام" ? "✈️" : "📤"}
                        </span>
                      </div>
                      <span className="text-xs">{platform.name}</span>
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center mb-4">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-right"
                  />
                  <Button
                    className="absolute right-1 top-1 bottom-1 bg-[#c48765] hover:bg-[#34222e] text-white text-xs px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("تم نسخ الرابط");
                    }}
                  >
                    نسخ الرابط
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-slate-300"
                  onClick={() => setShareModalOpen(false)}
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Component for expandable sections
  function ExpandableSection({
    title,
    isExpanded,
    toggleExpand,
    icon,
    children,
  }: {
    title: string;
    isExpanded: boolean;
    toggleExpand: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) {
    return (
      <div className="mb-4">
        <button
          onClick={toggleExpand}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#c48765]"
        >
          <div className="flex items-center">
            {icon}
            <span className="text-lg font-bold mr-3">{title}</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-[#c48765] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {children}
        </div>
      </div>
    )
  }

  // Component for mobile model cards
  function MobileModelCard({
    title,
    subtitle,
    image,
    area,
    roofArea,
    rooms,
    bathrooms,
    price,
    features,
    onInquire
  }: {
    title: string;
    subtitle: string;
    image: string | StaticImport;
    area: number;
    roofArea: number;
    rooms: number;
    bathrooms: number;
    price: string;
    features: string[];
    onInquire: (modelName: string) => void;
  }) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="relative aspect-[16/9] -mx-4 -mt-4 mb-6 overflow-hidden rounded-t-lg shadow-lg">
            <Image
              src={image}
              alt={title}
              width={1280}
              height={720}
              className="object-cover hover:scale-105 transition-transform duration-300"
              quality={90}
              priority={true}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-4 right-4 bg-[#34222e] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
              {price}
            </div>
          </div>

          <div className="space-y-3 mb-5 text-end">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-600 font-medium">{subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4" dir="rtl">
              <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Home className="h-6 w-6 text-[#c48765] ml-2" />
                <div>
                  <div className="text-xs text-slate-500">المساحة</div>
                  <div className="text-sm font-semibold text-slate-800">{area} م²</div>
                </div>
                
              </div>
              <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100" dir="rtl">
                <Building2 className="h-6 w-6 text-[#c48765] ml-2" />
                <div>
                  <div className="text-xs font-bold text-slate-500">مساحة السطح</div>
                  <div className="text-sm font-semibold text-slate-800">{roofArea} م²</div>
                </div>
              </div>
              <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Home className="h-6 w-6 text-[#c48765] ml-2" />
                <div>
                  <div className="text-xs text-slate-500">الغرف</div>
                  <div className="text-sm font-semibold text-slate-800">{rooms}</div>
                </div>
              </div>
              <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Shield className="h-6 w-6 text-[#c48765] ml-2" />
                <div>
                  <div className="text-xs text-slate-500">دورات المياه</div>
                  <div className="text-sm font-semibold text-slate-800">{bathrooms}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm font-medium text-slate-700 mb-3">المميزات:</div>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors duration-200" dir="rtl">
                <Check className="h-5 w-5 text-[#c48765] ml-2 flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500">السعر يبدأ من</div>
              <div className="text-xl font-bold text-[#34222e] flex items-center gap-1">
                <Image src="/riyal.svg" alt="ريال" width={35} height={35} className="ml-1" />
                {price}
              </div>
            </div>
            <Link href={getWhatsAppUrl(platform)} target="_blank">


            <Button
              size="sm"
              className="bg-[#c48765] hover:bg-[#34222e] text-white px-6 flex items-center gap-2"
              onClick={handleWhatsAppClick}
              id="whatsapp-model-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              استفسار عبر واتساب
            </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }
}
