"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { LayoutGrid, ChevronLeft, Loader2 } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data)
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
      <main className="min-h-screen bg-white pb-24" dir="rtl">
        
        {/* Page Header */}
        <div className="bg-[#f0f7f4] border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-3">تصفح الأقسام</h1>
            <p className="text-gray-500 font-bold">اكتشف مجموعتنا الواسعة من المكملات والمنتجات الصحية</p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {categories.map((cat, i) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.id}`}
                  className="group bg-white border border-[#e8f0ed] rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Background Decoration */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#f0f7f4] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-[#f0f7f4] rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white shadow-sm transition-all duration-500">
                      <LayoutGrid size={36} />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-black text-gray-800 group-hover:text-primary transition-colors">{cat.name}</h3>
                      <div className="inline-block bg-gray-50 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        {cat.count} منتج متوفر
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      تصفح القسم <ChevronLeft size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
