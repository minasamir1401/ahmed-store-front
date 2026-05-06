"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { Building2, ChevronLeft, Loader2, Package } from 'lucide-react'

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        setBrands(data)
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
      <main className="min-h-screen bg-[#f7fbf9] pb-24" dir="rtl">
        
        {/* Hero Section */}
        <div className="bg-white border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-4 tracking-tight">شركاء النجاح</h1>
            <p className="text-gray-500 font-bold text-lg">نحن نوفر لك أفضل العلامات التجارية العالمية الموثوقة</p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-16">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {brands.map((brand) => (
                <Link 
                  key={brand.id} 
                  href={`/brands/${brand.id}`}
                  className="group bg-white rounded-[2.5rem] p-8 border border-[#e8f0ed] hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-2 flex flex-col items-center gap-6"
                >
                  <div className="aspect-square w-full bg-gray-50 rounded-[1.5rem] p-4 flex items-center justify-center overflow-hidden border border-gray-50 group-hover:bg-white transition-all">
                    {brand.image ? (
                      <img src={brand.image} className="w-full h-full object-contain mix-blend-multiply" alt={brand.name} />
                    ) : (
                      <Building2 size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black text-gray-800 group-hover:text-primary transition-colors">{brand.name}</h3>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black text-primary uppercase opacity-0 group-hover:opacity-100 transition-all">
                      اكتشف المنتجات <ChevronLeft size={10} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && brands.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><Building2 size={40} /></div>
              <h3 className="text-xl font-black text-gray-400">لا توجد شركات حالياً</h3>
              <p className="text-sm text-gray-500 mt-2">نعمل على إضافة المزيد من الماركات قريباً</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
