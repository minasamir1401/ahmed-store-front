"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShieldCheck, Award, Users, Heart, Sparkles, Star } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function AboutPageClient() {
  const { t, dir } = useLanguage()

  const values = [
    {
      icon: ShieldCheck,
      title: t('about_pillar1_title'),
      desc: t('about_pillar1_desc')
    },
    {
      icon: Award,
      title: t('about_pillar2_title'),
      desc: t('about_pillar2_desc')
    },
    {
      icon: Users,
      title: t('about_pillar3_title'),
      desc: t('about_pillar3_desc')
    }
  ]

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f7fbf9] pb-32" dir={dir}>
        
        {/* Story Section */}
        <section className="relative bg-white pt-20 pb-28 overflow-hidden border-b border-[#e8f0ed]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[120px] opacity-35 pointer-events-none" />
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center space-y-4 mb-16">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                <Sparkles size={14} /> {t('about_badge')}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 leading-tight">
                {t('about_heading').split('Vitamins HUB')[0]} <span className="text-primary">Vitamins HUB</span>
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                {t('about_subheading')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-snug">
                  {t('about_content_title')}
                </h2>
                <p className="text-gray-600 font-medium leading-loose text-sm">
                  {t('about_p1')}
                </p>
                <p className="text-gray-600 font-medium leading-loose text-sm">
                  {t('about_p2')}
                </p>
              </div>
              <div className="aspect-[4/3] rounded-[3rem] bg-emerald-50/50 p-8 border border-emerald-100/50 flex items-center justify-center relative overflow-hidden shadow-sm">
                 <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Star size={20} fill="currentColor" /></div>
                    <div>
                      <div className="font-black text-sm text-gray-800">{t('about_badge_100')}</div>
                      <div className="text-[10px] text-gray-450 font-bold">{t('about_badge_100_desc')}</div>
                    </div>
                 </div>
                 <Heart size={140} className="text-primary/20 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Pillars / Values Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-3xl font-black text-gray-800">{t('about_pillars_title')}</h2>
              <p className="text-gray-500 font-bold">{t('about_pillars_sub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val, idx) => {
                const Icon = val.icon
                return (
                  <div 
                    key={idx} 
                    className="bg-white rounded-[2.5rem] p-8 border border-[#e8f0ed] shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:translate-y-[-5px] transition-all group flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#f0f7f4] text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      <Icon size={28} />
                    </div>
                    <h3 className="font-black text-lg text-gray-800 mb-3">{val.title}</h3>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
