"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { ShoppingCart, Loader2 } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [hero, setHero] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJson = async (url: string) => {
      const res = await fetch(url)
      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const body = isJson ? await res.json() : await res.text()

      if (!res.ok) {
        const message = isJson
          ? body?.error || body?.message
          : `Request failed with status ${res.status}`
        throw new Error(message || 'Unexpected API error')
      }

      return body
    }

    Promise.all([
      fetchJson('/api/products'),
      fetchJson('/api/hero')
    ])
      .then(([productsData, heroData]) => {
        setProducts(productsData.slice(0, 6))
        setHero(heroData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const features = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      title: 'شحن سريع',
      sub: 'توصيل سريع وآمن',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      title: 'إرجاع سهل',
      sub: 'إرجاع خلال 7 أيام',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      title: 'ضمان جودة',
      sub: 'منتجات أصلية 100%',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.67 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.57 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 7 7l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 16.92z"/></svg>,
      title: 'خدمة عملاء مميزة',
      sub: 'نحن هنا لمساعدتك',
    },
  ]

  return (
    <>
      <Header />
      <main className="flex-1 pb-20 md:pb-0 bg-white">
        
        <section className="bg-white py-5">
          <div className="max-w-screen-xl mx-auto px-4" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '440px' }}>
              <div className="lg:col-span-2 rounded-2xl overflow-hidden relative" style={{ background: '#e8f5f0', minHeight: '440px' }}>
                {!hero ? (
                  <div className="absolute inset-0 bg-gray-50 animate-pulse" />
                ) : (
                  <div className="absolute inset-0 flex items-center">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 text-right">
                      <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-2">{hero.title}</h1>
                      <p className="text-sm text-gray-600 mb-6">{hero.subtitle}</p>
                      <Link href={hero.buttonLink} className="inline-block px-8 py-3 text-white rounded-full text-sm font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-all">{hero.buttonText}</Link>
                    </div>
                    <img src={hero.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-l from-[#e8f5f0]/95 via-[#e8f5f0]/60 to-transparent z-1" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <Link href={hero?.side1Link || '/categories'} className="flex-1 rounded-2xl overflow-hidden relative flex items-center bg-[#f0f7f4]">
                  {!hero ? <div className="absolute inset-0 bg-gray-50 animate-pulse" /> : (
                    <>
                      <img src={hero.side1Image} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                      <div className="relative z-10 p-5 text-right"><h3 className="text-lg font-bold text-gray-800">{hero.side1Title}</h3><p className="text-xs text-gray-600 mt-1">{hero.side1Desc}</p></div>
                    </>
                  )}
                </Link>
                <Link href={hero?.side2Link || '/offers'} className="flex-1 rounded-2xl overflow-hidden relative flex items-center bg-[#faf5f0]">
                  {!hero ? <div className="absolute inset-0 bg-gray-50 animate-pulse" /> : (
                    <>
                      <img src={hero.side2Image} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                      <div className="relative z-10 p-5 text-right"><h3 className="text-lg font-bold text-gray-800">{hero.side2Title}</h3><p className="text-xs text-gray-600 mt-1">{hero.side2Desc}</p></div>
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-4" dir="rtl">
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="flex items-center gap-2 text-2xl font-black text-gray-800 italic uppercase tracking-widest">المضاف حديثاً</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            )}

            <div className="mt-16 text-center">
              <Link href="/products" className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                مشاهدة كافة المنتجات
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4" dir="rtl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="bg-primary/5 p-4 rounded-2xl">{f.icon}</div>
                  <div>
                    <h4 className="font-black text-gray-800">{f.title}</h4>
                    <p className="text-xs text-gray-500 font-bold mt-1">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
