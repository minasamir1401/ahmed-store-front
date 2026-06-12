"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/context/LanguageContext'

export default function FAQPageClient() {
  const { t, dir, language } = useLanguage()

  const faqs = [
    {
      q: t('faq_q1'),
      a: t('faq_a1')
    },
    {
      q: language === 'ar' ? "كم يستغرق الشحن والتوصيل داخل محافظات مصر؟" : "How long does shipping and delivery take within Egypt?",
      a: t('faq_a2')
    },
    {
      q: language === 'ar' ? "ما هي طرق الدفع المتاحة في المتجر؟" : "What are the available payment methods in the store?",
      a: language === 'ar' 
        ? "نوفر الدفع عبر إنستاباي والمحافظ الإلكترونية كخيارات دفع أساسية لضمان السرعة والأمان التام."
        : "We provide Instapay bank transfer and mobile wallets as primary payment options to ensure complete speed and security."
    },
    {
      q: language === 'ar' ? "هل يمكنني إرجاع أو استبدال المنتج بعد الشراء؟" : "Can I return or exchange the product after purchase?",
      a: language === 'ar'
        ? "نعم بالطبع، نوفر سياسة إرجاع واستبدال مرنة للغاية وسريعة خلال 7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية المغلقة وغير مفتوح."
        : "Yes of course, we provide a very flexible and fast 7-day return and exchange policy from the receipt date, provided the product remains in its original unopened condition."
    },
    {
      q: t('faq_q4'),
      a: t('faq_a4')
    }
  ]

  const isRtl = language === 'ar'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] py-20 pb-32" dir={dir}>
        <div className="container mx-auto px-4 max-w-4xl bg-white p-8 md:p-16 rounded-[3rem] shadow-xl shadow-primary/5 border border-[#e8f0ed]">
          
          <div className="text-center mb-12">
            <span className="text-primary font-black text-xs uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full">
              {language === 'ar' ? 'مركز الدعم والمساعدة' : 'Support & Help Center'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 mt-4 leading-tight">{t('faq_heading')}</h1>
            <p className="text-gray-500 font-bold mt-2">{t('faq_sub')}</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="p-6 md:p-8 rounded-[2rem] bg-[#f0f7f4] border border-[#e8f0ed] transition-all hover:bg-white hover:shadow-lg hover:shadow-primary/5 group"
              >
                <h3 className={`font-black text-lg md:text-xl text-gray-800 mb-3 group-hover:text-primary transition-colors flex items-start gap-3 ${isRtl ? 'justify-start' : 'flex-row-reverse justify-end'}`}>
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-1">
                    {language === 'ar' ? 'س' : 'Q'}
                  </span>
                  <span className={isRtl ? 'text-right' : 'text-left'}>{faq.q}</span>
                </h3>
                <p className={`text-gray-600 font-medium leading-relaxed text-sm pr-9 ${isRtl ? 'border-r text-right pr-9' : 'border-l text-left pl-9 pr-0'} border-slate-200`}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
