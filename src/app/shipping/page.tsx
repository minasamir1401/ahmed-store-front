import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl bg-white p-12 rounded-[3rem] shadow-sm">
          <h1 className="text-4xl font-black mb-8">سياسة الشحن</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            نحن نشحن لجميع محافظات مصر. تكلفة الشحن تختلف حسب المحافظة وتظهر عند إتمام الطلب.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
