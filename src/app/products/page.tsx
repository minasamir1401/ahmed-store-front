"use client"

import React, { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')
  
  const [products, setProducts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])
        const prodData = await prodRes.json()
        const catData = await catRes.json()
        
        setProducts(prodData)
        setCategories(catData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = categoryId 
    ? products.filter(p => p.categoryId === categoryId)
    : products

  const categoryName = categoryId 
    ? categories.find(c => c.id === categoryId)?.name || 'القسم'
    : 'جميع المنتجات'

  return (
    <main className="min-h-screen pb-20 md:pb-12" style={{ background: '#f7fbf9' }}>
      {/* Page Title Bar */}
      <div className="bg-white border-b" style={{ borderColor: '#e8f0ed' }}>
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between" dir="rtl">
          <h1 className="text-xl font-black text-gray-800">{categoryName}</h1>
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
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm">
             <div className="text-gray-200 mb-4"><SlidersHorizontal size={64} /></div>
             <h3 className="text-xl font-black text-gray-800">لا توجد منتجات في هذا القسم حالياً</h3>
             <p className="text-gray-400 font-bold mt-2">انتظرونا قريباً، جاري إضافة منتجات مميزة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredProducts.map((product) => (
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
  )
}

export default function ProductsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7fbf9]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
      <BottomNav />
    </>
  )
}
