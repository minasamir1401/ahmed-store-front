"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Percent, Clock, Tag, Flame, ArrowRight, ArrowLeft, Search, SlidersHorizontal, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { newestProducts } from '@/lib/product-display'
import { getProductUrlParam } from '@/lib/slug'
import SafeImage from '@/components/SafeImage'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden p-4 space-y-4 border border-slate-100 shadow-sm animate-pulse">
      <div className="aspect-square bg-slate-100 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded-md w-full" />
        <div className="h-3.5 bg-slate-100 rounded-md w-2/3" />
        <div className="h-4 bg-slate-100 rounded-md w-1/3" />
      </div>
      <div className="h-10 bg-slate-100 rounded-xl w-full" />
    </div>
  )
}

interface OffersPageClientProps {
  initialOffers?: any[]
  initialProducts?: any[]
}

export default function OffersPageClient({
  initialOffers = [],
  initialProducts = []
}: OffersPageClientProps) {
  const { t, dir, language, translate } = useLanguage()

  const [products, setProducts] = useState<any[]>(() => {
    const discounted = initialProducts.filter((p: any) => {
      const discountPercent = p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
      return (p.oldPrice && p.oldPrice > p.price) || (p.discountType && p.discountValue) || discountPercent > 0
    })
    return newestProducts(discounted)
  })

  const [offers, setOffers] = useState<any[]>(initialOffers)
  const [loading, setLoading] = useState(false)
  const [offersLoading, setOffersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('discount-desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 24, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchOffers = () => {
    setOffersLoading(true)
    fetch('/api/offers')
      .then(res => {
        if (!res.ok) throw new Error(language === 'ar' ? 'فشل تحميل العروض.' : 'Failed to load offers.')
        return res.json()
      })
      .then(data => {
        setOffers(Array.isArray(data) ? data : [])
        setOffersLoading(false)
      })
      .catch(err => {
        console.error('Error fetching offers:', err)
        setOffersLoading(false)
      })
  }

  const fetchProducts = () => {
    setLoading(true)
    setError(null)
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(language === 'ar' ? 'فشل تحميل المنتجات.' : 'Failed to load products.')
        return res.json()
      })
      .then(data => {
        const discounted = data.filter((p: any) => {
          const discountPercent = p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
          return (p.oldPrice && p.oldPrice > p.price) || (p.discountType && p.discountValue) || discountPercent > 0
        })
        const ordered = newestProducts(discounted)
        setProducts(ordered)
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(language === 'ar' ? "حدث خطأ في تحميل عروض المنتجات. يرجى المحاولة مرة أخرى." : "An error occurred while loading product offers. Please try again.")
        setLoading(false)
      })
  }

  const fetchAllData = () => {
    fetchOffers()
    fetchProducts()
  }

  useEffect(() => {
    if (initialOffers.length === 0 && initialProducts.length === 0) {
      queueMicrotask(() => fetchAllData())
    }
  }, [initialOffers.length, initialProducts.length])

  useEffect(() => {
    if (offers.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % offers.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [offers.length])

  const defaultOffers = [
    {
      id: 'default-1',
      title: language === 'ar' ? 'عروض وتخفيضات كبرى على الفيتامينات والمكملات الأصلية' : 'Grand Savings & Exclusive Deals on Authentic Supplements',
      discount: language === 'ar' ? 'خصومات تصل إلى 40%' : 'Up to 40% OFF',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      productId: ''
    }
  ]

  const activeOffers = offers.length > 0 ? offers : defaultOffers
  const isRtl = language === 'ar'

  // Filtering and Sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(p => {
        const titleAr = String(p.title || '').toLowerCase()
        const titleEn = String(p.titleEn || '').toLowerCase()
        return titleAr.includes(q) || titleEn.includes(q)
      })
    }

    // Category filter
    if (activeFilter === 'high-discount') {
      result = result.filter(p => {
        const discountPercent = p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
        return discountPercent >= 25
      })
    } else if (activeFilter === 'under-500') {
      result = result.filter(p => Number(p.price) < 500)
    } else if (activeFilter === 'best-sellers') {
      result = result.slice(0, Math.ceil(result.length / 2))
    }

    // Sorting
    result.sort((a, b) => {
      const discountA = a.oldPrice && a.price ? Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100) : 0
      const discountB = b.oldPrice && b.price ? Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100) : 0

      if (sortBy === 'discount-desc') return discountB - discountA
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price)
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price)
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      return 0
    })

    return result
  }, [products, searchQuery, activeFilter, sortBy])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8faf9] pb-24" dir={dir}>
        
        {/* Promotional Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a2318] to-slate-950 text-white py-12 sm:py-16 px-4 border-b border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-screen-xl mx-auto relative z-10">
            
            {/* Active Offer Slide */}
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Text Side */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 backdrop-blur-md">
                  <Flame size={15} className="text-red-400 animate-pulse" />
                  <span className="text-xs font-black tracking-wider uppercase">
                    {language === 'ar' ? 'عروض وتخفيضات حصرية لفترة محدودة' : 'Exclusive Limited-Time Discounts'}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {(() => {
                    const currentOffer = activeOffers[currentSlide % activeOffers.length]
                    const offerProduct = currentOffer.productId ? products.find((p: any) => p.id === currentOffer.productId) : null
                    const offerUrl = offerProduct ? `/product/${getProductUrlParam(offerProduct)}` : (currentOffer.productId ? `/product/${currentOffer.productId}` : '#')

                    return (
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
                          {translate(currentOffer.title)}
                        </h1>
                        <p className="text-slate-300 text-xs sm:text-sm md:text-base font-medium max-w-xl leading-relaxed">
                          {language === 'ar'
                            ? 'وفر الآن مع خصومات ذا فيتا هوب الحصرية على أجود أنواع المكملات الغذائية والفيتامينات العالمية الأصلية 100% مع ضمان تاريخ الصلاحية وسرعة التوصيل.'
                            : 'Save now with exclusive VitaHub discounts on premium certified vitamins and dietary supplements with guaranteed authenticity and express delivery.'}
                        </p>

                        {currentOffer.productId && (
                          <div className="pt-2">
                            <Link
                              href={offerUrl}
                              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <span>{language === 'ar' ? 'تسوق هذا العرض الآن' : 'Shop this deal now'}</span>
                              <Sparkles size={16} />
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )
                  })()}
                </AnimatePresence>

                {/* Countdown Timer Block */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <Clock size={16} className="text-red-400 shrink-0" />
                    <span>{language === 'ar' ? 'ينتهي العرض الاستثنائي خلال:' : 'Offer expires in:'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2" dir="ltr">
                    {[
                      { label: language === 'ar' ? 'ساعة' : 'Hrs', value: timeLeft.hours },
                      { label: language === 'ar' ? 'دقيقة' : 'Mins', value: timeLeft.minutes },
                      { label: language === 'ar' ? 'ثانية' : 'Secs', value: timeLeft.seconds }
                    ].map((unit, idx) => (
                      <div key={idx} className="flex items-center">
                        {idx > 0 && <span className="text-emerald-400 font-black text-lg mx-1 animate-pulse">:</span>}
                        <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl px-3 py-2 min-w-[58px] text-center shadow-lg">
                          <span className="block text-base sm:text-xl font-black font-mono text-emerald-400 leading-none">
                            {String(unit.value).padStart(2, '0')}
                          </span>
                          <span className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {unit.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Graphic Display Side */}
              <div className="lg:col-span-5 flex items-center justify-center">
                {(() => {
                  const currentOffer = activeOffers[currentSlide % activeOffers.length]
                  const defaultOfferImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'
                  const offerImg = currentOffer.image || defaultOfferImg

                  return (
                    <div className="relative w-full max-w-sm aspect-square">
                      <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/15 backdrop-blur-md p-6 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                        <SafeImage
                          src={offerImg}
                          alt={currentOffer.title || ''}
                          fill
                          className="object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 300px, 400px"
                        />
                        {currentOffer.discount && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg border border-red-500/50">
                            {currentOffer.discount}
                          </div>
                        )}
                      </div>

                      {/* Bullet Indicators */}
                      {activeOffers.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {activeOffers.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                currentSlide % activeOffers.length === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

            </div>

          </div>
        </section>

        {/* Filter & Control Bar */}
        <section className="max-w-screen-xl mx-auto px-4 py-8">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-5">
            
            {/* Upper controls: Title, Count, Search, Sort */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">
                    {language === 'ar' ? 'منتجات العروض والتخفيضات' : 'Discounted Products & Deals'}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    {language === 'ar' 
                      ? `${filteredAndSortedProducts.length} منتج مخفض متاح حالياً`
                      : `${filteredAndSortedProducts.length} discounted products available`}
                  </p>
                </div>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Instant Product Search */}
                <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 h-11 min-w-[240px]">
                  <Search size={16} className={`text-slate-400 shrink-0 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث في العروض...' : 'Search within offers...'}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                      {language === 'ar' ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 h-11">
                  <SlidersHorizontal size={15} className={`text-slate-400 shrink-0 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="discount-desc">{language === 'ar' ? 'الأعلى خصماً' : 'Highest Discount'}</option>
                    <option value="price-asc">{language === 'ar' ? 'الأقل سعراً' : 'Price: Low to High'}</option>
                    <option value="price-desc">{language === 'ar' ? 'الأعلى سعراً' : 'Price: High to Low'}</option>
                    <option value="newest">{language === 'ar' ? 'الأحدث أولاً' : 'Newest First'}</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Filter Tabs Row */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: language === 'ar' ? 'كل العروض' : 'All Offers' },
                { id: 'high-discount', label: language === 'ar' ? 'خصومات 25% فأكثر' : 'Discounts 25%+ ' },
                { id: 'under-500', label: language === 'ar' ? 'أقل من 500 ج.م' : 'Under 500 EGP' },
                { id: 'best-sellers', label: language === 'ar' ? 'الأكثر طلباً' : 'Best Sellers' }
              ].map(tab => {
                const isActive = activeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

          </div>

        </section>

        {/* Discounted Products Grid */}
        <section className="max-w-screen-xl mx-auto px-4">
          
          {error ? (
            <div className="text-center py-16 bg-red-50/70 rounded-3xl border border-red-100 max-w-md mx-auto px-6 space-y-4">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto font-bold text-lg">!</div>
              <p className="text-red-700 font-bold text-sm leading-relaxed">{error}</p>
              <button
                onClick={fetchAllData}
                className="bg-primary text-white px-8 py-2.5 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={14} />
                <span>{t('retry')}</span>
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
            >
              {filteredAndSortedProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto px-6 space-y-4"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                <Percent size={28} />
              </div>
              <h3 className="text-base font-black text-slate-800">
                {language === 'ar' ? 'لا توجد عروض مطابقة' : 'No matching offers found'}
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                {language === 'ar'
                  ? 'لم نجد أي منتجات تطابق خيارات التصفية أو البحث الحالية. جرب تغيير الفلتر أو البحث.'
                  : 'We could not find any products matching your current search or filter options.'}
              </p>
              <button
                onClick={() => {
                  setActiveFilter('all')
                  setSearchQuery('')
                  setSortBy('discount-desc')
                }}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إعادة ضبط التصفية' : 'Reset Filters'}
              </button>
            </motion.div>
          )}

        </section>

      </main>
      <Footer />
    </>
  )
}
