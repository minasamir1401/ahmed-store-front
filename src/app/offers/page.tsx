"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import { Percent, Clock, Loader2, Tag } from 'lucide-react'

export default function OffersPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Filter products that have a discount (oldPrice > price OR discountType is set)
        const discounted = data.filter((p: any) => (p.oldPrice && p.oldPrice > p.price) || (p.discountType && p.discountValue))
        setProducts(discounted)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen pb-24 bg-[#f7fbf9]">
        
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-100 overflow-hidden relative">
          <div className="max-w-screen-xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-right space-y-6 order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                  <Percent size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">أقوى عروض التوفير</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-800 leading-tight">
                  عروض حصرية <br />
                  <span className="text-primary italic">لا تُقاوم</span>
                </h1>
                <p className="text-gray-500 text-lg">خصومات حقيقية على مجموعة مختارة من المنتجات المتميزة</p>
                <div className="flex items-center gap-3 text-red-500 font-bold bg-red-50 w-fit px-6 py-3 rounded-2xl border border-red-100 shadow-sm">
                  <Clock size={20} className="animate-pulse" />
                  <span>العروض لفترة محدودة!</span>
                </div>
              </div>
              <div className="relative order-1 md:order-2">
                <div className="aspect-square bg-primary/5 rounded-[3rem] p-12 relative overflow-hidden shadow-inner">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                   <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full -ml-20 -mb-20 blur-3xl" />
                   <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl rotate-3 relative z-10">
                     <img src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80" className="w-full h-full object-cover rounded-[2rem]" />
                   </div>
                </div>
                <div className="absolute -bottom-8 -right-8 bg-primary text-white p-10 rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-2xl -rotate-12 border-8 border-white">
                  <span className="text-3xl font-black italic">50%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1">توفير</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discounted Products Grid */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4" dir="rtl">
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-3">
                 <div className="bg-primary p-3 rounded-2xl text-white shadow-lg shadow-primary/20"><Tag size={24} /></div>
                 <div><h2 className="text-2xl font-black text-gray-800">منتجات بأسعار خاصة</h2><p className="text-xs text-gray-400 font-bold">كل العروض الحالية في مكان واحد</p></div>
               </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><Percent size={40} /></div>
                    <h3 className="text-xl font-black text-gray-400">لا توجد عروض حالياً</h3>
                    <p className="text-sm text-gray-500 mt-2">ترقبوا أقوى العروض قريباً جداً</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
