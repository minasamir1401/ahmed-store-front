"use client"

import React, { useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/context/LanguageContext'

export default function ReturnsPage() {
  const { t, dir, language } = useLanguage()

  useEffect(() => {
    document.title = t('policy_returns_title')
  }, [language, t])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-20" dir={dir}>
        <div className="container mx-auto px-4 max-w-4xl bg-white p-12 rounded-[3rem] shadow-sm">
          <h1 className="text-4xl font-black mb-8">{t('policy_returns_heading')}</h1>
          <div className="text-base sm:text-lg text-slate-600 leading-relaxed whitespace-pre-line">
            {t('policy_returns_content')}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
