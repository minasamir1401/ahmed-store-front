"use client"

import React, { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import SmartDosageCalculator from './components/SmartDosageCalculator';
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import Image from 'next/image'
import { getProductUrlParam } from '@/lib/slug'
import InnerImageZoom from 'react-inner-image-zoom'
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.min.css'
import { newestProducts } from '@/lib/product-display'
import { Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart, ShoppingCart, Check, ChevronLeft, CheckCircle2, Building2, Sparkles, Droplet, Sun, Activity, Info, Moon, Dumbbell, Flame, Calendar, Clock } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useLanguage } from '@/context/LanguageContext'
import { productImageAlt, productImageThumb, productImageVersion, safeBrandImage, withImageVersion } from '@/lib/product-images'
import { BrandLogo } from '@/components/BrandLogo'
import { trackViewContent, trackAddToCart } from '@/lib/tracking'

// ── Animation variants ──────────────────────────────────────────────────
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
}

const fadeIn: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
}

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
}

const stagger: any = {
  show: { transition: { staggerChildren: 0.08 } }
}

// ── Skeleton loader ────────────────────────────────────────────────────
function ProductSkeleton() {
  const { dir } = useLanguage()
  return (
    <div className="min-h-screen bg-white pb-20" dir={dir}>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-6">
        {/* Breadcrumb */}
        <div className="skeleton h-4 w-48 rounded-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="skeleton aspect-square rounded-[3rem]" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="skeleton h-6 w-40 rounded-full" />
            <div className="skeleton h-10 w-full rounded-2xl" />
            <div className="skeleton h-10 w-32 rounded-2xl" />
            <div className="skeleton h-36 w-full rounded-3xl" />
            <div className="skeleton h-16 w-full rounded-[1.5rem]" />
          </div>
        </div>
      </div>
    </div>
  )
}

const parseBilingual = (fieldVal: string | null | undefined): { ar: string; en: string } => {
  if (!fieldVal) return { ar: '', en: '' };
  const trimmed = fieldVal.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return {
          ar: parsed.ar || '',
          en: parsed.en || ''
        };
      }
    } catch (e) {
      // ignore
    }
  }
  return { ar: fieldVal, en: '' };
};

const getLocalizedValue = (
  language: 'ar' | 'en',
  arValue: string | null | undefined,
  enValue?: string | null,
  translate?: (text: string) => string
) => {
  const ar = arValue || ''
  const en = enValue || ''
  return language === 'en' ? (en || (translate ? translate(ar) : ar)) : ar
}

