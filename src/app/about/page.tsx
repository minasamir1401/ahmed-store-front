import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl bg-white p-12 rounded-[3rem] shadow-sm">
          <h1 className="text-4xl font-black mb-8">عن مثالي</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            مثالي هو متجرك الأول للمنتجات الصحية والعناية بالجسم في مصر. نحن نهتم بتقديم أفضل المنتجات العالمية لضمان صحتك وجمالك.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
