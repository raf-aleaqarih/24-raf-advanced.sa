import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import FacebookPixel from './components/FacebookPixel'
import SnapchatPixel from './components/SnapchatPixel'
import TikTokPixel from './components/TikTokPixel'
import GoogleTagManager from './components/GoogleTagManager'

const ibm = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة",
  description: "مشروع سكني متميز في حي الزهراء بجدة بأسعار استثنائية تبدأ من 830000 ﷼ فقط",
  generator: 'v0.dev',
  keywords: ["مشروع 24", "حي الزهراء", "جدة", "منزل العمر", "سكني", "أسعار استثنائية", "830000 ﷼", "امتلك منزل العمر في جدة"],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#f59e0b" />
        <meta property="og:title" content="مشروع 24 - حي الزهراء | امتلك منزل العمر في جدة" />
        <meta
          property="og:description"
          content="مشروع سكني متميز في حي الزهراء بجدة بأسعار استثنائية تبدأ من 830000 ﷼ فقط"
        />
        <meta property="og:image" content="/placeholder.svg?height=1200&width=1200&text=مشروع 24 - حي الزهراء" />
        <meta property="og:url" content="https://project24.raf-advanced.sa/" />
        <meta property="og:type" content="website" />
      </head>
      <body className={ibm.className}>
        <FacebookPixel />
        <SnapchatPixel />
        <TikTokPixel />
        <GoogleTagManager />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'