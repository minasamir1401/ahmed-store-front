"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import { Building2, Loader2, Package, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const brandId = params.id
  
  const [brand, setBrand] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // In a real app, you might have a direct endpoint for brand + products
    // Here we fetch all and filter for simplicity, or we could add GET /api/brands/:id
    Promise.all([
      fetch(`/api/brands`),
      fetch(`/api/products`)
    ])
    .then(async ([brandRes, prodRes]) => {
      const allBrands = await brandRes.json()
      const allProds = await prodRes.json()
      
      const currentBrand = allBrands.find((b: any) => b.id === brandId)
      const brandProds = allProds.filter((p: any) => p.brandId === brandId)
      
      setBrand(currentBrand)
      setProducts(brandProds)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [brandId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white" dir="rtl">
        <h1 className="text-2xl font-black text-gray-800">الشركة غير موجودة</h1>
        <button onClick={() => router.back()} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold">العودة</button>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-24" dir="rtl">
        
        {/* Brand Hero */}
        <div className="bg-white border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-12 flex flex-col items-center">
             <div className="w-32 h-32 bg-[#f0f7f4] rounded-[2.5rem] p-6 mb-6 shadow-sm border border-gray-50 overflow-hidden flex items-center justify-center">
                {brand.image ? <img src={brand.image} className="w-full h-full object-contain mix-blend-multiply" /> : <Building2 size={40} className="text-primary" />}
             </div>
             <h1 className="text-3xl font-black text-gray-800">{brand.name}</h1>
             <p className="text-gray-400 font-bold mt-2">عرض كافة منتجات {brand.name}</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-screen-xl mx-auto px-4 py-12">
           <div className="flex items-center gap-3 mb-8">
              <Package size={20} className="text-primary" />
              <h2 className="text-xl font-black text-gray-800">منتجات الشركة ({products.length})</h2>
           </div>

           {products.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {products.map(p => <ProductCard key={p.id} {...p} />)}
             </div>
           ) : (
             <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold">لا توجد منتجات مسجلة لهذه الشركة حالياً</p>
             </div>
           )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
