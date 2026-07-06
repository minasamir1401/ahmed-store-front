"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, MapPin, Truck, CheckCircle2, Clock, AlertCircle, ShoppingBag, ArrowLeft, Send, Trash2, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { useLanguage } from '@/context/LanguageContext'

export default function TrackOrderPage() {
  const { token } = useAuth()
  const { showAlert, showConfirm } = useModal()
  const { t, language, dir, translate } = useLanguage()
  const [orderNumber, setOrderNumber] = useState('')
  const [trackPhone, setTrackPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const [whatsappNumber, setWhatsappNumber] = useState('01201450111')

  // Set document title
  useEffect(() => {
    document.title = t('track_title')
  }, [language, t])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
      })
      .catch(err => console.error('Error fetching settings in track page:', err))
  }, [])

  const fetchLatestOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setUserOrders(data)
          setOrder(null) // clear searched order to show list
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Automatically load the latest order if the user is logged in
  useEffect(() => {
    if (token) {
      queueMicrotask(() => fetchLatestOrder())
    }
  }, [token])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !trackPhone.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    // Clean order number format
    let cleanNumber = orderNumber.trim().toUpperCase()
    if (cleanNumber.startsWith('#')) {
      cleanNumber = cleanNumber.substring(1)
    }
    if (!cleanNumber.startsWith('ORD-') && /^\d+$/.test(cleanNumber)) {
      cleanNumber = `ORD-${cleanNumber}`
    }

    try {
      const res = await fetch(`/api/orders/track/${cleanNumber}?phone=${encodeURIComponent(trackPhone.trim())}`)
      const data = await res.json()
      
      if (res.ok) {
        setOrder(data)
        setUserOrders([]) // Clear user orders so we display only the searched one
      } else {
        setError(language === 'ar' 
          ? 'لم يتم العثور على هذا الطلب، يرجى التحقق من الرقم والمحاولة مرة أخرى.' 
          : 'Order not found, please check the order number and try again.'
        )
      }
    } catch (err) {
      console.error(err)
      setError(language === 'ar' 
        ? 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً.' 
        : 'An error occurred while connecting to the server. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const confirmText = language === 'ar'
      ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب وحذفه؟ لا يمكن التراجع عن هذا الإجراء وسوف يختفي من لوحة التحكم كذلك.'
      : 'Are you sure you want to cancel and delete this order? This action cannot be undone and it will disappear from your dashboard.'
    const confirmTitle = language === 'ar' ? 'تأكيد إلغاء الطلب' : 'Confirm Cancellation'

    const confirm = await showConfirm(confirmText, confirmTitle)
    if (!confirm) return

    setCancellingId(orderId)
    try {
      const res = await fetch(`/api/my-orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const successText = language === 'ar' ? 'تم إلغاء الطلب وحذفه بنجاح.' : 'Order cancelled and deleted successfully.'
        const successTitle = language === 'ar' ? 'تم الإلغاء' : 'Cancelled'
        await showAlert(successText, successTitle)
        
        // Remove from local states
        if (order && order.id === orderId) {
          setOrder(null)
        }
        if (userOrders.length > 0) {
          setUserOrders(prev => prev.filter(o => o.id !== orderId))
        }
        
        // Refetch to sync state
        if (token) {
          fetchLatestOrder()
        }
      } else {
        const errorData = await res.json()
        const failText = errorData.error || (language === 'ar' ? 'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.' : 'Failed to cancel order. Please try again.')
        const failTitle = language === 'ar' ? 'خطأ' : 'Error'
        await showAlert(failText, failTitle)
      }
    } catch (err) {
      console.error(err)
      const errText = language === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'An error occurred while connecting to the server.'
      const errTitle = language === 'ar' ? 'خطأ' : 'Error'
      await showAlert(errText, errTitle)
    } finally {
      setCancellingId(null)
    }
  }

  const ordersToDisplay = userOrders.length > 0 ? userOrders : (order ? [order] : [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50/50 pb-24 md:pb-16" dir={dir}>
        {/* Page Banner Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white py-16 md:py-24 px-4 border-b border-white/10 shadow-lg">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />
          
          {/* Dot Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="container mx-auto max-w-4xl text-center space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-bold tracking-wide"
            >
              <Truck size={14} className="text-emerald-400" />
              <span>{language === 'ar' ? 'تحديثات فورية لحالة شحنتك' : 'Real-time shipment updates'}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight"
            >
              {language === 'ar' ? (
                <>تتبع مسار <span className="text-emerald-400">طلبك</span></>
              ) : (
                <>Track Your <span className="text-emerald-400">Order</span></>
              )}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm md:text-base text-slate-300 font-medium max-w-md mx-auto leading-relaxed"
            >
              {language === 'ar'
                ? 'أدخل رقم الطلب الخاص بك لمتابعة تجهيزه وحالة شحنه لحظة بلحظة حتى وصوله إليك.'
                : 'Enter your order number to trace its preparation and shipping status in real-time until delivery.'
              }
            </motion.p>

            {/* Tracking Search Form inside Glass container */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleTrack} 
              className="max-w-lg mx-auto pt-6"
            >
              <div className="relative flex p-1.5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] shadow-2xl focus-within:ring-4 focus-within:ring-emerald-500/30 transition-all">
                <input 
                  type="text" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={language === 'ar' ? 'رقم الطلب (ORD-1001)' : 'Order Number (ORD-1001)'}
                  className={`w-full h-14 px-6 outline-none font-bold text-white placeholder-slate-400 bg-transparent text-base ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}
                  required
                />
                <input
                  type="tel"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                  className={`w-full h-14 px-6 outline-none font-bold text-white placeholder-slate-400 bg-transparent text-base border-x border-white/10 ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600 disabled:opacity-75 text-white px-8 h-14 rounded-2xl font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
                >
                  {loading ? (
                    <Clock size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Search size={18} />
                      <span>{t('track_btn')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </div>

        {/* Tracking Results Area */}
        <div className="container mx-auto px-4 max-w-4xl mt-12">
          {token && userOrders.length === 0 && order && (
            <div className="text-center mb-8">
              <button
                type="button"
                onClick={fetchLatestOrder}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs transition-all border border-slate-200/80 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <ArrowLeft size={14} className={language === 'en' ? 'text-primary' : 'rotate-180 text-primary'} />
                {language === 'ar' ? 'الرجوع لعرض كل طلباتي' : 'Back to all my orders'}
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start gap-4 text-red-700 mb-8"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <h4 className="font-black text-sm">{language === 'ar' ? 'عذراً! حدث خطأ' : 'Sorry! An error occurred'}</h4>
                  <p className="text-xs font-bold leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}

            {ordersToDisplay.length > 0 ? (
              <div className="space-y-12">
                {ordersToDisplay.map((ord: any, idx: number) => {
                  return (
                    <motion.div
                      key={ord.id || ord.orderNumber}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring', damping: 25, stiffness: 200 }}
                      className="space-y-8"
                    >
                      {/* Premium Header showing Order index if multiple */}
                      {ordersToDisplay.length > 1 && (
                        <div className="flex items-center justify-between px-2 pt-4">
                          <span className="text-xs font-black text-slate-400">
                            {language === 'ar' 
                              ? `الطلب ${idx + 1} من ${ordersToDisplay.length}` 
                              : `Order ${idx + 1} of ${ordersToDisplay.length}`
                            }
                          </span>
                          <span className="w-16 h-[1px] bg-slate-200 flex-grow mx-4"></span>
                        </div>
                      )}

                      {/* Card layout wrapper */}
                      <div className="grid lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Main status and tracking card */}
                        <div className="lg:col-span-2 space-y-8">
                          
                          {/* Status and Progress bar */}
                          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/80 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                  <ShoppingBag size={24} />
                                </div>
                                <div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {language === 'ar' ? 'تفاصيل الشحنة' : 'Shipment Details'}
                                  </div>
                                  <h2 className="text-xl font-black text-slate-800">#{ord.orderNumber}</h2>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {language === 'ar' ? 'تاريخ الشراء' : 'Purchase Date'}
                                  </div>
                                  <div className="text-sm font-bold text-slate-600">
                                    {new Date(ord.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </div>
                                </div>
                                <span className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 ${
                                  ord.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' :
                                  ord.status === 'shipped' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
                                  ord.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200/50' :
                                  'bg-green-50 text-green-600 border border-green-200/50'
                                }`}>
                                  {ord.status === 'pending' ? (language === 'ar' ? 'قيد الانتظار' : 'Pending') :
                                   ord.status === 'shipped' ? (language === 'ar' ? 'جاري الشحن' : 'Shipped') :
                                   ord.status === 'cancelled' ? (language === 'ar' ? 'تم الإلغاء' : 'Cancelled') :
                                   (language === 'ar' ? 'تم التوصيل' : 'Delivered')}
                                </span>
                              </div>
                            </div>

                            {/* Tracking Timeline */}
                            {ord.status !== 'cancelled' ? (
                              <div className="py-6">
                                {/* Horizontal timeline for desktop */}
                                <div className="hidden md:flex justify-between items-center relative px-6">
                                  <div className="absolute top-5 left-10 right-10 h-1 bg-slate-100 z-0 rounded-full" />
                                  <div 
                                    className="absolute top-5 left-10 h-1 bg-emerald-500 transition-all duration-1000 z-0 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    style={{ 
                                      width: ord.status === 'pending' ? '0%' : ord.status === 'shipped' ? '50%' : '100%' 
                                    }}
                                  />

                                  <div className="relative z-10 flex flex-col items-center w-1/3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border-4 border-white">
                                      <Clock size={16} />
                                    </div>
                                    <span className="text-xs font-black text-slate-800 mt-2">{language === 'ar' ? 'تم تأكيد الطلب' : 'Order Confirmed'}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'بدأنا في تجهيز منتجاتك' : 'Preparing your items'}</span>
                                  </div>

                                  <div className="relative z-10 flex flex-col items-center w-1/3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all ${
                                      ord.status === 'shipped' || ord.status === 'delivered'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                      <Truck size={16} />
                                    </div>
                                    <span className="text-xs font-black text-slate-800 mt-2">{language === 'ar' ? 'في الطريق إليك' : 'On the Way'}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'خرجت الشحنة للتوصيل' : 'Shipment out for delivery'}</span>
                                  </div>

                                  <div className="relative z-10 flex flex-col items-center w-1/3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all ${
                                      ord.status === 'delivered' 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                      <CheckCircle2 size={16} />
                                    </div>
                                    <span className="text-xs font-black text-slate-800 mt-2">{language === 'ar' ? 'تم الاستلام بنجاح' : 'Delivered Successfully'}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'وصلت شحنتك بسلام' : 'Your package arrived safely'}</span>
                                  </div>
                                </div>

                                {/* Vertical timeline for mobile screens */}
                                <div className="md:hidden flex flex-col gap-8 relative pr-6">
                                  <div className="absolute top-3 bottom-3 right-[19px] w-1 bg-slate-100 z-0 rounded-full" />
                                  <div 
                                    className="absolute top-3 right-[19px] w-1 bg-emerald-500 transition-all duration-1000 z-0 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    style={{ 
                                      height: ord.status === 'pending' ? '0%' : ord.status === 'shipped' ? '50%' : '100%' 
                                    }}
                                  />

                                  <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border-4 border-white shrink-0">
                                      <Clock size={16} />
                                    </div>
                                    <div className="space-y-0.5 pt-1">
                                      <h4 className="text-xs font-black text-slate-800">{language === 'ar' ? 'تم تأكيد الطلب' : 'Order Confirmed'}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'بدأنا في تجهيز منتجاتك' : 'Preparing your items'}</p>
                                    </div>
                                  </div>

                                  <div className="relative z-10 flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shrink-0 transition-all ${
                                      ord.status === 'shipped' || ord.status === 'delivered'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                      <Truck size={16} />
                                    </div>
                                    <div className="space-y-0.5 pt-1">
                                      <h4 className="text-xs font-black text-slate-800">{language === 'ar' ? 'في الطريق إليك' : 'On the Way'}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'خرجت الشحنة مع المندوب للتوصيل' : 'Shipment out with courier'}</p>
                                    </div>
                                  </div>

                                  <div className="relative z-10 flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shrink-0 transition-all ${
                                      ord.status === 'delivered' 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                      <CheckCircle2 size={16} />
                                    </div>
                                    <div className="space-y-0.5 pt-1">
                                      <h4 className="text-xs font-black text-slate-800">{language === 'ar' ? 'تم الاستلام بنجاح' : 'Delivered Successfully'}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'وصلت شحنتك بسلام' : 'Your package arrived safely'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-50/50 border border-red-100 text-red-600 rounded-[1.5rem] p-6 flex items-center gap-4 text-sm font-bold">
                                <AlertCircle size={20} className="shrink-0" />
                                <span>{language === 'ar' ? 'تم إلغاء هذا الطلب وحذفه من قائمة الشحنات الجارية.' : 'This order was cancelled and removed from active shipments.'}</span>
                              </div>
                            )}

                            {/* Aramex / Tracking Reference Badge */}
                            {ord.shippingRef && (
                              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 mt-6">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 p-2 rounded-xl text-primary"><Truck size={18} /></div>
                                  <div className="text-xs">
                                    <span className="text-slate-400 font-bold">{language === 'ar' ? 'رقم تتبع الشحنة:' : 'Tracking Ref Number:'}</span>
                                    <span className="font-black text-slate-800 mr-2">{ord.shippingRef}</span>
                                  </div>
                                </div>
                                <a 
                                  href={`https://www.aramex.com/eg/${language}/track/results?shipmentNumber=${ord.shippingRef}`}
                                  target="_blank"
                                  className="text-xs bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-black transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                  {language === 'ar' ? 'تتبع عبر شركة الشحن' : 'Track via Courier'}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Ordered Items List */}
                          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-base font-black text-slate-800 border-b pb-3 flex items-center gap-2">
                              <ShoppingBag size={18} className="text-primary" /> {language === 'ar' ? 'المنتجات المطلوبة وتفاصيل الأوردر' : 'Ordered Items & Details'}
                            </h3>
                            <div className="divide-y divide-slate-50">
                              {ord.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50/40 rounded-2xl px-2 transition-all">
                                  <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <h4 className="text-sm font-black text-slate-800 truncate">{translate(item.title)}</h4>
                                      {item.size && <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{language === 'ar' ? `الحجم: ${item.size}` : `Size: ${item.size}`}</span>}
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-400 font-bold">{language === 'ar' ? `الكمية: x${item.quantity}` : `Quantity: x${item.quantity}`}</span>
                                      <span className="font-black text-primary text-sm">{item.price} {t('currency')}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Summary Total & Cancellation Action */}
                            <div className="pt-6 border-t border-slate-50 space-y-5">
                              <div className="space-y-3 text-sm font-bold text-slate-600">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">{language === 'ar' ? 'رسوم الشحن' : 'Shipping Fees'}</span>
                                  <span className="text-green-500 font-black">{ord.shippingFee === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `${ord.shippingFee} ${t('currency')}`}</span>
                                </div>
                                <div className="flex justify-between text-base font-black text-slate-800 border-t pt-4">
                                  <span>{language === 'ar' ? 'إجمالي الطلب' : 'Total Amount'}</span>
                                  <span className="text-primary text-xl font-black">{ord.total} {t('currency')}</span>
                                </div>
                              </div>

                              {/* Cancel Order Action */}
                              {ord.status === 'pending' && (
                                <div className="pt-2 border-t border-slate-50 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleCancelOrder(ord.id)}
                                    disabled={cancellingId === ord.id}
                                    className="bg-red-50 hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 text-red-500 px-6 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
                                  >
                                    {cancellingId === ord.id ? (
                                      <Clock size={14} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                    {language === 'ar' ? 'إلغاء هذا الطلب وحذفه' : 'Cancel and Delete Order'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sidebar info columns */}
                        <div className="space-y-8">
                          
                          {/* Delivery and Customer Info */}
                          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-base font-black text-slate-800 border-b pb-3 flex items-center gap-2">
                              <MapPin size={18} className="text-primary" /> {language === 'ar' ? 'بيانات وعنوان التوصيل' : 'Delivery Address & Details'}
                            </h3>
                            <div className="grid grid-cols-1 gap-6 text-sm font-bold text-slate-600">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                  <Clock size={16} />
                                </div>
                                <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <span className="text-slate-400 text-xs block mb-0.5">{language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</span>
                                  <span className="font-black text-slate-800">{ord.customerName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                  <Phone size={16} />
                                </div>
                                <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <span className="text-slate-400 text-xs block mb-0.5">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</span>
                                  <span className="font-black text-slate-800">{ord.customerPhone}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                  <MapPin size={16} />
                                </div>
                                <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  <span className="text-slate-400 text-xs block mb-0.5">{language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}</span>
                                  <span className="font-black text-slate-800">
                                    {translate(ord.governorate)} - {translate(ord.district)} - {ord.address}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Help / Support panel */}
                          <div className="bg-gradient-to-br from-emerald-950 to-teal-900 rounded-[2.5rem] p-8 shadow-lg shadow-emerald-950/10 text-white space-y-6">
                            <div className="space-y-2">
                              <h4 className="text-base font-black">{language === 'ar' ? 'تحتاج مساعدة بشأن هذا الطلب؟' : 'Need Help with this Order?'}</h4>
                              <p className="text-xs font-bold opacity-80 leading-relaxed">
                                {language === 'ar' 
                                  ? 'إذا واجهتك أي مشكلة بخصوص طلبك، أو تود الاستفسار عن التوصيل، تواصل مع فريق الدعم الفني مباشرة.'
                                  : 'If you face any issues with your order, or want to inquire about delivery, please contact our support team.'
                                }
                              </p>
                            </div>
                            <a 
                              href={`https://wa.me/20${whatsappNumber.replace(/^0/, '')}?text=${encodeURIComponent(
                                language === 'ar' 
                                  ? `أهلاً، أرغب في الاستفسار عن طلبي رقم #${ord.orderNumber}`
                                  : `Hello, I would like to inquire about my order #${ord.orderNumber}`
                              )}`}
                              target="_blank"
                              className="bg-emerald-500 hover:bg-emerald-400 text-white w-full py-4 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                              <Send size={14} /> {language === 'ar' ? 'تواصل معنا عبر واتساب' : 'Chat with us on WhatsApp'}
                            </a>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              // Empty State
              !error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 text-center space-y-6 max-w-lg mx-auto"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingBag size={36} className="text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">{language === 'ar' ? 'لا يوجد لديك أي طلبات نشطة' : 'No Active Orders'}</h3>
                    <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                      {language === 'ar'
                        ? 'أنت لست مسجلاً أو لا تمتلك طلبات جارية حالياً. تفضل باستكشاف منتجاتنا وإجراء أول طلب لك!'
                        : 'You are not logged in or have no active orders. Feel free to explore our products and place your first order!'
                      }
                    </p>
                  </div>
                  <Link 
                    href="/products"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md shadow-primary/10 mx-auto hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'تصفح المنتجات الآن' : 'Browse Products Now'}</span>
                    <ArrowLeft size={16} className={language === 'en' ? 'mr-2 rotate-0' : 'mr-2 rotate-180'} />
                  </Link>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
