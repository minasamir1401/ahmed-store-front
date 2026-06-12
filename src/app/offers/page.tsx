"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Percent, Clock, Loader2, Tag, Sparkles, Flame, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden p-3 space-y-3" style={{ border: '1px solid #e8f0ed' }}>
      <div className="aspect-square bg-slate-100 animate-pulse rounded-xl" />
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-100 animate-pulse rounded-md w-full" />
        <div className="h-3 bg-slate-100 animate-pulse rounded-md w-2/3" />
        <div className="h-3.5 bg-slate-100 animate-pulse rounded-md w-1/3" />
      </div>
      <div className="h-9 bg-slate-100 animate-pulse rounded-xl w-full" />
    </div>
  )
}

export default function OffersPage() {
  const { t, dir, language, translate } = useLanguage()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')

  // Offers Slider states
  const [offers, setOffers] = useState<any[]>([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Stateful countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 59 })

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

  useEffect(() => {
    document.title = t('offers_title')
  }, [language, t])

  const fetchOffers = () => {
    setOffersLoading(true)
    setError(null)
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
        setError(language === 'ar' ? "عذراً، حدث خطأ أثناء تحميل العروض الحصرية." : "Sorry, an error occurred while loading exclusive offers.")
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
        // Filter products that have a discount
        const discounted = data.filter((p: any) => {
          const discountPercent = p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
          return (p.oldPrice && p.oldPrice > p.price) || (p.discountType && p.discountValue) || discountPercent > 0
        })
        setProducts(discounted)
        setFilteredProducts(discounted)
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
    fetchAllData()
  }, [])

  useEffect(() => {
    if (offers.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % offers.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [offers])

  // Stateful filtering logic
  useEffect(() => {
    let result = [...products]
    if (activeFilter === 'high-discount') {
      result = result.filter(p => {
        const discountPercent = p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
        return discountPercent >= 25
      })
    } else if (activeFilter === 'under-500') {
      result = result.filter(p => p.price < 500)
    } else if (activeFilter === 'best-sellers') {
      // Simulate best sellers by taking products with high ratings/reviews
      result = result.slice(0, Math.ceil(products.length / 2))
    }
    setFilteredProducts(result)
  }, [activeFilter, products])

  const defaultOffers = [
    {
      id: 'default-1',
      title: language === 'ar' ? 'عروض حصرية بأسعار استثنائية للفيتامينات والمكملات الغذائية' : 'Exclusive offers at exceptional prices for vitamins and supplements',
      discount: language === 'ar' ? 'خصم 50%' : '50% OFF',
      image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80',
      productId: ''
    }
  ]

  const activeOffers = offers.length > 0 ? offers : defaultOffers

  return (
    <>
      <Header />
      <main className="min-h-screen pb-24 bg-[#f8faf9] relative overflow-hidden" dir={dir}>
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef2f0_1px,transparent_1px),linear-gradient(to_bottom,#eef2f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-red-100/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-12 relative z-10">

          {/* Mature Premium Hero Section Card - Dynamic Animated Slider */}
          <section className="mb-12 relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-[#10241b] to-slate-900 min-h-[380px] lg:min-h-[450px]">
            {/* Card Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {offersLoading ? (
                <div key="loading" className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-emerald-400" size={36} />
                  <span className="text-xs font-bold text-slate-400">
                    {language === 'ar' ? 'جاري تحميل العروض الحصرية...' : 'Loading exclusive offers...'}
                  </span>
                </div>
              ) : (
                (() => {
                  const currentOffer = activeOffers[currentSlide % activeOffers.length];
                  return (
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-6 sm:p-12 relative z-10"
                    >
                      {/* Text Info */}
                      <div className={`flex-1 space-y-6 order-2 lg:order-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-md">
                          <Flame size={14} className="animate-pulse" />
                          <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase">
                            {language === 'ar' ? 'حملة الخصومات الكبرى لشهر يونيو' : 'Grand June Discount Campaign'}
                          </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black leading-tight tracking-tight text-white max-w-2xl">
                          {translate(currentOffer.title)}
                        </h1>
                        
                        <p className="text-slate-400 font-medium text-xs sm:text-base max-w-xl leading-relaxed">
                          {language === 'ar'
                            ? 'احصل على أفضل الفيتامينات والمكملات الغذائية الأصلية 100% المستوردة بخصومات هائلة. كل المنتجات مرخصة وتأتي مع ضمان الجودة والأصالة.'
                            : 'Get the best 100% original imported dietary supplements and vitamins at massive discounts. All products are certified and come with quality and authenticity guarantees.'}
                        </p>

                        {/* Highly Mature Countdown Box */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                            <Clock size={16} className="animate-spin-slow shrink-0" />
                            <span>
                              {language === 'ar' ? 'تنتهي أقوى الخصومات خلال:' : 'Strongest discounts expire in:'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 max-[340px]:gap-1" dir="ltr">
                            {[
                              { label: language === 'ar' ? 'ساعة' : 'Hrs', value: timeLeft.hours },
                              { label: language === 'ar' ? 'دقيقة' : 'Mins', value: timeLeft.minutes },
                              { label: language === 'ar' ? 'ثانية' : 'Secs', value: timeLeft.seconds }
                            ].map((unit, idx) => (
                              <div key={idx} className="flex items-center">
                                {idx > 0 && <span className="text-emerald-400 font-black text-lg mx-1 animate-pulse">:</span>}
                                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-2 min-w-[56px] text-center shadow-lg">
                                  <span className="block text-base sm:text-xl font-black font-mono text-emerald-400 leading-none">
                                    {String(unit.value).padStart(2, '0')}
                                  </span>
                                  <span className="block text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                    {unit.label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action button inside slide */}
                        {currentOffer.productId && (
                          <div className="pt-4">
                            <Link href={`/product/${currentOffer.productId}`} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                              {language === 'ar' ? 'تسوق هذا المنتج الآن' : 'Shop this product now'} <Sparkles size={16} className="animate-pulse" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Graphic Display Side */}
                      <div className="relative order-1 lg:order-2 max-w-[280px] sm:max-w-xs w-full shrink-0 z-10">
                        {currentOffer.productId ? (
                          <Link href={`/product/${currentOffer.productId}`} className="block relative group/img cursor-pointer">
                            <div className="aspect-square bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-white/5 rounded-[3rem] p-6 sm:p-8 flex items-center justify-center shadow-2xl relative">
                              <div className="bg-white p-3 sm:p-4 rounded-[2.5rem] shadow-2xl rotate-3 relative z-10 transition-transform duration-500 group-hover/img:rotate-0 w-full aspect-square">
                                <img 
                                  src={currentOffer.image} 
                                  className="w-full h-full object-cover rounded-[2rem] aspect-square" 
                                  alt={currentOffer.title}
                                />
                              </div>
                              
                              <div className="absolute -bottom-4 -right-4 bg-red-500 text-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-xl -rotate-6 border-4 border-slate-900 z-20 font-black min-w-[95px]">
                                <span className="text-xs sm:text-sm font-black leading-none">{currentOffer.discount}</span>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-white/5 rounded-[3rem] p-6 sm:p-8 flex items-center justify-center shadow-2xl relative">
                            <div className="bg-white p-3 sm:p-4 rounded-[2.5rem] shadow-2xl rotate-3 relative z-10 transition-transform duration-500 group-hover:rotate-0 w-full aspect-square">
                              <img 
                                src={currentOffer.image} 
                                className="w-full h-full object-cover rounded-[2rem] aspect-square" 
                                alt={currentOffer.title}
                              />
                            </div>
                            
                            <div className="absolute -bottom-4 -right-4 bg-red-500 text-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-xl -rotate-6 border-4 border-slate-900 z-20 font-black min-w-[95px]">
                              <span className="text-xs sm:text-sm font-black leading-none">{currentOffer.discount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })()
              )}
            </AnimatePresence>

            {/* Navigation Controls */}
            {!offersLoading && activeOffers.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev - 1 + activeOffers.length) % activeOffers.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-full shadow-2xl z-20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer hidden sm:block"
                >
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev + 1) % activeOffers.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-full shadow-2xl z-20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer hidden sm:block"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Bullet Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  {activeOffers.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide % activeOffers.length === idx 
                          ? 'w-6 bg-emerald-400' 
                          : 'w-2 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Mature Filter Sorting Bar */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20">
                  <Tag size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                    {language === 'ar' ? 'منتجات بأسعار استثنائية' : 'Products at Exceptional Prices'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold">
                    {language === 'ar' ? 'تسوق عروض التوفير الأقوى المتاحة حالياً' : 'Shop the strongest saving offers available now'}
                  </p>
                </div>
              </div>

              {/* Stateful Filters Row */}
              <div className="flex flex-wrap gap-2 no-scrollbar overflow-x-auto py-1">
                {[
                  { id: 'all', label: language === 'ar' ? 'كل العروض' : 'All Offers' },
                  { id: 'high-discount', label: language === 'ar' ? 'خصومات 25% فما فوق 🔥' : 'Discounts 25% & Above 🔥' },
                  { id: 'under-500', label: language === 'ar' ? 'أقل من 500 ج.م' : 'Under 500 EGP' },
                  { id: 'best-sellers', label: language === 'ar' ? 'الأكثر طلباً' : 'Best Sellers' }
                ].map(tab => {
                  const isActive = activeFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border-2 ${
                        isActive
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/10 scale-[1.02]'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-primary/20 hover:text-slate-800'
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
          <section>
            {error ? (
              <div className="text-center py-16 bg-red-50/50 rounded-[2rem] border border-red-100 max-w-md mx-auto px-6 relative z-20">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
                <p className="text-red-700 font-bold text-sm mb-4 leading-relaxed">{error}</p>
                <button
                  onClick={fetchAllData}
                  className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-700/10 cursor-pointer"
                >
                  {t('retry')}
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        layout
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35 }}
                      >
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-slate-100 shadow-xl max-w-lg mx-auto"
                  >
                    <div className="bg-red-50 text-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                      <Percent size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">
                      {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                      {language === 'ar'
                        ? 'لم نجد عروضاً تطابق الفلتر المختار حالياً. جرب اختيار فلتر آخر.'
                        : 'We did not find any offers matching the selected filter currently. Try choosing another filter.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
