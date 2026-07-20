"use client"

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShieldCheck, Loader2, Info, ArrowLeft } from 'lucide-react'
import { BACKEND_API } from '@/app/admin/admin-dashboard-utils'
import Link from 'next/link'

export default function ReturnsPage() {
  const [returnPolicy, setReturnPolicy] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_API}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.return_policy) {
          setReturnPolicy(data.return_policy)
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
          <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">سياسة الاستبدال والاسترجاع</h1>
          <p className="text-slate-500 font-bold max-w-lg mx-auto">نحن نضمن لك حقوقك كاملة، تعرف على شروط وخطوات إرجاع المنتجات واسترداد أموالك بأمان.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-500 space-y-4">
            <Loader2 className="animate-spin" size={32} />
            <span className="font-bold text-slate-500">جاري تحميل السياسة...</span>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 leading-loose">
            {returnPolicy ? (
              <div className="text-slate-700 font-semibold whitespace-pre-wrap">
                {returnPolicy}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Info size={48} className="mx-auto text-slate-300" />
                <h3 className="text-xl font-bold text-slate-600">سياسة الإرجاع قيد التحديث</h3>
                <p className="text-slate-400">نعمل حالياً على صياغة سياسة الاستبدال والاسترجاع، يرجى العودة لاحقاً.</p>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
                العودة للصفحة الرئيسية
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
