"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { LayoutGrid, ChevronLeft, Search, Sparkles, ShieldCheck, Truck, RefreshCw, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import SafeImage from '@/components/SafeImage'

function CategorySkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center gap-5 shadow-sm animate-pulse">
      <div className="w-28 h-28 bg-slate-100 rounded-2xl" />
      <div className="space-y-2 w-full flex flex-col items-center">
        <div className="h-5 bg-slate-100 rounded-md w-3/4" />
        <div className="h-4 bg-slate-100 rounded-full w-1/3" />
      </div>
    </div>
  )
}

interface CategoriesPageClientProps {
  initialCategories?: any[]
}

export default function CategoriesPageClient({ initialCategories = [] }: CategoriesPageClientProps) {
  const { t, dir, language, translate } = useLanguage()
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCategories = () => {
    setLoading(true)
    setError(null)
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error(language === 'ar' ? 'فشل جلب الأقسام من السيرفر.' : 'Failed to retrieve categories from server.')
        return res.json()
      })
      .then(data => {
        setCategories(Array.isArray(data) ? data : [])
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
    if (initialCategories.length === 0) {
      queueMicrotask(() => fetchCategories())
    }
  }, [initialCategories.length])

  const isRtl = language === 'ar'

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase().trim()
    return categories.filter(cat => {
      const nameAr = String(cat.name || '').toLowerCase()
      const nameEn = String(cat.nameEn || '').toLowerCase()
      return nameAr.includes(q) || nameEn.includes(q)
    })
  }, [categories, searchQuery])

  const totalProductsCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (Number(cat.count) || 0), 0)
  }, [categories])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50/50 pb-24" dir={dir}>
        
        {/* Hero Header Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-[#0a2318] to-slate-950 text-white py-14 sm:py-20 px-4 border-b border-white/10 shadow-xl">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-screen-xl mx-auto text-center space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-300"
            >
              <Layers size={14} />
              <span>{language === 'ar' ? 'دليل الأقسام الشامل' : 'Complete Category Directory'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
            >
              {language === 'ar' ? (
                <>تصفح أقسام <span className="text-emerald-400">ذا فيتا هوب</span></>
              ) : (
                <>Explore <span className="text-emerald-400">The VitaHub</span> Categories</>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              {language === 'ar'
                ? 'تشكيلة مختارة من المكملات الغذائية، الفيتامينات الأصلية 100%، البروتينات، وحوارق الدهون من أشهر الماركات العالمية المعتمدة.'
                : 'A curated selection of 100% authentic dietary supplements, vitamins, proteins, and wellness formulas from leading global certified brands.'}
            </motion.p>

            {/* Instant Category Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl mx-auto pt-4"
            >
              <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl focus-within:ring-4 focus-within:ring-emerald-500/30 transition-all">
                <Search size={20} className={`text-slate-300 mx-4 shrink-0 ${isRtl ? '' : 'order-1'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن قسم معين (مثل: فيتامينات، بروتين، كولاجين...)' : 'Search categories (e.g., Vitamins, Protein, Collagen...)'}
                  className={`w-full h-14 bg-transparent text-white placeholder-slate-400 font-bold text-sm outline-none px-2 ${isRtl ? 'text-right' : 'text-left order-2'}`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`text-xs font-bold text-slate-300 hover:text-white px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all mx-2 ${isRtl ? '' : 'order-3'}`}
                  >
                    {language === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Highlights Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-300"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>{language === 'ar' ? 'منتجات أصلية ومضمونة 100%' : '100% Guaranteed Authentic'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-emerald-400" />
                <span>{language === 'ar' ? 'شحن سريع لجميع المحافظات' : 'Fast Nationwide Shipping'}</span>
              </div>
              <div className="flex items-center gap-2">
                <LayoutGrid size={16} className="text-emerald-400" />
                <span>{language === 'ar' ? `${categories.length} أقسام رئيسية` : `${categories.length} Main Categories`}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid Area */}
        <section className="max-w-screen-xl mx-auto px-4 py-12">
          
          {/* Top Bar with Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  {language === 'ar' ? 'جميع الأقسام والتصنيفات' : 'All Categories & Sections'}
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  {language === 'ar' 
                    ? `إجمالي ${filteredCategories.length} قسم متاح (${totalProductsCount} منتج)`
                    : `${filteredCategories.length} categories available (${totalProductsCount} products)`}
                </p>
              </div>
            </div>

            {searchQuery && (
              <div className="text-xs font-bold text-slate-500 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                {language === 'ar' ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
              </div>
            )}
          </div>

          {/* Error State */}
          {error ? (
            <div className="text-center py-16 bg-red-50/70 rounded-3xl border border-red-100 max-w-md mx-auto px-6">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
              <p className="text-red-700 font-bold text-sm mb-4 leading-relaxed">{error}</p>
              <button
                onClick={fetchCategories}
                className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-700/10 cursor-pointer flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={14} />
                <span>{t('retry')}</span>
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredCategories.map((cat, idx) => {
                const title = language === 'en' ? (cat.nameEn || translate(cat.name)) : cat.name
                const count = cat.count ?? 0
                const defaultImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'

                return (
                  <motion.div
                    key={cat.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * idx, duration: 0.4 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group"
                  >
                    <Link
                      href={`/products?category=${cat.id}`}
                      className="flex flex-col h-full bg-white border border-slate-100 hover:border-emerald-200 rounded-3xl p-5 sm:p-7 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 relative overflow-hidden"
                    >
                      {/* Top Corner Subtle Badge */}
                      <div className="flex items-center justify-between w-full mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {language === 'ar' ? `${count} منتج` : `${count} Products`}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <ChevronLeft size={16} className={isRtl ? 'group-hover:-translate-x-0.5 transition-transform' : 'rotate-180 group-hover:translate-x-0.5 transition-transform'} />
                        </div>
                      </div>

                      {/* Image Frame */}
                      <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 mb-4 p-4 flex items-center justify-center">
                        <SafeImage
                          src={cat.image || defaultImg}
                          alt={title}
                          fill
                          className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                        />
                      </div>

                      {/* Content */}
                      <div className="text-center mt-auto space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {title}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 line-clamp-1">
                          {language === 'ar' ? 'استكشف المنتجات الأصلية' : 'Explore genuine products'}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto px-6 space-y-4"
            >
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Search size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800">
                {language === 'ar' ? 'لم نجد أي قسم يطابق بحثك' : 'No categories match your search'}
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                {language === 'ar' ? 'جرب البحث بكلمات أخرى أو عرض جميع الأقسام.' : 'Try different keywords or view all categories.'}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                {language === 'ar' ? 'عرض جميع الأقسام' : 'Show All Categories'}
              </button>
            </motion.div>
          )}

        </section>

      </main>
      <Footer />
    </>
  )
}
