"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
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
      <main className="min-h-screen pb-20 md:pb-12" style={{ background: '#f7fbf9' }}>

        {/* Page Title Bar */}
        <div className="bg-white border-b" style={{ borderColor: '#e8f0ed' }}>
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between" dir="rtl">
            <h1 className="text-xl font-black text-gray-800">جميع المنتجات</h1>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                style={{ border: '1px solid #cde8df', background: '#f0f7f4', color: '#2e7d5e' }}
              >
                <SlidersHorizontal size={15} />
                تصفية
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                style={{ border: '1px solid #cde8df', background: '#f0f7f4', color: '#2e7d5e' }}
              >
                الترتيب
                <ChevronDown size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-screen-xl mx-auto px-4 py-8" dir="rtl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="mt-10 flex justify-center">
            <button
              className="px-8 py-3 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: '#2e7d5e' }}
            >
              تحميل المزيد
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
