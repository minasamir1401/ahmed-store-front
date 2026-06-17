"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useLanguage } from '@/context/LanguageContext'
import { productImageAlt, productMainImage } from '@/lib/product-images'
import { trackAddToCart, trackAddToWishlist } from '@/lib/tracking'

interface ProductCardProps {
  id: string
  title: string
  titleEn?: string | null
  price: number
  oldPrice?: number | null
  image: string
  imageAlt?: string | null
  imageWidth?: number | null
  imageHeight?: number | null
  tag?: string | null
  discountType?: string | null
  discountValue?: number | null
  desc?: string | null
}

export default function ProductCard({ id, title, titleEn, price, oldPrice, image, imageAlt, imageWidth, imageHeight, tag, discountType, discountValue, desc }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [imgError, setImgError] = React.useState(false)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { t, translate, language } = useLanguage()

  const isFavorite = isInWishlist(id)
  const isRtl = language === 'ar'

  const trimmedTitle = (title || '').trim()
  const displayTitle = trimmedTitle.startsWith('{') && trimmedTitle.endsWith('}')
    ? translate(title)
    : (language === 'en' ? (titleEn || translate(title)) : title)

  const getBilingualTitle = () => {
    if (trimmedTitle.startsWith('{') && trimmedTitle.endsWith('}')) {
      return title
    }
    return JSON.stringify({ ar: title, en: titleEn || title })
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addToCart({ id, title: getBilingualTitle(), price, image, quantity: 1 })
    
    // Track AddToCart event
    trackAddToCart({ id, title: displayTitle, price, image, quantity: 1 })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Track AddToWishlist event only when adding (not when removing)
    if (!isFavorite) {
      trackAddToWishlist({ id, title: displayTitle, price, image })
    }

    toggleWishlist({ id, title: getBilingualTitle(), price, image, categoryId: '' })
  }

  // Calculate discount tag
  let displayTag = tag
  if (!displayTag && discountType && discountValue) {
    if (discountType === 'percentage') {
      displayTag = language === 'ar' ? `خصم ${discountValue}%` : `${discountValue}% OFF`
    } else if (discountType === 'fixed') {
      displayTag = language === 'ar' ? `خصم ${discountValue} ج.م` : `${discountValue} EGP OFF`
    }
  }

  const discountPercent = oldPrice && price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null
  const imgAlt = productImageAlt({ imageAlt, title, titleEn }, displayTitle)
  const rawImage = productMainImage(image)
  const cardImage = (!imgError && rawImage) ? rawImage : null

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl overflow-hidden relative group"
      style={{ border: '1px solid #e8f0ed', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      {/* Wishlist Button */}
      <motion.button
        onClick={handleWishlist}
        whileTap={{ scale: 0.85 }}
        aria-label={t('wishlist')}
        className={cn(
          "absolute top-1.5 left-1.5 z-10 w-11 h-11 flex items-center justify-center rounded-full shadow-sm transition-all duration-300",
          isFavorite ? "bg-primary text-white scale-105" : "bg-white/90 text-muted hover:text-primary hover:bg-white"
        )}
      >
        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        {/* Ripple on favorite */}
        {isFavorite && (
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow" />
        )}
      </motion.button>

      {/* Added overlay */}
      <AnimatePresence>
        {isAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 xs:gap-2 text-white rounded-2xl"
            style={{ background: 'rgba(46,125,94,0.93)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Check size={28} className="xs:w-[36px] xs:h-[36px]" />
            </motion.div>
            <span className="font-bold text-xs xs:text-sm">{language === 'ar' ? 'تمت الإضافة!' : 'Added!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Image */}
      <Link href={`/product/${id}`} className="block">
        <div className="aspect-square overflow-hidden flex items-center justify-center p-2 xs:p-4 relative" style={{ background: '#f0f7f4' }}>
          {/* Discount Badge */}
          {(displayTag || discountPercent) && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
              className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] xs:text-[10px] font-black px-1.5 xs:px-2 py-0.5 rounded-full z-10 shadow-md"
            >
              {displayTag || (language === 'ar' ? `${discountPercent}% خصم` : `${discountPercent}% OFF`)}
            </motion.div>
          )}

          <div className="relative w-full h-full">
            {cardImage ? (
              <Image
                src={cardImage}
                alt={imgAlt}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="text-[9px] font-bold text-primary/60">{language === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
              </div>
            )}
          </div>

          {/* Hover shine overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ x: '-100%', skewX: -15 }}
                animate={{ x: '200%', skewX: -15 }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Content */}
      <div className={cn("p-2 xs:p-3 space-y-1 xs:space-y-1.5", isRtl ? "text-right" : "text-left")}>
        <Link href={`/product/${id}`}>
          <h3 className="text-xs xs:text-sm font-bold text-gray-800 line-clamp-2 hover:text-green-700 transition-colors" style={{ lineHeight: '1.4' }}>
            {displayTitle}
          </h3>
        </Link>

        {/* Stars mini */}
        <div
          className={cn("flex items-center gap-0.5", isRtl ? "justify-end" : "justify-start")}
          role="img"
          aria-label={language === 'ar' ? 'التقييم: 4.9 من 5 نجوم' : 'Rating: 4.9 out of 5 stars'}
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={8} className="text-amber-400 xs:w-[10px] xs:h-[10px]" fill="currentColor" aria-hidden="true" />
          ))}
          <span className="text-[8px] xs:text-[10px] text-gray-600 font-bold mr-0.5 xs:mr-1" aria-hidden="true">(4.9)</span>
        </div>

        {/* Price */}
        <div className={cn("flex flex-wrap items-center gap-1 xs:gap-2 pt-0.5", isRtl ? "justify-end" : "justify-start")}>
          {oldPrice && (
            <span className="text-[10px] xs:text-xs text-gray-500 line-through">{oldPrice} {t('currency')}</span>
          )}
          <span className="text-xs xs:text-sm font-black" style={{ color: '#2e7d5e' }}>{price} {t('currency')}</span>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold transition-all overflow-hidden relative"
          style={{ background: '#f0f7f4', color: '#2e7d5e', border: '1px solid #cde8df' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#2e7d5e'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#f0f7f4'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#2e7d5e'
          }}
        >
          <ShoppingCart size={14} />
          <span>{t('add_to_cart')}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
