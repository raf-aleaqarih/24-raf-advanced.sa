import './globals.css'
import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { Providers } from '../components/providers'
import { Toaster } from 'react-hot-toast'

const ibmArabic = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-ibm-arabic',
})

export const metadata: Metadata = {
  title: 'لوحة تحكم مشروع 24 - حي الزهراء',
  description: 'لوحة تحكم شاملة لإدارة محتوى مشروع 24 العقاري في حي الزهراء بجدة',
  keywords: ['لوحة تحكم', 'مشروع 24', 'حي الزهراء', 'عقاري', 'إدارة المحتوى'],
  authors: [{ name: 'فريق التطوير' }],
  robots: 'noindex, nofollow', // منع الأرشفة للوحة التحكم
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={ibmArabic.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#c48765" />
      </head>
      <body className={`${ibmArabic.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
            toastOptions={{
              // تخصيص التنبيهات
              className: 'arabic-text',
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif',
                textAlign: 'right',
                direction: 'rtl',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  borderColor: '#10B981',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  borderColor: '#EF4444',
                },
              },
              loading: {
                duration: Infinity,
                iconTheme: {
                  primary: '#c48765',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
