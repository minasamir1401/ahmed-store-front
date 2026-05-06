"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowUp } from 'lucide-react'

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed bottom-24 md:bottom-8 left-6 flex flex-col gap-3 z-40">
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
        onClick={() => window.open('https://wa.me/966500000000', '_blank')}
      >
        <MessageCircle size={28} />
      </motion.button>

      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-white text-primary rounded-full flex items-center justify-center shadow-xl border border-slate-100"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp size={28} />
        </motion.button>
      )}
    </div>
  )
}
