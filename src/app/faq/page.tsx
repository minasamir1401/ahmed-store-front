import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl bg-white p-12 rounded-[3rem] shadow-sm">
          <h1 className="text-4xl font-black mb-8">الأسئلة الشائعة</h1>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-bold text-xl mb-2">كم يستغرق الشحن؟</h3>
              <p className="text-slate-600">يستغرق الشحن عادة من 2 إلى 4 أيام عمل.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-bold text-xl mb-2">ما هي طرق الدفع؟</h3>
              <p className="text-slate-600">نوفر الدفع عند الاستلام والدفع عبر المحافظ الإلكترونية.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
