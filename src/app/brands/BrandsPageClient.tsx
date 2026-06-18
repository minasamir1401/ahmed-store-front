"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ChevronLeft, Loader2, Package, Search, Sparkles } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useLanguage } from '@/context/LanguageContext'

function BrandSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e8f0ed] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded-md w-3/4" />
          <div className="h-3 bg-slate-50 rounded-md w-1/2" />
        </div>
      </div>
    </div>
  )
}

interface BrandsPageClientProps {
  initialBrands?: any[]
}

export default function BrandsPageClient({ initialBrands = [] }: BrandsPageClientProps) {
  const { t, language, dir, translate } = useLanguage()
  const [brands, setBrands] = useState<any[]>(initialBrands)
  const [brandProducts, setBrandProducts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
        // Fetch product counts for each brand
        fetchProductCounts(data)
      })
      .catch(err => {
        console.error(err)
        setError(language === 'ar' 
          ? "عذراً، فشل تحميل الماركات. يرجى المحاولة مرة أخرى."
          : "Sorry, failed to load brands. Please try again."
        )
        setLoading(false)
      })
  }

  const fetchProductCounts = async (brandsData: any[]) => {
    const counts: Record<string, number> = {}
    await Promise.allSettled(
      brandsData.map(async (brand) => {
        try {
          const res = await fetch(`/api/brands/${brand.id}?page=1&limit=1`)
          if (res.ok) {
            const data = await res.json()
            counts[brand.id] = data.products?.length || 0
            // Try to get total from the full response
            if (data.totalProducts !== undefined) {
              counts[brand.id] = data.totalProducts
            } else if (data.products) {
              // Re-fetch with larger limit to get actual count
              const fullRes = await fetch(`/api/brands/${brand.id}?page=1&limit=200`)
              if (fullRes.ok) {
                const fullData = await fullRes.json()
                counts[brand.id] = fullData.products?.length || 0
              }
            }
          }
        } catch {
          counts[brand.id] = 0
        }
      })
    )
    setBrandProducts(counts)
  }

  useEffect(() => {
    if (initialBrands.length === 0) {
      queueMicrotask(() => fetchBrands())
    } else {
      fetchProductCounts(initialBrands)
    }
  }, [initialBrands.length])

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands
    const q = searchQuery.trim().toLowerCase()
    return brands.filter(b => 
      b.name?.toLowerCase().includes(q) || 
      b.nameEn?.toLowerCase().includes(q)
    )
  }, [brands, searchQuery])

  const totalProducts = Object.values(brandProducts).reduce((sum, c) => sum + c, 0)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-24" dir={dir}>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-white to-[#f7fbf9] border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-black border border-primary/10">
                <Sparkles size={14} />
                <span>{language === 'ar' ? 'ماركات عالمية أصلية' : 'Original Global Brands'}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight">
                {language === 'ar' ? 'الماركات' : 'Brands'}
              </h1>
              <p className="text-gray-500 font-bold text-sm md:text-base max-w-lg">
                {language === 'ar' 
                  ? 'تصفح منتجات أفضل الماركات العالمية الموثوقة والأصلية 100%' 
                  : 'Browse products from the best trusted 100% original global brands'}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-2">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-primary">{brands.length}</div>
                  <div className="text-[11px] font-bold text-gray-400">{language === 'ar' ? 'ماركة' : 'Brands'}</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-primary">{totalProducts || '...'}</div>
                  <div className="text-[11px] font-bold text-gray-400">{language === 'ar' ? 'منتج' : 'Products'}</div>
                </div>
              </div>
            </div>

            {/* Search */}
            {brands.length > 4 && (
              <div className="max-w-md mx-auto mt-8">
                <div className="relative">
                  <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ [language === 'ar' ? 'right' : 'left']: '16px' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث عن ماركة...' : 'Search for a brand...'}
                    className="w-full h-12 bg-white border border-[#e8f0ed] rounded-2xl text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    style={{ [language === 'ar' ? 'paddingRight' : 'paddingLeft']: '44px', [language === 'ar' ? 'paddingLeft' : 'paddingRight']: '16px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-10 md:py-14">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <BrandSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {searchQuery && (
                <div className="mb-6 text-sm font-bold text-gray-500">
                  {language === 'ar' ? `نتائج البحث عن "${searchQuery}"` : `Search results for "${searchQuery}"`}
                  {' · '}
                  <span className="text-primary">{filteredBrands.length} {language === 'ar' ? 'ماركة' : 'brands'}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBrands.map((brand) => {
                  const count = brandProducts[brand.id]
                  const displayName = language === 'en' ? (brand.nameEn || translate(brand.name)) : brand.name

                  return (
                    <Link 
                      key={brand.id} 
                      href={`/brands/${brand.id}`}
                      className="group bg-white rounded-3xl p-5 border border-[#e8f0ed] hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
                    >
                      {/* Brand Logo */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-primary/10 group-hover:bg-primary/5 transition-all shrink-0">
                        <BrandLogo image={brand.image} name={brand.name} size={56} className="bg-transparent border-none" />
                      </div>

                      {/* Brand Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-black text-gray-800 group-hover:text-primary transition-colors truncate">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Package size={12} className="text-gray-400 shrink-0" />
                          <span className="text-xs font-bold text-gray-400">
                            {count !== undefined 
                              ? `${count} ${language === 'ar' ? 'منتج' : 'products'}`
                              : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white text-gray-400 flex items-center justify-center transition-all duration-300">
                        <ChevronLeft size={16} className={language === 'en' ? 'rotate-180' : ''} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {!loading && filteredBrands.length === 0 && !error && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-300">
                <Package size={36} />
              </div>
              <h3 className="text-lg font-black text-gray-400">
                {searchQuery 
                  ? (language === 'ar' ? 'لم نجد نتائج مطابقة' : 'No matching results')
                  : (language === 'ar' ? 'لا توجد ماركات حالياً' : 'No brands available')}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery
                  ? (language === 'ar' ? 'جرب البحث بكلمة مختلفة' : 'Try searching with a different keyword')
                  : (language === 'ar' ? 'نعمل على إضافة المزيد من الماركات قريباً' : 'We are working on adding more brands soon')}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="mt-4 text-primary font-bold text-xs hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'مسح البحث' : 'Clear search'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
