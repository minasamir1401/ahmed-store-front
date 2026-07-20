"use client"

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Truck, MapPin, Loader2, Info } from 'lucide-react'
import { BACKEND_API } from '@/app/admin/admin-dashboard-utils'

export default function ShippingPage() {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_API}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.shipping_rates) {
          try {
            setRates(JSON.parse(data.shipping_rates))
          } catch (e) {
            console.error(e)
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 dir-rtl font-cairo">
      <Header />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4 mb-12">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <Truck size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">أسعار الشحن والتوصيل</h1>
          <p className="text-slate-500 font-bold max-w-lg mx-auto">نسعى دائماً لتوفير أسرع خدمة توصيل وبأفضل الأسعار لجميع محافظات ومراكز الجمهورية.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-500 space-y-4">
            <Loader2 className="animate-spin" size={32} />
            <span className="font-bold text-slate-500">جاري تحميل الأسعار...</span>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
            {Object.keys(rates).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(rates).map(([loc, price]) => (
                  <div key={loc} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                        <MapPin size={18} />
                      </div>
                      <span className="font-bold text-slate-700">{loc}</span>
                    </div>
                    <span className="font-black text-blue-600 text-lg bg-blue-100 px-3 py-1 rounded-lg">{price} ج.م</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Info size={48} className="mx-auto text-slate-300" />
                <h3 className="text-xl font-bold text-slate-600">لا توجد أسعار شحن مضافة حالياً</h3>
                <p className="text-slate-400">يرجى مراجعة الموقع لاحقاً للتعرف على أحدث تحديثات الأسعار.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
