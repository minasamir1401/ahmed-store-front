"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Loader2, Calendar, Clock, ChevronLeft } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function Home() {
  const { t, language, translate, dir } = useLanguage()
  const [products, setProducts] = useState<any[]>([])
  const [hero, setHero] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [siteUrl, setSiteUrl] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteUrl(window.location.origin)
    }
  }, [])

  // Safe parsing of slides list from hero data
  const slides = React.useMemo(() => {
    if (!hero || !hero.slides) return [];
    try {
      const parsed = JSON.parse(hero.slides);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse hero slides:", e);
    }
    return [];
  }, [hero]);

  // Autoplay slider interval
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const loadData = () => {
    setLoading(true)
    setError(null)

    const fetchJson = async (url: string) => {
      const res = await fetch(url)
      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const body = isJson ? await res.json() : await res.text()

      if (!res.ok) {
        const message = isJson
          ? body?.error || body?.message
          : `Request failed with status ${res.status}`
        throw new Error(message || 'Unexpected API error')
      }

      return body
    }

    Promise.all([
      fetchJson('/api/products'),
      fetchJson('/api/hero'),
      fetchJson('/api/categories'),
      fetchJson('/api/medical-tips').catch(err => {
        console.error("Failed to load articles:", err)
        return []
      })
    ])
      .then(([productsData, heroData, categoriesData, articlesData]) => {
        setProducts(productsData.slice(0, 6))
        setHero(heroData)
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setAllProducts(Array.isArray(productsData) ? productsData : [])
        setArticles(Array.isArray(articlesData) ? articlesData.slice(0, 3) : [])
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(language === 'ar' 
          ? "عذراً، فشل تحميل المنتجات والبيانات. يرجى التأكد من اتصالك بالشبكة وإعادة المحاولة."
          : "Sorry, failed to load products and data. Please check your connection and try again."
        )
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const features = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      title: t('feature_shipping_title'),
      sub: t('feature_shipping_desc'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      title: t('feature_returns_title'),
      sub: t('feature_returns_desc'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      title: t('feature_quality_title'),
      sub: t('feature_quality_desc'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.67 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.57 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 7 7l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 16.92z"/></svg>,
      title: t('feature_support_title'),
      sub: t('feature_support_desc'),
    },
  ]

  return (
    <>
      <Header />

      {/* JSON-LD Structured Data Schema for LocalBusiness & WebSite */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            "url": `${siteUrl}/`,
            "name": "Vitamins HUB",
            "description": language === 'ar' ? "متجر المكملات الغذائية والفيتامينات الأصلي الأول في مصر" : "The premier authentic food supplements and vitamins store in Egypt",
            "publisher": {
              "@id": `${siteUrl}/#organization`
            },
            "potentialAction": [
              {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${siteUrl}/products?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            ],
            "inLanguage": language
          },
          {
            "@type": "Store",
            "@id": `${siteUrl}/#organization`,
            "name": "Vitamins HUB Egypt",
            "url": `${siteUrl}/`,
            "logo": `${siteUrl}/logo-v2.png`,
            "image": `${siteUrl}/logo-v2.png`,
            "description": language === 'ar' 
              ? "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع Vitamins HUB."
              : "Shop the best 100% original food supplements, vitamins, proteins, fat burners, and weight loss products in Egypt with Vitamins HUB.",
            "telephone": "+201001234567",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": language === 'ar' ? "شبرا، القاهرة" : "Shubra, Cairo",
              "addressLocality": language === 'ar' ? "القاهرة" : "Cairo",
              "addressRegion": language === 'ar' ? "القاهرة" : "Cairo",
              "postalCode": "11511",
              "addressCountry": "EG"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 30.0444,
              "longitude": 31.2357
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "00:00",
              "closes": "23:59"
            },
            "sameAs": [
              "https://www.facebook.com/vitaminshub",
              "https://www.instagram.com/vitaminshub",
              "https://twitter.com/vitaminshub"
            ]
          }
        ]
      }) }} />
      <main className="flex-1 pb-20 md:pb-0 bg-white relative overflow-hidden w-full">
        
        {/* Elite Ambient Glow Circles */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-100 rounded-full blur-[110px] opacity-40 pointer-events-none animate-pulse-glow" />
        <div className="absolute top-[400px] left-10 w-96 h-96 bg-amber-100 rounded-full blur-[110px] opacity-30 pointer-events-none animate-pulse-glow" />

        {/* Hero Section */}
        <section className="bg-transparent pt-4 pb-6 relative z-10">
          <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-2 rounded-2xl sm:rounded-[2.5rem] overflow-hidden relative shadow-md hover-shine border border-slate-100 glow-primary-hover min-h-[200px] xs:min-h-[260px] sm:min-h-[340px] lg:min-h-[440px]"
                style={{ background: '#e8f5f0' }}
              >
                {!hero ? (
                  <div className={`absolute inset-0 bg-slate-100/80 animate-pulse flex items-center ${language === 'ar' ? 'pr-6 xs:pr-8 md:pr-16' : 'pl-6 xs:pl-8 md:pl-16'}`}>
                    <div className="space-y-3 w-full max-w-md">
                      <div className="h-6 xs:h-8 md:h-12 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
                      <div className="h-3 xs:h-4 bg-slate-200 rounded-xl w-1/2 animate-pulse" />
                      <div className="h-8 xs:h-10 bg-slate-200 rounded-xl w-28 mt-4 animate-pulse" />
                    </div>
                  </div>
                ) : slides.length > 0 ? (
                  <div className="absolute inset-0 w-full h-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center w-full h-full"
                      >
                        <div className={`absolute top-1/2 -translate-y-1/2 z-10 max-w-[160px] xs:max-w-xs sm:max-w-md md:max-w-lg ${
                          language === 'ar' 
                            ? 'right-4 xs:right-8 md:right-16 text-right' 
                            : 'left-4 xs:left-8 md:left-16 text-left'
                        }`}>
                          <motion.h1 
                            initial={{ opacity: 0, x: dir === 'rtl' ? 40 : -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-lg xs:text-2xl sm:text-3xl md:text-5xl font-black text-slate-800 mb-1.5 sm:mb-3 leading-tight"
                          >
                            {translate(slides[currentSlide].title)}
                          </motion.h1>
                          <motion.p 
                            initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-[9px] xs:text-xs md:text-sm font-bold text-slate-600 mb-4 sm:mb-8 leading-relaxed"
                          >
                            {translate(slides[currentSlide].subtitle)}
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                          >
                            <Link href={slides[currentSlide].buttonLink || '/products'} className="inline-block px-5 py-2.5 sm:px-10 sm:py-4 text-white rounded-2xl text-[9px] xs:text-xs font-black bg-primary hover:bg-[#235f47] transition-all hover:scale-105 shadow-lg shadow-emerald-700/10 cursor-pointer glow-primary">
                              {translate(slides[currentSlide].buttonText) || (language === 'ar' ? 'تسوق الآن' : 'Shop Now')}
                            </Link>
                          </motion.div>
                        </div>
                        
                        <img 
                          src={slides[currentSlide].image || 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=80'} 
                          className="w-full h-full object-cover" 
                          alt="Hero"
                        />
                        <div className={`absolute inset-0 z-1 ${
                          language === 'ar'
                            ? 'bg-gradient-to-l from-[#e8f5f0]/95 via-[#e8f5f0]/50 to-transparent'
                            : 'bg-gradient-to-r from-[#e8f5f0]/95 via-[#e8f5f0]/50 to-transparent'
                        }`} />
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Dots */}
                    {slides.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-2 rounded-full transition-all duration-350 cursor-pointer ${
                              currentSlide === i ? 'bg-primary w-6' : 'bg-slate-300 w-2 hover:bg-slate-400'
                            }`}
                            aria-label={`Slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center">
                    <div className={`absolute top-1/2 -translate-y-1/2 z-10 max-w-[160px] xs:max-w-xs sm:max-w-md md:max-w-lg ${
                      language === 'ar' 
                        ? 'right-4 xs:right-8 md:right-16 text-right' 
                        : 'left-4 xs:left-8 md:left-16 text-left'
                    }`}>
                      <motion.h1 
                        initial={{ opacity: 0, x: dir === 'rtl' ? 40 : -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-lg xs:text-2xl sm:text-3xl md:text-5xl font-black text-slate-800 mb-1.5 sm:mb-3 leading-tight"
                      >
                        {translate(hero.title)}
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-[9px] xs:text-xs md:text-sm font-bold text-slate-600 mb-4 sm:mb-8 leading-relaxed"
                      >
                        {translate(hero.subtitle)}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <Link href={hero.buttonLink} className="inline-block px-5 py-2.5 sm:px-10 sm:py-4 text-white rounded-2xl text-[9px] xs:text-xs font-black bg-primary hover:bg-[#235f47] transition-all hover:scale-105 shadow-lg shadow-emerald-700/10 cursor-pointer glow-primary">
                          {translate(hero.buttonText)}
                        </Link>
                      </motion.div>
                    </div>
                    
                    <motion.img 
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                      src={hero.image} 
                      className="w-full h-full object-cover" 
                      alt="Hero"
                    />
                    <div className={`absolute inset-0 z-1 ${
                      language === 'ar'
                        ? 'bg-gradient-to-l from-[#e8f5f0]/95 via-[#e8f5f0]/50 to-transparent'
                        : 'bg-gradient-to-r from-[#e8f5f0]/95 via-[#e8f5f0]/50 to-transparent'
                    }`} />
                  </div>
                )}
              </motion.div>

              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4 sm:gap-6 min-h-[110px] xs:min-h-[140px] sm:min-h-[180px] lg:min-h-0">
                <motion.div
                  initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex-1"
                >
                  <Link href={hero?.side1Link || '/categories'} className="h-full w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative flex items-center bg-[#f0f7f4] border border-slate-100/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group block">
                    {!hero ? <div className="absolute inset-0 bg-slate-100 animate-pulse" /> : (
                      <>
                        <img src={hero.side1Image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" alt="Categories Banner" />
                        <div className={`relative z-10 p-4 sm:p-6 w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h3 className={`text-xs xs:text-sm sm:text-lg font-black text-slate-800 ${
                            language === 'ar' 
                              ? 'border-r-[3px] sm:border-r-4 border-emerald-500 pr-1.5 sm:pr-3' 
                              : 'border-l-[3px] sm:border-l-4 border-emerald-500 pl-1.5 sm:pl-3'
                          }`}>{translate(hero.side1Title)}</h3>
                          <p className={`text-[8px] xs:text-[10px] sm:text-xs text-slate-600 font-bold mt-1 sm:mt-2 ${
                            language === 'ar' ? 'pr-2.5 sm:pr-4' : 'pl-2.5 sm:pl-4'
                          }`}>{translate(hero.side1Desc)}</p>
                        </div>
                      </>
                    )}
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex-1"
                >
                  <Link href={hero?.side2Link || '/offers'} className="h-full w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative flex items-center bg-[#faf5f0] border border-slate-100/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group block">
                    {!hero ? <div className="absolute inset-0 bg-slate-100 animate-pulse" /> : (
                      <>
                        <img src={hero.side2Image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" alt="Offers Banner" />
                        <div className={`relative z-10 p-4 sm:p-6 w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h3 className={`text-xs xs:text-sm sm:text-lg font-black text-slate-800 ${
                            language === 'ar' 
                              ? 'border-r-[3px] sm:border-r-4 border-amber-500 pr-1.5 sm:pr-3' 
                              : 'border-l-[3px] sm:border-l-4 border-amber-500 pl-1.5 sm:pl-3'
                          }`}>{translate(hero.side2Title)}</h3>
                          <p className={`text-[8px] xs:text-[10px] sm:text-xs text-slate-600 font-bold mt-1 sm:mt-2 ${
                            language === 'ar' ? 'pr-2.5 sm:pr-4' : 'pl-2.5 sm:pl-4'
                          }`}>{translate(hero.side2Desc)}</p>
                        </div>
                      </>
                    )}
                  </Link>
                </motion.div>
              </div>

            </div>

            {/* Featured Products/Categories (4 cards) */}
            {hero && (hero.prod1Id || hero.prod2Id || hero.prod3Id || hero.prod4Id || hero.prod1Image || hero.prod2Image || hero.prod3Image || hero.prod4Image) && (
              <div className="mt-8 border-t border-slate-100/50 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t('featured_products_categories')}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { id: hero.prod1Id, img: hero.prod1Image, type: hero.prod1Type || 'product' },
                    { id: hero.prod2Id, img: hero.prod2Image, type: hero.prod2Type || 'product' },
                    { id: hero.prod3Id, img: hero.prod3Image, type: hero.prod3Type || 'product' },
                    { id: hero.prod4Id, img: hero.prod4Image, type: hero.prod4Type || 'product' }
                  ].map((item, idx) => {
                    if (!item.id && !item.img) return null;
                    
                    let title = language === 'ar' ? 'عنصر مميز' : 'Featured Item';
                    let defaultImg = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300';
                    let href = '#';
                    
                    if (item.id) {
                      if (item.type === 'category') {
                        const catObj = categories.find(c => c.id === item.id);
                        if (catObj) {
                          title = language === 'en' ? (catObj.nameEn || translate(catObj.name)) : catObj.name;
                          defaultImg = catObj.image || defaultImg;
                          href = `/products?category=${item.id}`;
                        }
                      } else {
                        const prodObj = allProducts.find(p => p.id === item.id);
                        if (prodObj) {
                          title = translate(prodObj.title);
                          defaultImg = prodObj.image || defaultImg;
                          href = `/product/${item.id}`;
                        }
                      }
                    }
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx, duration: 0.5 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="relative rounded-3xl overflow-hidden aspect-[4/3] group shadow-sm hover:shadow-md border border-slate-100 transition-all cursor-pointer bg-slate-50"
                      >
                        <Link href={href} className="relative flex flex-col items-center justify-end w-full h-full p-4 gap-2 sm:gap-3 group overflow-hidden">
                          {/* Image filling the card */}
                          <div className="absolute inset-0 w-full h-full">
                            <img 
                              src={item.img || defaultImg}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              alt={title}
                            />
                            {/* Dark gradient overlay so text is readable */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Text overlaid on top */}
                          <div className="text-center relative z-10 mt-auto flex flex-col items-center">
                            {item.id && (
                              <span className="block text-white text-[11px] sm:text-sm font-black tracking-wide line-clamp-1 mb-1.5 drop-shadow-md">
                                {title}
                              </span>
                            )}
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase text-white bg-primary/80 backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-300 group-hover:bg-primary">
                              {item.type === 'category' ? t('category') : t('product')}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Newly Added Products Section */}
        <section className="py-10 sm:py-20 bg-white relative z-10">
          <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-14"
            >
              <div className="h-px flex-1 bg-slate-100" />
              <span className="flex items-center gap-2 text-2xl font-black text-slate-800 italic uppercase tracking-wider">{t('newly_added')}</span>
              <div className="h-px flex-1 bg-slate-100" />
            </motion.div>

            {error ? (
              <div className="text-center py-16 bg-red-50/50 rounded-[2rem] border border-red-100 max-w-md mx-auto px-6 relative z-20">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
                <p className="text-red-700 font-bold text-sm mb-4 leading-relaxed">{error}</p>
                <button
                  onClick={loadData}
                  className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-700/10 cursor-pointer"
                >
                  {t('retry')}
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.06
                    }
                  }
                }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
              >
                {products.map((p) => (
                  <motion.div 
                    key={p.id}
                    variants={{
                      hidden: { opacity: 0, y: 35 },
                      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                    }}
                  >
                    <ProductCard {...p} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-20 text-center"
            >
              <Link href="/products" className="inline-flex items-center gap-2 px-12 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-xs shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
                {t('view_all_products')}
                <svg className={`transition-transform duration-300 ${language === 'en' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Articles / Health Tips Section */}
        {articles.length > 0 && (
          <section className="py-12 sm:py-24 bg-white relative z-10 border-t border-slate-100/50">
            <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center gap-3 mb-14"
              >
                <div className="h-px flex-1 bg-slate-100" />
                <span className="flex items-center gap-2 text-2xl font-black text-slate-800 italic uppercase tracking-wider">
                  {language === 'ar' ? 'نصائح طبية ومقالات تهمك' : 'Health Tips & Articles'}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map((post, idx) => {
                  const formattedDate = new Date(post.createdAt).toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US', 
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )
                  const postTitle = translate(post.title)
                  const postExcerpt = post.content ? translate(post.content).substring(0, 120) + '...' : ''
                  const postImage = post.image || 'https://placehold.co/800x400/e8f0ed/2e7d5e?text=Health+Tip'

                  return (
                    <motion.article 
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#e8f0ed] group hover:shadow-xl transition-all duration-500 flex flex-col h-full"
                    >
                      <div className="relative aspect-video overflow-hidden bg-emerald-50">
                        <img 
                          src={postImage} 
                          alt={postTitle} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className={`absolute top-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full ${language === 'ar' ? 'right-4' : 'left-4'}`}>
                          {language === 'ar' ? 'نصيحة طبية' : 'Health Tip'}
                        </div>
                      </div>
                      <div className={`p-6 flex flex-col flex-grow ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-4 text-[10px] text-gray-400 font-bold mb-4 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                          <span className="flex items-center gap-1"><Clock size={12} /> {language === 'ar' ? '3 دقائق' : '3 mins'}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {formattedDate}</span>
                        </div>
                        <h3 className="text-lg font-black text-gray-800 mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                          {postTitle}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-grow">
                          {postExcerpt}
                        </p>
                        <Link 
                          href={`/health-tips/${post.id}`} 
                          className={`inline-flex items-center gap-2 text-primary text-xs font-black group/link w-fit mt-auto ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <span>{language === 'ar' ? 'اقرأ المزيد' : 'Read More'}</span>
                          <ChevronLeft size={16} className={`transition-transform ${language === 'ar' ? 'group-hover/link:-translate-x-1' : 'group-hover/link:translate-x-1 rotate-180'}`} />
                        </Link>
                      </div>
                    </motion.article>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <Link href="/health-tips" className="inline-flex items-center gap-2 px-12 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-xs shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
                  {language === 'ar' ? 'عرض كل المقالات' : 'View All Articles'}
                  <svg className={`transition-transform duration-300 ${language === 'en' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
              </div>

            </div>
          </section>
        )}

        {/* Interactive Features Cards Section */}
        <section className="py-10 sm:py-24 bg-slate-50/50 border-t border-slate-100/50 relative z-10">
          <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100/60 transition-all hover:shadow-md cursor-default group"
                >
                  <div className="bg-[#2e7d5e]/5 p-4.5 rounded-2xl group-hover:bg-[#2e7d5e]/10 group-hover:scale-110 transition-all">{f.icon}</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm md:text-base">{f.title}</h4>
                    <p className="text-[11px] text-slate-600 font-bold mt-1.5 leading-relaxed">{f.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
