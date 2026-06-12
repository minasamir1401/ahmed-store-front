"use client"

import React, { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, PackageSearch, X, ChevronDown, LayoutGrid, Tag, ArrowUpDown, SlidersVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

// ── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8f0ed' }}>
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-full rounded-md" />
        <div className="skeleton h-3 w-2/3 rounded-md" />
        <div className="skeleton h-8 w-full rounded-xl mt-2" />
      </div>
    </div>
  )
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.05 }
  }
}

const cardVariants: any = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 130, damping: 16 }
  }
}

// ── Price Slider ───────────────────────────────────────────────────────────
function PriceSlider({
  min, max, value, onChange
}: {
  min: number, max: number, value: [number, number],
  onChange: (v: [number, number]) => void
}) {
  const rangeRef = React.useRef<HTMLDivElement>(null)

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault()
    const onMove = (ev: MouseEvent) => {
      if (!rangeRef.current) return
      const rect = rangeRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const raw = Math.round(min + ratio * (max - min))
      if (handle === 'min') {
        onChange([Math.min(raw, value[1] - 50), value[1]])
      } else {
        onChange([value[0], Math.max(raw, value[0] + 50)])
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleTouchStart = (handle: 'min' | 'max') => (e: React.TouchEvent) => {
    const onMove = (ev: TouchEvent) => {
      if (!rangeRef.current) return
      const rect = rangeRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (ev.touches[0].clientX - rect.left) / rect.width))
      const raw = Math.round(min + ratio * (max - min))
      if (handle === 'min') {
        onChange([Math.min(raw, value[1] - 50), value[1]])
      } else {
        onChange([value[0], Math.max(raw, value[0] + 50)])
      }
    }
    const onUp = () => {
      window.removeEventListener('touchmove', onMove as any)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('touchmove', onMove as any)
    window.addEventListener('touchend', onUp)
  }

  const leftPct = pct(value[0])
  const rightPct = pct(value[1])

  const { language, t } = useLanguage()
  const isRtl = language === 'ar'
  const locale = isRtl ? 'ar-EG' : 'en-US'

  return (
    <div className="px-1 pt-2 pb-1 select-none">
      {/* Track */}
      <div
        ref={rangeRef}
        className="relative h-2 rounded-full"
        style={{ background: '#e8f0ed' }}
      >
        {/* Active range */}
        <div
          className="absolute h-2 rounded-full"
          style={{
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            background: 'linear-gradient(90deg, #2e7d5e, #4caf88)'
          }}
        />
        {/* Min handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing ring-2 ring-primary/40 hover:ring-primary transition-all"
          style={{ left: `${leftPct}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
        />
        {/* Max handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing ring-2 ring-primary/40 hover:ring-primary transition-all"
          style={{ left: `${rightPct}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-3 text-xs font-black text-primary" dir={isRtl ? 'rtl' : 'ltr'}>
        <span>{value[1].toLocaleString(locale)} {t('currency')}</span>
        <span>{value[0].toLocaleString(locale)} {t('currency')}</span>
      </div>
    </div>
  )
}

// ── Sidebar Filter Panel ───────────────────────────────────────────────────
function FilterSidebar({
  categories,
  selectedCats,
  onToggleCat,
  priceRange,
  priceValue,
  onPriceChange,
  sortBy,
  onSortChange,
  totalFiltered,
  onReset
}: {
  categories: any[]
  selectedCats: string[]
  onToggleCat: (id: string) => void
  priceRange: [number, number]
  priceValue: [number, number]
  onPriceChange: (v: [number, number]) => void
  sortBy: string
  onSortChange: (v: string) => void
  totalFiltered: number
  onReset: () => void
}) {
  const { language, t, translate, dir } = useLanguage()
  const isRtl = language === 'ar'
  const [openCats, setOpenCats] = React.useState(true)
  const [openPrice, setOpenPrice] = React.useState(true)
  const [openSort, setOpenSort] = React.useState(true)

  const sortOptions = [
    { value: 'default', label: language === 'ar' ? 'الافتراضي' : 'Default' },
    { value: 'price-asc', label: language === 'ar' ? 'السعر: الأقل أولاً' : 'Price: Low to High' },
    { value: 'price-desc', label: language === 'ar' ? 'السعر: الأعلى أولاً' : 'Price: High to Low' },
  ]

  const hasFilters = selectedCats.length > 0 ||
    priceValue[0] > priceRange[0] ||
    priceValue[1] < priceRange[1] ||
    sortBy !== 'default'

  return (
    <aside
      dir={dir}
      className="w-full bg-white rounded-2xl overflow-hidden shadow-sm"
      style={{ border: '1px solid #e8f0ed' }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#e8f0ed]">
        <div className="flex items-center gap-2">
          <SlidersVertical size={17} className="text-primary" />
          <span className="font-black text-gray-800 text-sm">
            {language === 'ar' ? 'تصفية النتائج' : 'Filter Results'}
          </span>
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-[11px] font-black text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X size={12} />
            {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
          </button>
        )}
      </div>

      {/* ── Categories Section ── */}
      <div className="border-b border-[#e8f0ed]">
        <button
          onClick={() => setOpenCats(v => !v)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#f7fbf9] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={15} className="text-primary" />
            <span className="font-black text-gray-700 text-sm">
              {language === 'ar' ? 'الأقسام' : 'Categories'}
            </span>
            {selectedCats.length > 0 && (
              <span className="text-[10px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full">
                {selectedCats.length}
              </span>
            )}
          </div>
          <motion.div animate={{ rotate: openCats ? 0 : (isRtl ? -90 : 90) }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {openCats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-1.5 max-h-64 overflow-y-auto">
                {categories.map(cat => {
                  const isActive = selectedCats.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onToggleCat(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/25'
                          : 'text-gray-600 hover:bg-[#f7fbf9] border border-transparent'
                      }`}
                    >
                      <span>{language === 'en' ? (cat.nameEn || translate(cat.name)) : cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold">{cat.count}</span>
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            isActive ? 'bg-primary border-primary' : 'border-gray-300'
                          }`}
                        >
                          {isActive && (
                            <motion.svg
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              width="10" height="10" viewBox="0 0 10 10"
                            >
                              <polyline points="2,5 4,7.5 8,3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Price Range Section ── */}
      <div className="border-b border-[#e8f0ed]">
        <button
          onClick={() => setOpenPrice(v => !v)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#f7fbf9] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-primary" />
            <span className="font-black text-gray-700 text-sm">
              {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
            </span>
          </div>
          <motion.div animate={{ rotate: openPrice ? 0 : (isRtl ? -90 : 90) }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {openPrice && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <PriceSlider
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={priceValue}
                  onChange={onPriceChange}
                />
                {/* Quick presets */}
                <div className="mt-3 flex flex-wrap gap-1.5" dir={dir}>
                  {[
                    { label: language === 'ar' ? 'أقل من 200' : 'Under 200', range: [0, 200] as [number, number] },
                    { label: '200 - 500', range: [200, 500] as [number, number] },
                    { label: '500 - 1000', range: [500, 1000] as [number, number] },
                    { label: language === 'ar' ? 'أكثر من 1000' : 'Over 1000', range: [1000, priceRange[1]] as [number, number] },
                  ].map(preset => {
                    const active = priceValue[0] === preset.range[0] && priceValue[1] === preset.range[1]
                    return (
                      <button
                        key={preset.label}
                        onClick={() => onPriceChange(preset.range)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          active
                            ? 'bg-primary text-white border-primary'
                            : 'bg-[#f7fbf9] text-gray-500 border-[#e8f0ed] hover:border-primary/30 hover:text-primary'
                        }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sort Section ── */}
      <div>
        <button
          onClick={() => setOpenSort(v => !v)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#f7fbf9] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ArrowUpDown size={15} className="text-primary" />
            <span className="font-black text-gray-700 text-sm">
              {language === 'ar' ? 'الترتيب' : 'Sorting'}
            </span>
          </div>
          <motion.div animate={{ rotate: openSort ? 0 : (isRtl ? -90 : 90) }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {openSort && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-1.5">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onSortChange(opt.value)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sortBy === opt.value
                        ? 'bg-primary/10 text-primary border border-primary/25'
                        : 'text-gray-600 hover:bg-[#f7fbf9] border border-transparent'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        sortBy === opt.value ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      {sortBy === opt.value && (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}

// ── Main ProductsContent ───────────────────────────────────────────────────
function ProductsContent() {
  const { language, t, dir, translate } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory = searchParams.get('category')

  const [products, setProducts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showMobileFilter, setShowMobileFilter] = React.useState(false)

  // Filter state
  const [selectedCats, setSelectedCats] = React.useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [sortBy, setSortBy] = React.useState<string>('default')
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 5000])
  const [priceValue, setPriceValue] = React.useState<[number, number]>([0, 5000])

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalProducts, setTotalProducts] = React.useState(0)
  const LIMIT = 24

  React.useEffect(() => {
    document.title = t('products_title')
  }, [language, t])

  const fetchData = async (page = 1, cats = selectedCats, price = priceValue, sort = sortBy) => {
    setLoading(true)
    setError(null)
    try {
      const q = searchParams.get('search') || ''
      const catQuery = cats.length > 0 ? `&categoryId=${cats.join(',')}` : ''
      const minP = price[0]
      const maxP = price[1]

      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/products?page=${page}&limit=${LIMIT}&minPrice=${minP}&maxPrice=${maxP}&sortBy=${sort}${catQuery}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
        fetch('/api/categories')
      ])

      if (!prodRes.ok || !catRes.ok) {
        throw new Error(language === 'ar' ? 'فشل تحميل المنتجات أو الأقسام من السيرفر.' : 'Failed to load products or categories from server.')
      }

      const prodData = await prodRes.json()
      const catData = await catRes.json()

      setProducts(prodData.items || [])
      setTotalProducts(prodData.total || 0)
      setCategories(catData)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(t('error_fetch'))
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on parameters change
  React.useEffect(() => {
    fetchData(currentPage, selectedCats, priceValue, sortBy)
  }, [currentPage, selectedCats, priceValue, sortBy, searchParams.get('search')])

  // Reset page to 1 on filter/search parameters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedCats, priceValue, sortBy, searchParams.get('search')])

  // Toggle category
  const toggleCat = (id: string) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedCats([])
    setSortBy('default')
    setPriceValue(priceRange)
  }

  const searchQuery = searchParams.get('search') || ''

  const hasFilters = selectedCats.length > 0 ||
    priceValue[0] > priceRange[0] ||
    priceValue[1] < priceRange[1] ||
    sortBy !== 'default'

  const filterProps = {
    categories,
    selectedCats,
    onToggleCat: toggleCat,
    priceRange,
    priceValue,
    onPriceChange: setPriceValue,
    sortBy,
    onSortChange: setSortBy,
    totalFiltered: totalProducts,
    onReset: resetFilters
  }

  const totalPages = Math.ceil(totalProducts / LIMIT)

  return (
    <main
      className="min-h-screen pb-24 md:pb-12"
      style={{ background: 'linear-gradient(160deg, #f7fbf9 0%, #ffffff 100%)' }}
    >
      {/* ── Sticky Top Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/95 border-b sticky top-0 z-30 backdrop-blur-md"
        style={{ borderColor: '#e8f0ed' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4" dir={dir}>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-gray-800">
              {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
            </h1>
            {!loading && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full"
              >
                {language === 'ar' ? `${totalProducts} منتج` : `${totalProducts} products`}
              </motion.span>
            )}
            {hasFilters && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
              >
                {language === 'ar' ? 'فلاتر مفعّلة' : 'Active Filters'}
              </motion.span>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilter(v => !v)}
            className="flex md:hidden items-center justify-center gap-1.5 h-11 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: showMobileFilter ? '#2e7d5e' : '#f0f7f4', color: showMobileFilter ? '#fff' : '#2e7d5e', border: '1px solid #cde8df' }}
          >
            <SlidersHorizontal size={16} />
            {language === 'ar' ? 'فلترة' : 'Filters'}
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="max-w-screen-xl mx-auto px-4 pt-4 pb-2">
              <FilterSidebar {...filterProps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout: Sidebar + Grid ── */}
      <div className="max-w-screen-xl mx-auto px-4 py-8" dir={dir}>
        <div className="flex gap-6 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0 sticky top-20">
            <FilterSidebar {...filterProps} />
          </div>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="text-center py-16 bg-red-50/50 rounded-[2rem] border border-red-100 max-w-md mx-auto px-6 relative z-20">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
                <p className="text-red-700 font-bold text-sm mb-4 leading-relaxed">{error}</p>
                <button
                  onClick={() => fetchData(currentPage)}
                  className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-700/10 cursor-pointer"
                >
                  {t('retry')}
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm gap-6"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-gray-200"
                >
                  <PackageSearch size={72} />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-gray-800 mb-2">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                  </h3>
                  <p className="text-gray-400 font-bold text-sm">
                    {language === 'ar' ? 'حاول تعديل الفلاتر المختارة' : 'Try modifying the selected filters'}
                  </p>
                </div>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 rounded-full text-sm font-bold text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #2e7d5e 0%, #1e533e 100%)' }}
                  >
                    {t('products_clear_filters')}
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={`${JSON.stringify(selectedCats)}-${JSON.stringify(priceValue)}-${sortBy}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={cardVariants}>
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12" dir={dir}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#e8f0ed] text-gray-600 hover:bg-[#f7fbf9] disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNumber = idx + 1
                      const isCurrent = pageNumber === currentPage
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => {
                            setCurrentPage(pageNumber)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? 'bg-primary text-white shadow-md shadow-emerald-700/10'
                              : 'bg-white border border-[#e8f0ed] text-gray-600 hover:bg-[#f7fbf9]'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#e8f0ed] text-gray-600 hover:bg-[#f7fbf9] disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Page Export ────────────────────────────────────────────────────────────
export default function ProductsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className="min-h-screen pb-20" style={{ background: '#f7fbf9' }}>
          <div className="skeleton h-14 w-full rounded-none mb-8" />
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex gap-6">
              <div className="hidden md:block w-64 flex-shrink-0">
                <div className="skeleton h-96 rounded-2xl" />
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          </div>
        </main>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </>
  )
}
