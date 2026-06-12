"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = React.useState(false)
  const [stickyBarVisible, setStickyBarVisible] = React.useState(false)
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  const isProductPage = pathname?.startsWith('/product/')

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    const handleStickyChange = (e: Event) => {
      const customEvent = e as CustomEvent
      setStickyBarVisible(customEvent?.detail?.visible ?? false)
    }
    window.addEventListener('sticky-bar-change', handleStickyChange)
    return () => window.removeEventListener('sticky-bar-change', handleStickyChange)
  }, [])

  React.useEffect(() => {
    setStickyBarVisible(false)
  }, [pathname])

  // Determine the bottom position based on the device and sticky bar status
  // On mobile (below md/768px):
  // - If sticky bar is visible: bottom-[176px] (on xs/475px+), bottom-[136px] (on <=475px), bottom-[124px] (on <=340px)
  // - If sticky bar is hidden: bottom-20 (80px, leaving 20px above BottomNav's 60px) or bottom-[76px] (on <=340px)
  // On desktop (md/768px and above): bottom-8
  const bottomClass = React.useMemo(() => {
    if (isProductPage && stickyBarVisible) {
      return 'bottom-[176px] max-[475px]:bottom-[136px] max-[340px]:bottom-[124px] md:bottom-8'
    }
    return 'bottom-20 max-[340px]:bottom-[76px] md:bottom-8'
  }, [isProductPage, stickyBarVisible])

  return (
    <div className={`fixed left-6 max-[340px]:left-3 flex flex-col gap-3 max-[340px]:gap-2 z-40 transition-all duration-300 print:hidden ${bottomClass}`}>
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="تواصل معنا عبر واتساب"
        className="w-14 h-14 max-[340px]:w-10 max-[340px]:h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
        onClick={() => window.open('https://wa.me/966500000000', '_blank')}
      >
        <MessageCircle className="w-7 h-7 max-[340px]:w-5 max-[340px]:h-5" />
      </motion.button>

      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="الرجوع إلى الأعلى"
          className="w-14 h-14 max-[340px]:w-10 max-[340px]:h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-xl border border-slate-100"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="w-7 h-7 max-[340px]:w-5 max-[340px]:h-5" />
        </motion.button>
      )}
    </div>
  )
}
