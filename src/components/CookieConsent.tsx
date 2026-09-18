"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Cookie } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function CookieConsent() {
  const { language, dir } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('vitahub_cookie_consent')
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, [])

  const handleConsent = (choice: 'accepted' | 'essential') => {
    try {
      localStorage.setItem('vitahub_cookie_consent', choice)
      window.dispatchEvent(new Event('cookie_consent_updated'))
    } catch {
      // Ignore
    }
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="region"
          aria-label={language === 'ar' ? 'إشعار الخصوصية وملفات تعريف الارتباط' : 'Privacy and Cookie Notice'}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
          dir={dir}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 p-5 shadow-2xl shadow-slate-900/10 text-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Cookie size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  {language === 'ar' ? 'إدارة الخصوصية وملفات الارتباط' : 'Privacy & Cookie Preferences'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'نستخدم ملفات تعريف الارتباط المعتمدة لتأمين طلباتك وتقديم تجربة تسوق موثوقة تلائم احتياجاتك.'
                    : 'We use verified cookies to secure your shopping cart and provide an optimal, personalized browsing experience.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleConsent('accepted')}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors text-center cursor-pointer shadow-sm shadow-emerald-700/20"
              >
                {language === 'ar' ? 'موافق على الكل' : 'Accept All'}
              </button>
              <button
                type="button"
                onClick={() => handleConsent('essential')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
              >
                {language === 'ar' ? 'الضرورية فقط' : 'Essential Only'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
