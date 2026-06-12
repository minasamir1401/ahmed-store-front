"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Building2, ChevronLeft, Loader2, Package } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { safeBrandImage } from '@/lib/product-images'

function BrandSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-[#e8f0ed] flex flex-col items-center gap-6">
      <div className="aspect-square w-full bg-slate-100 animate-pulse rounded-[1.5rem]" />
      <div className="h-4 bg-slate-100 animate-pulse rounded-md w-2/3" />
    </div>
  )
}

export default function BrandsPage() {
  const { t, language, dir, translate } = useLanguage()
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBrands = () => {
    setLoading(true)
    setError(null)
    fetch('/api/brands')
      .then(res => {
        if (!res.ok) throw new Error(language === 'ar' ? 'فشل تحميل الماركات.' : 'Failed to load brands.')
        return res.json()
      })
      .then(data => {
        setBrands(data)
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(language === 'ar' 
          ? "عذراً، فشل تحميل الماركات التجارية. يرجى المحاولة مرة أخرى."
          : "Sorry, failed to load brands. Please try again."
        )
        setLoading(false)
      })
  }

  useEffect(() => {
    document.title = language === 'ar' ? 'الماركات التجارية | Vitamins HUB' : 'Brands | Vitamins HUB'
    fetchBrands()
  }, [language])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-24" dir={dir}>
        
        {/* Hero Section */}
        <div className="bg-white border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-4 tracking-tight">
              {language === 'ar' ? 'شركاء النجاح' : 'Success Partners'}
            </h1>
            <p className="text-gray-500 font-bold text-lg">
              {language === 'ar' ? 'نحن نوفر لك أفضل العلامات التجارية العالمية الموثوقة' : 'We provide you with the best trusted global brands'}
            </p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-16">
          {error ? (
            <div className="text-center py-16 bg-red-50/50 rounded-[2rem] border border-red-100 max-w-md mx-auto px-6">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
              <p className="text-red-700 font-bold text-sm mb-4 leading-relaxed">{error}</p>
              <button
                onClick={fetchBrands}
                className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-700/10 cursor-pointer"
              >
                {t('retry')}
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <BrandSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {brands.map((brand) => (
                <Link 
                  key={brand.id} 
                  href={`/brands/${brand.id}`}
                  className="group bg-white rounded-[2.5rem] p-8 border border-[#e8f0ed] hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-2 flex flex-col items-center gap-6"
                >
                  <div className="aspect-square w-full bg-gray-50 rounded-[1.5rem] p-4 flex items-center justify-center overflow-hidden border border-gray-50 group-hover:bg-white transition-all">
                    {brand.image ? (
                      <img src={safeBrandImage(brand.image)} className="w-full h-full object-contain mix-blend-multiply" alt={translate(brand.name)} />
                    ) : (
                      <Building2 size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black text-gray-800 group-hover:text-primary transition-colors">{translate(brand.name)}</h3>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black text-primary uppercase opacity-0 group-hover:opacity-100 transition-all">
                      <span>{language === 'ar' ? 'اكتشف المنتجات' : 'Discover Products'}</span>
                      <ChevronLeft size={10} className={language === 'en' ? 'rotate-180' : ''} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && brands.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><Building2 size={40} /></div>
              <h3 className="text-xl font-black text-gray-400">
                {language === 'ar' ? 'لا توجد شركات حالياً' : 'No brands available'}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {language === 'ar' ? 'نعمل على إضافة المزيد من الماركات قريباً' : 'We are working on adding more brands soon'}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
