"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-24" dir="rtl">
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                <Heart size={32} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">المفضلة</h1>
                <p className="text-gray-400 font-bold mt-1">لديك {wishlist.length} منتجات في قائمة أمنياتك</p>
              </div>
            </div>
            
            <Link href="/products" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              <span>متابعة التسوق</span>
              <ArrowLeft size={20} />
            </Link>
          </div>

          {/* Wishlist Content */}
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <AnimatePresence mode="popLayout">
                {wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <ProductCard {...item} />
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 left-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-95"
                      title="إزالة من المفضلة"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white rounded-[4rem] border border-[#e8f0ed] shadow-xl shadow-primary/5 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Heart size={48} className="text-gray-200" />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">قائمة المفضلة فارغة</h2>
              <p className="text-gray-400 font-bold mb-8 max-w-xs mx-auto">
                لم تقم بإضافة أي منتجات إلى قائمتك المفضلة حتى الآن. ابدأ باستكشاف منتجاتنا!
              </p>
              <Link 
                href="/products" 
                className="bg-primary text-white px-10 py-4 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3"
              >
                <ShoppingBag size={22} />
                تسوق الآن
              </Link>
            </motion.div>
          )}

          {/* Recently Viewed / Recommendations Placeholder */}
          {wishlist.length > 0 && (
            <div className="mt-24 p-12 bg-secondary/10 rounded-[4rem] border border-secondary/20 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black text-gray-800 mb-4">هل تحتاج إلى مساعدة؟</h3>
                 <p className="text-gray-600 font-bold max-w-xl mb-8">
                   فريقنا متاح دائماً لمساعدتك في اختيار أفضل المكملات الغذائية المناسبة لجسمك وأهدافك الصحية.
                 </p>
                 <Link href="https://wa.me/201026026511" className="bg-white text-black px-8 py-4 rounded-full font-bold shadow-md hover:bg-black hover:text-white transition-all inline-block">
                   تحدث معنا على واتساب
                 </Link>
               </div>
               <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
