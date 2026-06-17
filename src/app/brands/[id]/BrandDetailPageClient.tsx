"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Loader2, Package, ChevronLeft } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { newestProducts } from '@/lib/product-display'

export default function BrandDetailPageClient({ params, initialBrand, initialProducts }: { params: { id: string }, initialBrand: any, initialProducts: any[] }) {
  const brandId = params.id
  const { t, language, dir, translate } = useLanguage()
  
  const [brand, setBrand] = useState<any>(initialBrand)
  const [products, setProducts] = useState<any[]>(initialProducts || [])
  const [loading, setLoading] = useState(!initialBrand)
  const router = useRouter()

  useEffect(() => {
    if (brand) {
      document.title = `${translate(brand.name)} | The VitaHub`
    } else {
      document.title = language === 'ar' ? 'الشركة غير موجودة | The VitaHub' : 'Brand Not Found | The VitaHub'
    }
  }, [brand, language, translate])

  useEffect(() => {
    // Keep data fresh via hydration fetch, but skip spinner if we have initial state
    Promise.all([
      fetch(`/api/brands`),
      fetch(`/api/products`)
    ])
    .then(async ([brandRes, prodRes]) => {
      const allBrands = await brandRes.json()
      const allProds = await prodRes.json()
      
      const currentBrand = allBrands.find((b: any) => b.id === brandId)
      const brandProds = newestProducts(allProds.filter((p: any) => p.brandId === brandId))
      
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white" dir={dir}>
        <h1 className="text-2xl font-black text-gray-800">
          {language === 'ar' ? 'الشركة غير موجودة' : 'Brand not found'}
        </h1>
        <button onClick={() => router.back()} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold cursor-pointer">
          {language === 'ar' ? 'العودة' : 'Back'}
        </button>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-24" dir={dir}>
        
        {/* Brand Hero */}
        <div className="bg-white border-b border-[#e8f0ed]">
          <div className="max-w-screen-xl mx-auto px-4 py-12 flex flex-col items-center">
             <div className="w-32 h-32 bg-[#f0f7f4] rounded-[2.5rem] p-6 mb-6 shadow-sm border border-gray-50 overflow-hidden flex items-center justify-center relative">
                <BrandLogo image={brand.image} name={brand.name} size={110} className="bg-transparent border-none" />
             </div>
             <h1 className="text-3xl font-black text-gray-800">{translate(brand.name)}</h1>
             <p className="text-gray-400 font-bold mt-2">
               {language === 'ar' ? `عرض كافة منتجات ${translate(brand.name)}` : `Showing all products of ${translate(brand.name)}`}
             </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-screen-xl mx-auto px-4 py-12">
           <div className="flex items-center gap-3 mb-8">
              <Package size={20} className="text-primary" />
              <h2 className="text-xl font-black text-gray-800">
                {language === 'ar' ? `منتجات الشركة (${products.length})` : `Brand Products (${products.length})`}
              </h2>
           </div>

           {products.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {products.map(p => <ProductCard key={p.id} {...p} />)}
             </div>
           ) : (
             <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold">
                  {language === 'ar' ? 'لا توجد منتجات مسجلة لهذه الشركة حالياً' : 'No products registered for this brand currently'}
                </p>
             </div>
           )}
        </div>
      </main>
      <Footer />
    </>
  )
}