export default function ProductPageClient({ params, initialProduct }: { params: { id: string }, initialProduct: any }) {
  const { t, dir, language, translate } = useLanguage()
  const productId = params.id
  const addToCart = useCart().addToCart
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<any>(initialProduct)
  const [loading, setLoading] = useState(!initialProduct)
  const [activeImage, setActiveImage] = useState(initialProduct?.image || '')
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<any>(() => {
    try {
      const parsed = initialProduct?.sizesPrices ? JSON.parse(initialProduct.sizesPrices) : (initialProduct?.sizeOptions ? JSON.parse(initialProduct.sizeOptions) : [])
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
    } catch { return null }
  })
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const isFavorite = isInWishlist(productId)
  const router = useRouter()
  const ctaRef = useRef<HTMLDivElement>(null)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [recommendedArticles, setRecommendedArticles] = useState<any[]>([])
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Show sticky CTA when the add-to-cart section scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = !entry.isIntersecting
        setShowStickyBar(visible)
        window.dispatchEvent(new CustomEvent('sticky-bar-change', { detail: { visible } }))
      },
      { threshold: 0 }
    )
    if (ctaRef.current) observer.observe(ctaRef.current)
    return () => {
      observer.disconnect()
      window.dispatchEvent(new CustomEvent('sticky-bar-change', { detail: { visible: false } }))
    }
  }, [product])

  useEffect(() => {
    if (product) {
      const displayTitle = getLocalizedValue(language, product.title, product.titleEn, translate);
      document.title = `${displayTitle} | The VitaHub`;
      
      trackViewContent({
        id: product.id,
        title: displayTitle,
        price: product.price,
        image: product.image
      });
    }
  }, [product, language])

  useEffect(() => {
    const realId = productId.includes('-') ? productId.split('-').pop() : productId;
    fetch(`/api/products/${realId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => {
        if (data && data.error) throw new Error(data.error)
        setProduct(data)
        if (!activeImage) setActiveImage(data.image)
        setLoading(false)

        try {
          if (!selectedSize) {
            const parsed = data.sizesPrices ? JSON.parse(data.sizesPrices) : (data.sizeOptions ? JSON.parse(data.sizeOptions) : [])
            if (Array.isArray(parsed) && parsed.length > 0) setSelectedSize(parsed[0])
          }
        } catch { /* ignore */ }
      })
      .catch(() => {
        if (!initialProduct) setProduct(null)
        setLoading(false)
      })
  }, [productId])

  useEffect(() => {
    if (!product?.categoryId) return

    // Fetch similar products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = newestProducts(data.filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id))
          setSimilarProducts(filtered.slice(0, 4))
        }
      })
      .catch(err => console.error("Error fetching similar products:", err))

    // Fetch recommended articles
    fetch('/api/medical-tips')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecommendedArticles(data.slice(0, 3))
        }
      })
      .catch(err => console.error("Error fetching recommended articles:", err))
  }, [product?.categoryId, product?.id])

  if (loading) return (
    <>
      <Header />
      <ProductSkeleton />
      <Footer />
    </>
  )

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4" dir={dir}>
      <h1 className="text-2xl font-black text-gray-800">{language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</h1>
      <button onClick={() => router.back()} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold cursor-pointer">{language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</button>
    </div>
  )

  // Parse data
  const titleBi = parseBilingual(product.title)
  const titleEn = product.titleEn || titleBi.en || titleBi.ar
  const wishlistTitle = JSON.stringify({ ar: titleBi.ar, en: titleEn })
  const additionalImages = product.images ? product.images.split(',').map((img: string) => img.trim()).filter((i: string) => i) : []
  const imageVersion = productImageVersion(product)
  const allImages = [product.image, ...additionalImages].filter(Boolean).map((src: string) => withImageVersion(src, imageVersion))
  const mainImageAlt = productImageAlt(product, getLocalizedValue(language, product.title, product.titleEn, translate))
  const mainImageWidth = product.imageWidth || 800
  const mainImageHeight = product.imageHeight || 800
  const featuresSource = language === 'en' && product.featuresEn ? product.featuresEn : product.features
  const features = featuresSource ? featuresSource.split('\n').filter((f: string) => f.trim()) : []

  let sizeOptions: any[] = []
  let specifications: any[] = []
  let keyInfo: any[] = []
  let certifications: string[] = []
  let supplementFactsRows: any[] = []

  try {
    const r = product.sizesPrices ? JSON.parse(product.sizesPrices) : (product.sizeOptions ? JSON.parse(product.sizeOptions) : []);
    sizeOptions = Array.isArray(r) ? r : [];
  } catch {
    sizeOptions = [];
  }

  try {
    const raw = product.productSpecs ? JSON.parse(product.productSpecs) : (product.specifications ? JSON.parse(product.specifications) : null)
    if (Array.isArray(raw)) {
      specifications = raw.map((item: any) => ({
        label: getLocalizedValue(language, item.label, item.label_en, translate),
        value: getLocalizedValue(language, item.value, item.value_en, translate),
        bold: item.bold
      }));
    } else if (raw && typeof raw === 'object') {
      const specKeys = ['sku', 'upc', 'authentic', 'shippingWeight', 'dimensions', 'firstAvailable', 'quantity', 'animalDerived'];
      specifications = specKeys
        .map(key => {
          let label = '';
          let value = '';
          let bold = false;
          
          if (key === 'sku') {
            label = language === 'en' ? 'SKU' : 'رمز SKU';
            value = raw.sku;
          } else if (key === 'upc') {
            label = language === 'en' ? 'UPC' : 'رمز UPC';
            value = raw.upc;
          } else if (key === 'authentic') {
            label = language === 'en' ? '100% Authentic' : 'أصلي 100%';
            value = raw.authentic ? (language === 'en' ? 'Yes ✓' : 'نعم ✓') : (language === 'en' ? 'No ✗' : 'لا ✗');
            bold = true;
          } else if (key === 'shippingWeight') {
            label = language === 'en' ? 'Shipping Weight' : 'وزن الشحن';
            value = language === 'en' ? (raw.shippingWeight_en || raw.shippingWeight) : (raw.shippingWeight_ar || raw.shippingWeight);
          } else if (key === 'dimensions') {
            label = language === 'en' ? 'Dimensions' : 'الأبعاد';
            value = language === 'en' ? (raw.dimensions_en || raw.dimensions) : (raw.dimensions_ar || raw.dimensions);
          } else {
            const lmAr: Record<string, string> = { firstAvailable: 'أول إتاحة', quantity: 'الكمية', animalDerived: 'مشتق حيواني' }
            const lmEn: Record<string, string> = { firstAvailable: 'First Available', quantity: 'Quantity', animalDerived: 'Animal Derived' }
            label = language === 'en' ? (lmEn[key] || key) : (lmAr[key] || key);
            value = String(raw[key] || '');
          }
          
          return { label, value, bold, key };
        })
        .filter(item => item.value !== null && item.value !== undefined && item.value !== '' && item.value !== 'undefined');
    }
  } catch { specifications = [] }

  try {
    const raw = product.keyInfo ? JSON.parse(product.keyInfo) : null
    if (Array.isArray(raw)) {
      keyInfo = raw.map((item: any) => ({
        label: getLocalizedValue(language, item.label, item.label_en, translate),
        value: getLocalizedValue(language, item.value, item.value_en, translate)
      }));
    } else if (raw && typeof raw === 'object') {
      const infoKeys = ['servingSize', 'totalServings', 'bestBefore', 'origin'];
      keyInfo = infoKeys
        .map(key => {
          let label = '';
          let value = '';
          
          if (key === 'servingSize') {
            label = language === 'en' ? 'Serving Size' : 'حجم الجرعة';
            value = language === 'en' ? (raw.servingSize_en || raw.servingSize) : (raw.servingSize_ar || raw.servingSize);
          } else if (key === 'totalServings') {
            label = language === 'en' ? 'Servings Per Container' : 'عدد الجرعات';
            value = language === 'en' ? (raw.totalServings_en || raw.totalServings) : (raw.totalServings_ar || raw.totalServings);
          } else if (key === 'bestBefore') {
            label = language === 'en' ? 'Best Before' : 'صالح حتى';
            value = language === 'en' ? (raw.bestBefore_en || raw.bestBefore) : (raw.bestBefore_ar || raw.bestBefore);
          } else if (key === 'origin') {
            label = language === 'en' ? 'Country of Origin' : 'بلد المنشأ';
            value = language === 'en' ? (raw.origin_en || raw.origin) : (raw.origin_ar || raw.origin);
          }
          
          return { label, value, key };
        })
        .filter(item => item.value !== null && item.value !== undefined && item.value !== '' && item.value !== 'undefined');
    }
  } catch { keyInfo = [] }

  try {
    const raw = product.certifications ? JSON.parse(product.certifications) : null
    if (Array.isArray(raw)) {
      certifications = raw.map(c => translate(c))
    } else if (raw && typeof raw === 'object') {
      const clAr: Record<string, string> = { glutenFree: 'خالي من الجلوتين', dairyFree: 'خالي من الألبان', soyFree: 'خالي من الصويا', treeNutFree: 'خالي من المكسرات', vegan: 'نباتي', nonGMO: 'غير معدّل وراثياً', nonGmo: 'غير معدّل وراثياً', kosher: 'كوشر', halal: 'حلال' }
      const clEn: Record<string, string> = { glutenFree: 'Gluten Free', dairyFree: 'Dairy Free', soyFree: 'Soy Free', treeNutFree: 'Tree Nut Free', vegan: 'Vegan', nonGMO: 'Non-GMO', nonGmo: 'Non-GMO', kosher: 'Kosher', halal: 'Halal' }
      certifications = Object.entries(raw)
        .filter(([, v]) => v === true)
        .map(([k]) => language === 'en' ? (clEn[k] || k) : (clAr[k] || k))
    }
  } catch { certifications = [] }

  try {
    const raw = product.supplementFacts ? JSON.parse(product.supplementFacts) : null
    let rawRows: any[] = []
    if (Array.isArray(raw)) { rawRows = raw }
    else if (raw?.rows) { rawRows = raw.rows }
    
    supplementFactsRows = rawRows.map((row: any) => ({
      name: language === 'en' ? (row.name_en || row.name || row.label || '') : (row.name_ar || row.name || row.label || ''),
      amount: language === 'en' ? (row.amount_en || row.amount || '') : (row.amount_ar || row.amount || ''),
      dv: row.dv || ''
    }));
  } catch { supplementFactsRows = [] }

  let faqsList: any[] = []
  try {
    const raw = product.faqs ? (typeof product.faqs === 'string' ? JSON.parse(product.faqs) : product.faqs) : null
    if (Array.isArray(raw)) {
      faqsList = raw.map((f: any) => ({
        question: language === 'en' ? (f.question_en || f.question || '') : (f.question_ar || f.question || ''),
        answer: language === 'en' ? (f.answer_en || f.answer || '') : (f.answer_ar || f.answer || '')
      })).filter((f: any) => f.question && f.answer)
    }
  } catch {
    faqsList = []
  }

  const currentPrice = selectedSize ? selectedSize.price : product.price
  const currentOldPrice = selectedSize ? selectedSize.originalPrice : product.oldPrice

  const handleAddToCart = () => {
    if (!product) return

    const titleBi = parseBilingual(product.title)
    const titleEn = product.titleEn || titleBi.en || titleBi.ar
    let finalTitle = ''
    if (selectedSize) {
      const sizeBi = parseBilingual(selectedSize.size)
      const combinedAr = `${titleBi.ar} (${sizeBi.ar || selectedSize.size})`
      const combinedEn = `${titleEn} (${sizeBi.en || sizeBi.ar || selectedSize.size})`
      finalTitle = JSON.stringify({ ar: combinedAr, en: combinedEn })
    } else {
      finalTitle = JSON.stringify({ ar: titleBi.ar, en: titleEn })
    }

    addToCart({ 
      id: product.id, 
      title: finalTitle, 
      price: currentPrice, 
      image: product.image, 
      quantity,
      size: selectedSize?.size
    })
    
    // Track AddToCart event
    const displayTitle = getLocalizedValue(language, product.title, product.titleEn, translate) + (selectedSize ? ` (${selectedSize.size})` : '');
    trackAddToCart({
      id: product.id,
      title: displayTitle,
      price: currentPrice,
      image: product.image,
      quantity
    });

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const discountPercent = currentOldPrice && currentPrice ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100) : null

  return (
    <>
      <Header />

      <main className="flex-1 bg-white relative overflow-hidden" dir={dir}>
        {/* Ambient glow */}
        <div className="absolute top-24 right-0 w-[400px] h-[300px] bg-emerald-100 rounded-full blur-[130px] opacity-25 pointer-events-none" />

        <div className="max-w-screen-xl mx-auto px-1.5 max-[340px]:px-1 xs:px-4 py-4 sm:py-8 relative">

          {/* Breadcrumb */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 overflow-x-auto whitespace-nowrap"
          >
            {[
              { label: t('bottom_home'), action: () => router.push('/') },
              { label: language === 'ar' ? 'المتجر' : 'Store', action: () => router.push('/products') },
              { label: getLocalizedValue(language, product.category?.name, product.category?.nameEn, translate), action: null, primary: true }
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronLeft size={14} className="text-gray-300 flex-shrink-0" />}
                <motion.span
                  variants={fadeIn}
                  onClick={item.action || undefined}
                  className={`cursor-pointer transition-colors ${item.primary ? 'text-primary font-black' : 'hover:text-primary'}`}
                >
                  {item.label}
                </motion.span>
              </React.Fragment>
            ))}
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start">

            {/* ── Left: Images ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 lg:col-start-1 lg:row-start-1 order-1"
            >
              {/* Main image */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="aspect-[4/5] rounded-2xl sm:rounded-[3rem] bg-[#f0f7f4] overflow-hidden border border-[#e8f0ed] flex items-center justify-center relative shadow-sm group"
                  >
                    <div className="w-full h-full relative z-10 p-4 sm:p-8 flex items-center justify-center pointer-events-auto">
                      <InnerImageZoom
                        src={activeImage}
                        zoomSrc={activeImage}
                        zoomType="hover"
                        zoomScale={1.5}
                        hideCloseButton={true}
                        hideHint={true}
                        className="w-full h-full mix-blend-multiply"
                        imgAttributes={{
                          className: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-500",
                          alt: mainImageAlt
                        }}
                      />
                    </div>

                    {/* Discount badge on image */}
                    {discountPercent && (
                      <div className="absolute top-3 left-3 xs:top-5 xs:left-5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">
                        {language === 'ar' ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <motion.div
                  data-nosnippet
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-4 gap-2 max-[340px]:gap-1 xs:gap-4"
                >
                  {allImages.map((img, i) => (
                    <motion.div
                      key={i}
                      variants={scaleIn}
                      onClick={() => setActiveImage(img)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-[4/5] rounded-xl xs:rounded-2xl bg-[#f0f7f4] border-2 cursor-pointer transition-all overflow-hidden relative ${activeImage === img ? 'border-primary shadow-md shadow-primary/10' : 'border-[#e8f0ed] hover:border-primary/50'}`}
                    >
                      <div className="w-full h-full relative z-10 p-2 pointer-events-auto">
                        <InnerImageZoom
                          src={productImageThumb(img) || img}
                          zoomSrc={img}
                          zoomType="hover"
                          zoomScale={1.5}
                          hideCloseButton={true}
                          hideHint={true}
                          className="w-full h-full mix-blend-multiply"
                          imgAttributes={{
                            className: "w-full h-full object-contain",
                            alt: `${mainImageAlt} ${i + 1}`
                          }}
                        />
                      </div>

                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Mobile-only Product Header (Title, Price, Brand, Rating) */}
              <div className="block lg:hidden space-y-4 px-1 mt-4">
                {/* Category + Brand + Stars */}
                <div className="flex flex-wrap items-center gap-2.5 max-[340px]:gap-1.5">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] max-[340px]:text-[9px] font-black uppercase tracking-wider">{getLocalizedValue(language, product.category?.name, product.category?.nameEn, translate)}</span>
                  {product.brand && (
                    <Link href={`/brands/${product.brand.id}`} className="flex items-center gap-2 bg-gray-50 text-gray-700 pr-1 pl-3 py-1 rounded-full text-[11px] max-[340px]:text-[10px] font-black border border-gray-100 hover:border-primary/30 hover:bg-white transition-all shadow-sm">
                    <BrandLogo image={product.brand.image} name={product.brand.name} size={24} className="bg-white" />
                      <span>{getLocalizedValue(language, product.brand.name, product.brand.nameEn, translate)}</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="currentColor" />)}
                    <span className="text-xs max-[340px]:text-[10px] font-bold text-gray-400 mr-1">{language === 'ar' ? '4.9 (120 تقييم)' : '4.9 (120 reviews)'}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="text-lg xs:text-xl font-black text-gray-800 leading-tight break-words">
                  {getLocalizedValue(language, product.title, product.titleEn, translate)}
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-end gap-2 xs:gap-3 py-1">
                  <span className="text-xl xs:text-2xl font-black text-primary">{currentPrice} <span className="text-xs xs:text-base">{t('currency')}</span></span>
                  {currentOldPrice && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm xs:text-lg text-gray-400 line-through">{currentOldPrice} {t('currency')}</span>
                      {discountPercent && <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{language === 'ar' ? `وفّر ${discountPercent}%` : `Save ${discountPercent}%`}</span>}
                    </div>
                  )}
                </div>
                {product.expiryDate && (
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-xl text-xs font-black border border-amber-200/50 w-fit mt-1">
                    <Calendar size={13} />
                    <span>{language === 'ar' ? `تاريخ الانتهاء: ${product.expiryDate}` : `Expiry Date: ${product.expiryDate}`}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Specs, Advisor, and Guarantees (below Right Info on mobile, column 1 row 2 on desktop) */}
            <div className="space-y-6 lg:col-start-1 lg:row-start-2 order-3 lg:order-none">

              {/* Specs table (left side) */}
              {specifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-50/50 rounded-xl xs:rounded-2xl sm:rounded-[2.5rem] p-2.5 max-[340px]:p-1.5 xs:p-4 sm:p-8 border border-gray-100 space-y-3.5 xs:space-y-6"
                >
                  <h3 className="text-xs max-[340px]:text-[10px] xs:text-sm font-black text-gray-800 uppercase tracking-widest border-b pb-3 xs:pb-4">{t('prod_specifications')}</h3>
                  <ul className="space-y-3 xs:space-y-4">
                    {specifications.map((spec: any, i: number) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex justify-between items-start gap-2 xs:gap-4 text-[11px] max-[340px]:text-[9.5px] xs:text-sm ${spec.bold ? 'font-black text-gray-800' : 'font-bold text-gray-500'}`}
                      >
                        <span className="shrink-0 break-words">{spec.label}:</span>
                        <span className={`break-words text-left ${spec.label.includes('أصلي') || spec.label.includes('Authentic') ? 'text-primary font-black' : ''}`}>{translate(spec.value)}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <SmartDosageCalculator product={product} language={language} />

              {/* ── The VitaHub Golden Guarantees ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-slate-50/70 rounded-2xl sm:rounded-[2.5rem] border border-slate-100/80 p-5 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">{language === 'ar' ? 'ضمانات الجودة في The VitaHub' : 'Quality Guarantees at The VitaHub'}</h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: ShieldCheck,
                      title: language === 'ar' ? 'أصلية وموثقة 100%' : '100% Original & Certified',
                      desc: language === 'ar' ? 'تأتي مكملاتنا مباشرة من المصانع الرسمية مع رمز تتبع التحقق من المصدر (Batch Number).' : 'Our supplements come directly from official factories with a batch number verification code.',
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50/50'
                    },
                    {
                      icon: ShieldCheck, 
                      title: language === 'ar' ? 'تخزين وحفظ مبرد متكامل' : 'Integrated Cold Storage & Preservation',
                      desc: language === 'ar' ? 'مخازن مجهزة بالكامل بنظام تحكم ذكي للحرارة والرطوبة للحفاظ على فاعلية الفيتامينات الكاملة.' : 'Fully equipped warehouses with smart temperature and humidity control to preserve the complete effectiveness of vitamins.',
                      color: 'text-sky-500',
                      bg: 'bg-sky-50/30'
                    },
                    {
                      icon: Truck,
                      title: language === 'ar' ? 'شحن آمن وفحص قبل الدفع' : 'Secure Shipping & Pre-payment Inspection',
                      desc: language === 'ar' ? 'توصيل لباب بيتك مع أحقية فحص المنتج والتأكد من الباتش والتوثيق بالكامل قبل دفع قرش واحد.' : 'Delivery to your doorstep with the right to inspect the product, batch, and documentation before paying a single penny.',
                      color: 'text-blue-500',
                      bg: 'bg-blue-50/30'
                    },
                    {
                      icon: RotateCcw,
                      title: language === 'ar' ? 'استرجاع واستبدال مرن وسهل' : 'Flexible & Easy Returns',
                      desc: language === 'ar' ? 'لديك 14 يوماً كاملة لاستبدال أو إرجاع أي منتج غير مفتوح بسهولة دون أي تعقيدات.' : 'You have 14 full days to exchange or return any unopened product easily without complications.',
                      color: 'text-amber-500',
                      bg: 'bg-amber-50/30'
                    }
                  ].map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex gap-3 items-start p-3 sm:p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className={`${item.bg} ${item.color} p-2 sm:p-2.5 rounded-xl flex-shrink-0`}>
                          <IconComp size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[11px] sm:text-xs font-black text-slate-800">{item.title}</h4>
                          <p className="text-[10px] sm:text-xs font-bold text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ── Right: Info ── */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
              className="flex flex-col gap-6 lg:gap-8 lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 lg:order-none"
            >
              {/* Category + Brand + Stars */}
              <motion.div variants={fadeUp} className="hidden lg:flex flex-wrap items-center gap-2.5 max-[340px]:gap-1.5 order-1">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] max-[340px]:text-[9px] font-black uppercase tracking-wider">{getLocalizedValue(language, product.category?.name, product.category?.nameEn, translate)}</span>
                
                {product.brand && (
                  <Link href={`/brands/${product.brand.id}`} className="flex items-center gap-2 bg-gray-50 text-gray-700 pr-1 pl-3 py-1 rounded-full text-[11px] max-[340px]:text-[10px] font-black border border-gray-100 hover:border-primary/30 hover:bg-white transition-all shadow-sm">
                    <BrandLogo image={product.brand.image} name={product.brand.name} size={24} className="bg-white" />
                    <span>{getLocalizedValue(language, product.brand.name, product.brand.nameEn, translate)}</span>
                  </Link>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="currentColor" />)}
                  <span className="text-xs max-[340px]:text-[10px] font-bold text-gray-400 mr-1">{language === 'ar' ? '4.9 (120 تقييم)' : '4.9 (120 reviews)'}</span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeUp} className="hidden lg:block text-lg xs:text-xl sm:text-2xl md:text-4xl font-black text-gray-800 leading-tight break-words order-2">
                {getLocalizedValue(language, product.title, product.titleEn, translate)}
              </motion.h1>

              {/* Price */}
              <motion.div variants={fadeUp} className="hidden lg:flex flex-wrap items-end gap-2 xs:gap-3 py-2 order-3">
                <span className="text-xl xs:text-2xl sm:text-4xl font-black text-primary">{currentPrice} <span className="text-xs xs:text-base sm:text-xl">{t('currency')}</span></span>
                {currentOldPrice && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm xs:text-lg text-gray-400 line-through">{currentOldPrice} {t('currency')}</span>
                    {discountPercent && <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">وفّر {discountPercent}%</span>}
                  </div>
                )}
              </motion.div>
              {product.expiryDate && (
                <motion.div variants={fadeUp} className="hidden lg:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-xl text-xs font-black border border-amber-200/50 w-fit order-3 -mt-2 mb-2">
                  <Calendar size={13} />
                  <span>{language === 'ar' ? `تاريخ الانتهاء: ${product.expiryDate}` : `Expiry Date: ${product.expiryDate}`}</span>
                </motion.div>
              )}

              {/* Size Selector */}
              {sizeOptions.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2.5 pt-2 order-4">
                  <label className="text-xs max-[340px]:text-[11px] font-black text-gray-800">{language === 'ar' ? 'اختر الحجم / الكمية:' : 'Choose Size / Quantity:'}</label>
                  <div className="flex flex-wrap gap-1.5 xs:gap-3">
                    {sizeOptions.map((opt: any, i: number) => (
                      <motion.button
                        key={i}
                        onClick={() => setSelectedSize(opt)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center px-2 py-1.5 max-[340px]:px-1.5 max-[340px]:py-1 xs:px-6 xs:py-3 rounded-xl xs:rounded-2xl border-2 transition-all min-w-[70px] max-[340px]:min-w-[60px] xs:min-w-[100px] ${selectedSize?.size === opt.size ? 'border-primary bg-primary/5 text-primary shadow-md shadow-primary/10' : 'border-gray-100 bg-white text-gray-500 hover:border-primary/30'}`}
                      >
                        <span className="text-xs max-[340px]:text-[10px] xs:text-sm font-black">{translate(opt.size)}</span>
                        <span className="text-[9px] max-[340px]:text-[8px] xs:text-[10px] font-bold opacity-60">{opt.price} {t('currency')}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <motion.div variants={fadeUp} className="bg-[#f0f7f4] p-3 max-[340px]:p-2 xs:p-6 rounded-2xl xs:rounded-[2rem] border border-[#e8f0ed] space-y-2.5 max-[340px]:space-y-1.5 order-6">
                  <h4 className="text-xs max-[340px]:text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5 xs:gap-2">
                    <Sparkles size={14} />
                    {language === 'ar' ? 'مميزات المنتج:' : 'Product Features:'}
                  </h4>
                  {features.map((feature: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-1.5 xs:gap-2 text-xs max-[340px]:text-[10px] xs:text-sm text-gray-700 font-bold"
                    >
                      <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5 max-[340px]:w-3.5 max-[340px]:h-3.5" />
                      <span className="leading-relaxed break-words">{translate(feature)}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Description */}
              <motion.div variants={fadeUp} className="space-y-2 pt-2 order-7">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">{t('prod_description')}:</h4>
                <p className="text-gray-500 leading-relaxed text-sm whitespace-pre-line">{getLocalizedValue(language, product.desc, product.descEn, translate)}</p>
              </motion.div>

              {/* Key Info */}
              {keyInfo.length > 0 && (
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2 max-[340px]:gap-1 xs:gap-4 py-4 xs:py-6 border-y border-gray-100 order-8">
                  {keyInfo.map((info: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] max-[340px]:text-[9px] font-black text-gray-400 uppercase">{translate(info.label)}</span>
                      <div className="text-xs max-[340px]:text-[11px] xs:text-sm font-black text-gray-800">{translate(info.value)}</div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-3 order-9">
                  <h4 className="text-[10px] max-[340px]:text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('prod_certifications')}</h4>
                  <div className="flex flex-wrap gap-1 xs:gap-3">
                    {certifications.map((cert: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 200 }}
                        className="flex items-center gap-1 bg-primary/5 border border-primary/10 px-2 py-1 max-[340px]:px-1.5 max-[340px]:py-0.5 xs:px-4 xs:py-2 rounded-full trust-badge"
                      >
                        <ShieldCheck size={14} className="text-primary flex-shrink-0" />
                        <span className="text-[10px] max-[340px]:text-[9px] xs:text-xs font-black text-primary whitespace-nowrap">{translate(cert)}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Add to Cart CTA */}
              <motion.div ref={ctaRef} variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-[340px]:gap-2 pt-2 sm:pt-4 order-5">
                {/* Container for Quantity and Wishlist on mobile (side-by-side) */}
                <div className="flex items-center gap-3 max-[340px]:gap-2 w-full sm:w-auto">
                  <div className="flex items-center justify-between border border-[#e8f0ed] rounded-2xl bg-[#f0f7f4] p-1 px-3 max-[340px]:px-1.5 h-11 max-[340px]:h-10 sm:h-16 flex-1 sm:w-36">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 max-[340px]:w-6 max-[340px]:h-6 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Minus className="w-[14px] h-[14px] max-[340px]:w-3 max-[340px]:h-3" /></motion.button>
                    <AnimatePresence mode="wait">
                      <motion.span key={quantity} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }} className="w-8 text-center font-black text-base max-[340px]:text-sm">{quantity}</motion.span>
                    </AnimatePresence>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQuantity(q => q + 1)} className="w-7 h-7 max-[340px]:w-6 max-[340px]:h-6 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Plus className="w-[14px] h-[14px] max-[340px]:w-3 max-[340px]:h-3" /></motion.button>
                  </div>

                  {/* Wishlist on mobile next to Quantity (hidden on sm:) */}
                  <motion.button
                    onClick={() => toggleWishlist({ id: product.id, title: wishlistTitle, price: currentPrice, image: product.image, categoryId: product.categoryId || '' })}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`w-11 h-11 max-[340px]:w-10 max-[340px]:h-10 xs:w-12 xs:h-12 sm:hidden rounded-2xl border border-[#e8f0ed] flex items-center justify-center transition-all flex-shrink-0 ${isFavorite ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-400 bg-white hover:text-red-500'}`}
                  >
                    <Heart className="w-5 h-5 max-[340px]:w-4.5 max-[340px]:h-4.5" fill={isFavorite ? "currentColor" : "none"} />
                  </motion.button>
                </div>

                {/* Add to Cart button */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  whileHover={{ scale: isAdded ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full sm:flex-1 h-11 max-[340px]:h-10 xs:h-12 sm:h-16 rounded-2xl font-black text-sm max-[340px]:text-xs sm:text-lg transition-all shadow-xl flex items-center justify-center gap-2 relative overflow-hidden ${isAdded ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-primary/20'}`}
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.span key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 max-[340px]:gap-1.5">
                        <Check className="w-5 h-5 max-[340px]:w-4 max-[340px]:h-4 sm:w-6 sm:h-6" /> {language === 'ar' ? 'تم الإضافة ✨' : 'Added ✨'}
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 max-[340px]:gap-1.5">
                        <ShoppingCart className="w-5 h-5 max-[340px]:w-4 max-[340px]:h-4 sm:w-6 sm:h-6" /> {t('add_to_cart')}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Wishlist on desktop (hidden on mobile, shown on sm:) */}
                <motion.button
                  onClick={() => toggleWishlist({ id: product.id, title: wishlistTitle, price: currentPrice, image: product.image, categoryId: product.categoryId || '' })}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className={`hidden sm:flex w-11 h-11 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-2xl border border-[#e8f0ed] items-center justify-center transition-all flex-shrink-0 ${isFavorite ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-400 bg-white hover:text-red-500'}`}
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" fill={isFavorite ? "currentColor" : "none"} />
                </motion.button>
              </motion.div>

              {/* FAQ Accordion Section */}
              {faqsList && faqsList.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  className="bg-slate-50/60 rounded-3xl p-5 sm:p-8 border border-slate-100/80 space-y-6 order-10 shadow-sm"
                >
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">
                      {language === 'ar' ? 'الأسئلة الشائعة حول المنتج' : 'Frequently Asked Questions'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {faqsList.map((faq: any, idx: number) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 font-black text-xs sm:text-sm text-slate-800 hover:bg-slate-50/50 transition-colors"
                          >
                            <span className={language === 'ar' ? 'text-right' : 'text-left'}>{faq.question}</span>
                            <ChevronLeft
                              size={18}
                              className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                                isOpen ? (language === 'ar' ? '-rotate-90' : 'rotate-90') : (language === 'ar' ? '' : 'rotate-180')
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                              >
                                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-50 pt-3">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ── Advanced Details (Bottom) ── */}
          <div className="mt-10 sm:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-16">
            <div className="lg:col-span-2 space-y-16">

              {/* Modern Interactive Tabbed Interface */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 max-[340px]:p-1 overflow-x-auto no-scrollbar gap-2 max-[340px]:gap-1">
                  {[
                    { id: 'overview', label: language === 'ar' ? 'نظرة عامة والفوائد' : 'Overview & Benefits', icon: Sparkles },
                    { id: 'usage', label: t('prod_usage'), icon: CheckCircle2 },
                    { id: 'safety', label: language === 'ar' ? 'المكونات والتحذيرات' : 'Ingredients & Warnings', icon: ShieldCheck }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 max-[340px]:gap-1 px-3 max-[340px]:px-2.5 py-2.5 max-[340px]:py-2 rounded-xl sm:rounded-2xl text-xs max-[340px]:text-[10px] font-black transition-all whitespace-nowrap cursor-pointer ${isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                      >
                        <TabIcon className="w-4 h-4 max-[340px]:w-3.5 max-[340px]:h-3.5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tabs Content */}
                <div className="p-3 max-[340px]:p-2.5 xs:p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 max-[340px]:space-y-2.5 xs:space-y-6"
                      >
                        <h3 className="text-base max-[340px]:text-sm xs:text-lg font-black text-slate-800 flex items-center gap-2">
                          <span className="w-1 h-5 xs:w-1.5 xs:h-6 bg-primary rounded-full inline-block" />
                          {language === 'ar' ? 'لمحة عامة عن المكمل الغذائي' : 'Supplement Overview'}
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium text-xs max-[340px]:text-[11px] xs:text-sm whitespace-pre-line break-words">{getLocalizedValue(language, product.desc, product.descEn, translate)}</p>
                      </motion.div>
                    )}

                    {activeTab === 'usage' && (
                      <motion.div
                        key="usage"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 max-[340px]:space-y-2.5 xs:space-y-6"
                      >
                        <h3 className="text-base max-[340px]:text-sm xs:text-lg font-black text-slate-800 flex items-center gap-2">
                          <span className="w-1 h-5 xs:w-1.5 xs:h-6 bg-primary rounded-full inline-block" />
                          {t('prod_usage')}
                        </h3>
                        {product.usage ? (
                          <div className="bg-emerald-50/40 p-3 max-[340px]:p-2 rounded-2xl xs:rounded-3xl border border-emerald-100/50">
                            <p className="text-slate-700 leading-relaxed text-xs max-[340px]:text-[11px] xs:text-sm whitespace-pre-line font-medium break-words">{getLocalizedValue(language, product.usage, product.usageEn, translate)}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs max-[340px]:text-[11px] xs:text-sm italic">{language === 'ar' ? 'يرجى مراجعة ملصق العبوة للتعرف على طريقة الاستخدام المقسترحة.' : 'Please check the bottle label for suggested use.'}</p>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'safety' && (
                      <motion.div
                        key="safety"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 max-[340px]:space-y-2.5 xs:space-y-6"
                      >
                        {product.ingredients && (
                          <div className="space-y-2.5 max-[340px]:space-y-1.5 xs:space-y-3">
                            <h4 className="text-xs max-[340px]:text-[11px] xs:text-sm font-black text-slate-800">{language === 'ar' ? 'قائمة المكونات الكاملة:' : 'Full Ingredients List:'}</h4>
                            <p className="text-slate-600 text-xs max-[340px]:text-[11px] xs:text-sm leading-relaxed font-medium bg-slate-50 p-3 max-[340px]:p-2 rounded-2xl xs:rounded-3xl border border-slate-100 break-words">{getLocalizedValue(language, product.ingredients, product.ingredientsEn, translate)}</p>
                          </div>
                        )}
                        {product.warnings && (
                          <div className="space-y-2.5 max-[340px]:space-y-1.5 xs:space-y-3">
                            <h4 className="text-xs max-[340px]:text-[11px] xs:text-sm font-black text-red-600 flex items-center gap-1.5 xs:gap-2">
                              <ShieldCheck size={14} className="flex-shrink-0" />
                              {language === 'ar' ? 'تحذيرات هامة وإرشادات السلامة:' : 'Important Warnings & Safety Guidelines:'}
                            </h4>
                            <div className="bg-red-50/50 p-3 max-[340px]:p-2 rounded-2xl xs:rounded-3xl border border-red-100">
                              <p className="text-[11px] max-[340px]:text-[10px] xs:text-xs text-red-700/90 leading-relaxed font-bold italic whitespace-pre-line break-words">{getLocalizedValue(language, product.warnings, product.warningsEn, translate)}</p>
                            </div>
                          </div>
                        )}
                        {product.disclaimer && (
                          <div className="pt-3 xs:pt-4 border-t border-slate-100">
                            <span className="text-[9px] max-[340px]:text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 xs:mb-2">{language === 'ar' ? 'إخلاء مسؤولية قانوني' : 'Legal Disclaimer'}</span>
                            <p className="text-[9px] max-[340px]:text-[8px] text-slate-400 leading-relaxed italic break-words">{getLocalizedValue(language, product.disclaimer, product.disclaimerEn, translate)}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* {t('prod_facts')} Sidebar */}
            <div className="lg:col-span-1">
              {supplementFactsRows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="bg-slate-950 text-white rounded-[2rem] max-[340px]:rounded-[1.5rem] sm:rounded-[3rem] p-3 max-[340px]:p-2.5 xs:p-8 shadow-2xl border border-slate-800/80 sticky top-24 backdrop-blur-md relative overflow-hidden"
                >
                  {/* Subtle molecular background element */}
                  <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

                  <div className="border-b border-white/10 pb-4 mb-4 max-[340px]:pb-2.5 max-[340px]:mb-2.5">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-black tracking-widest uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      Premium Nutrient Sheet
                    </div>
                    <h3 className="text-xl max-[340px]:text-lg font-black italic uppercase tracking-tighter mb-1 text-slate-100">Supplement Facts</h3>
                    <div className="text-[10px] font-bold text-slate-400">{language === 'ar' ? 'الحصص لكل عبوة: بحسب الجرعة المطلوبة' : 'Servings per container: Varies by dosage'}</div>
                  </div>

                  <table className="w-full text-[9px] max-[340px]:text-[8px] xs:text-xs font-bold table-fixed">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/10">
                        <th className="py-2.5 max-[340px]:py-1.5 text-right font-black w-[50%] pr-1">{language === 'ar' ? 'العنصر الفعّال' : 'Active Ingredient'}</th>
                        <th className="py-2.5 max-[340px]:py-1.5 text-center w-[25%]">{language === 'ar' ? 'الكمية' : 'Amount'}</th>
                        <th className="py-2.5 max-[340px]:py-1.5 text-left font-black w-[25%] pl-1">{language === 'ar' ? 'القيمة اليومية%' : 'Daily Value %'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {supplementFactsRows.map((row: any, i: number) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <td className="py-2.5 max-[340px]:py-1.5 text-right text-slate-300 font-medium break-words pr-1">{translate(row.name || row.label)}</td>
                          <td className="py-2.5 max-[340px]:py-1.5 text-center text-emerald-400 font-mono font-black break-words">{row.amount}</td>
                          <td className="py-2.5 max-[340px]:py-1.5 text-left text-slate-400 font-mono break-words pl-1">{row.dv && row.dv !== '-' ? row.dv : '†'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 pt-4 max-[340px]:mt-3 max-[340px]:pt-3 border-t border-white/10 text-[9px] max-[340px]:text-[8px] text-slate-500 italic leading-relaxed">
                    {language === 'ar' ? '† القيمة اليومية غير محددة بعد.' : '† Daily Value not established.'}<br />
                    {language === 'ar' ? '* تعتمد النسبة المئوية على نظام غذائي مكون من 2000 سعرة حرارية.' : '* Percent Daily Values are based on a 2,000 calorie diet.'}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            className="mt-10 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              { icon: ShieldCheck, title: language === 'ar' ? 'منتج أصلي 100%' : '100% Authentic Product', color: 'text-emerald-600' },
              { icon: Truck, title: language === 'ar' ? 'توصيل سريع مجاني' : 'Fast Free Delivery', color: 'text-blue-500' },
              { icon: RotateCcw, title: language === 'ar' ? 'سياسة استرجاع مرنة' : 'Flexible Return Policy', color: 'text-amber-500' }
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="flex flex-col items-center gap-2 xs:gap-3 p-4 xs:p-8 rounded-xl xs:rounded-[2.5rem] bg-[#f0f7f4] border border-[#e8f0ed] trust-badge cursor-default"
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <badge.icon size={32} className={badge.color} />
                </div>
                <span className="font-black text-gray-800">{badge.title}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </main>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <section data-nosnippet className="py-12 sm:py-24 bg-slate-50/30 border-t border-slate-100/60">
          <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-14"
            >
              <div className="h-px flex-1 bg-slate-200" />
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-800 italic uppercase tracking-wider">
                {language === 'ar' ? 'منتجات مشابهة قد تعجبك' : 'Similar Products You Might Like'}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Articles Section */}
      {recommendedArticles.length > 0 && (
        <section data-nosnippet className="py-12 sm:py-24 bg-white border-t border-slate-100/60">
          <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-14"
            >
              <div className="h-px flex-1 bg-slate-200" />
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-800 italic uppercase tracking-wider">
                {language === 'ar' ? 'مقالات طبية مرشحة لك' : 'Recommended Medical Articles'}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedArticles.map((post, idx) => {
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
                      <Image 
                        src={postImage} 
                        alt={postTitle} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
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
          </div>
        </section>
      )}

      {/* ── Sticky Bottom CTA (mobile) ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-[68px] lg:bottom-6 left-1.5 right-1.5 max-[340px]:left-1 max-[340px]:right-1 xs:left-3 xs:right-3 sm:left-auto sm:right-6 sm:w-96 lg:right-8 z-50"
          >
            <div className="w-full bg-white rounded-[1.5rem] xs:rounded-[2rem] shadow-2xl border border-slate-100 p-1.5 max-[340px]:p-1 xs:p-4 flex items-center gap-1.5 max-[340px]:gap-1 xs:gap-4">
              <Image src={productImageThumb(product.image) || product.image} alt={mainImageAlt} width={72} height={72} className="w-9 h-9 max-[340px]:w-8 max-[340px]:h-8 rounded-xl xs:rounded-2xl object-contain bg-[#f0f7f4] p-1 border border-slate-100 flex-shrink-0" sizes="72px" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] xs:text-xs font-bold text-gray-500 truncate">{getLocalizedValue(language, product.title, product.titleEn, translate)}</p>
                <p className="text-xs max-[340px]:text-[11px] xs:text-lg font-black text-primary">{currentPrice} {t('currency')}</p>
              </div>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`flex-shrink-0 px-2 py-2.5 max-[340px]:px-1.5 max-[340px]:py-2 xs:px-5 xs:py-3 rounded-xl xs:rounded-2xl font-black text-[10px] max-[340px]:text-[9px] transition-all flex items-center gap-1 max-[340px]:gap-0.5 xs:gap-2 shadow-lg ${isAdded ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-primary/20'}`}
              >
                {isAdded ? <><Check className="w-3.5 h-3.5 max-[340px]:w-3 max-[340px]:h-3" /> {language === 'ar' ? 'تم' : 'Done'}</> : <><ShoppingCart className="w-3.5 h-3.5 max-[340px]:w-3 max-[340px]:h-3" /> {language === 'ar' ? 'أضف' : 'Add'}</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </>
  )
}
