"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  id: string
  title: string
  price: number
  oldPrice?: number | null
  image: string
  tag?: string | null
  discountType?: string | null
  discountValue?: number | null
  desc?: string | null
}

import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { Heart } from 'lucide-react'

export default function ProductCard({ id, title, price, oldPrice, image, tag, discountType, discountValue, desc }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const isFavorite = isInWishlist(id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addToCart({
      id,
      title,
      price,
      image,
      quantity: 1
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({ id, title, price, image, categoryId: '' })
  }

  // Calculate discount tag dynamically
  let displayTag = tag
  if (!displayTag && discountType && discountValue) {
    if (discountType === 'percentage') {
      displayTag = `خصم ${discountValue}%`
    } else if (discountType === 'fixed') {
      displayTag = `خصم ${discountValue} ج.م`
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden group relative" style={{ border: '1px solid #e8f0ed', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      
      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className={cn(
          "absolute top-2 left-2 z-10 p-1.5 rounded-full shadow-sm transition-all duration-300",
          isFavorite ? "bg-primary text-white scale-110" : "bg-white/80 text-muted hover:text-primary hover:bg-white"
        )}
      >
        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {/* Added overlay */}
      <AnimatePresence>
        {isAdded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-white rounded-2xl"
            style={{ background: 'rgba(46,125,94,0.92)' }}
          >
            <Check size={36} />
            <span className="font-bold text-sm">تمت الإضافة!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Image */}
      <Link href={`/product/${id}`} className="block">
        <div className="aspect-square overflow-hidden flex items-center justify-center p-4 relative" style={{ background: '#f0f7f4' }}>
          {displayTag && (
             <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
                {displayTag}
             </div>
          )}
          <img
            src={image || 'https://placehold.co/400x400?text=No+Image'}
            alt={title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 text-right space-y-1.5">
        {/* Title */}
        <Link href={`/product/${id}`}>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 hover:text-green-700 transition-colors" style={{ lineHeight: '1.4' }}>
            {title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-end gap-2 pt-0.5">
          {oldPrice && (
            <span className="text-xs text-gray-400 line-through">{oldPrice} جنيه</span>
          )}
          <span className="text-sm font-black" style={{ color: '#2e7d5e' }}>{price} جنيه</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
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
          <ShoppingCart size={13} />
          أضف إلى السلة
        </button>
      </div>
    </div>
  )
}
