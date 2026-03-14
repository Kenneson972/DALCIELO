'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { QueueEstimateProvider } from '@/providers/QueueEstimateProvider'

// Lazy load des widgets non-critiques (kb-performance) — chargés après le contenu principal
const Chatbot = dynamic(() => import('@/components/ui/Chatbot').then((m) => m.Chatbot), { ssr: false })
const AnnouncementPopup = dynamic(
  () => import('@/components/sections/AnnouncementPopup').then((m) => m.AnnouncementPopup),
  { ssr: false }
)
const StickyCartBar = dynamic(
  () => import('@/components/layout/StickyCartBar').then((m) => m.StickyCartBar),
  { ssr: false }
)

export function LayoutSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  const isReceipt = pathname?.endsWith('/receipt')

  if (isAdmin || isReceipt) {
    return <QueueEstimateProvider>{children}</QueueEstimateProvider>
  }

  return (
    <QueueEstimateProvider>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <Chatbot />
        <AnnouncementPopup />
        <StickyCartBar />
      </Suspense>
    </QueueEstimateProvider>
  )
}
