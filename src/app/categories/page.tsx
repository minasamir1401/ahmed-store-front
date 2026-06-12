"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { LayoutGrid, ChevronLeft, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

function CategorySkeleton() {
  return (
    <div className="bg-white border border-[#e8f0ed] rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center gap-6">
      <div className="w-20 h-20 bg-slate-100 animate-pulse rounded-[2rem]" />
      <div className="space-y-2 w-full flex flex-col items-center">
        <div className="h-5 bg-slate-100 animate-pulse rounded-md w-2/3" />
        <div className="h-6 bg-slate-100 animate-pulse rounded-full w-1/2" />
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const { t, dir, language, translate } = useLanguage()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = () => {
    setLoading(true)
    setError(null)
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error(language === 'ar' ? 'فشل جلب الأقسام من السيرفر.' : 'Failed to retrieve categories from server.')
        return res.json()
      })
      .then(data => {
        setCategories(data)
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(language === 'ar' ? "حدث خطأ أثناء تحميل الأقسام. يرجى المحاولة مرة أخرى." : "An error occurred while loading categories. Please try again.")
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const isRtl = language === 'ar'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-24" dir={dir}>
        
        {/* Page Header */}
        <div className="bg-[#f0f7f4] border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-800 mb-2">{t('browse_sections')}</h1>
            <p className="text-sm text-gray-500 font-bold">
              {language === 'ar' 
                ? 'اكتشف مجموعتنا الواسعة من المكملات والمنتجات الصحية' 
                : 'Discover our wide range of premium health supplements and products'}
            </p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-12">
          {error ? (
            <div className="text-center py-16 bg-red-50/50 rounded-[2rem] border border-red-100 max-w-md mx-auto px-6">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
              <p className="text-red-700 font-bold text-sm mb-4 leading-relaxed">{error}</p>
              <button
                onClick={fetchCategories}
                className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-700/10 cursor-pointer"
              >
                {t('retry')}
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {categories.map((cat, i) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.id}`}
                  className="group bg-white border border-[#e8f0ed] rounded-2xl sm:rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 sm:hover:-translate-y-2 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]"
                >
                  {/* Background Decoration */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#f0f7f4] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col items-center gap-6 p-4 sm:p-8 w-full h-full">
                    {cat.image ? (
                      <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-[2rem] overflow-hidden shadow-sm transition-transform duration-500 group-hover:scale-110 bg-transparent flex items-center justify-center">
                        <img src={cat.image} alt={translate(cat.name)} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-36 sm:h-36 bg-[#f0f7f4] rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white shadow-sm transition-all duration-500">
                        <LayoutGrid size={40} />
                      </div>
                    )}
                    
                    <div className="text-center space-y-2 mt-auto">
                      <h3 className="text-sm sm:text-xl font-black text-gray-800 group-hover:text-primary transition-colors">{translate(cat.name)}</h3>
                      <div className="inline-block bg-gray-50 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        {language === 'ar' ? `${cat.count} منتج متوفر` : `${cat.count} products available`}
                      </div>
                    </div>

                    <div className={`flex items-center justify-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                      {language === 'ar' ? 'تصفح القسم' : 'Browse Section'} <ChevronLeft size={14} className={isRtl ? '' : 'rotate-180'} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
