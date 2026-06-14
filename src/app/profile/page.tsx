'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, ShoppingBag, LogOut, ChevronRight, MapPin, Phone, Trash2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useModal } from '@/context/ModalContext'
import { useLanguage } from '@/context/LanguageContext'

export default function ProfilePage() {
  const { user, token, logout, loading: authLoading } = useAuth()
  const { showAlert, showConfirm } = useModal()
  const { t, language, dir } = useLanguage()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    document.title = t('profile_title')
  }, [language, t])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const confirmText = language === 'ar'
      ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to cancel this order? This action cannot be undone.'
    const confirmTitle = language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'

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
        const successText = language === 'ar' ? 'تم إلغاء الطلب بنجاح وتمت إزالته.' : 'Order cancelled successfully and removed.'
        const successTitle = language === 'ar' ? 'تم الإلغاء' : 'Cancelled'
        await showAlert(successText, successTitle)
        fetchOrders()
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

  if (authLoading || !user) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12 px-4" dir={dir}>
        <div className="container mx-auto max-w-5xl">
          {/* User Profile Header */}
          <div className="bg-white rounded-[2.5rem] p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
            <div className={`flex items-center gap-6 text-center md:text-start ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
              <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary text-3xl font-black shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">{user.name}</h1>
                <p className="text-slate-400 font-bold">{user.phone}</p>
              </div>
            </div>
            <button 
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-2 text-red-500 font-black hover:bg-red-50 px-6 py-3 rounded-2xl transition-all cursor-pointer"
            >
              <LogOut size={20} /> {t('profile_logout')}
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Orders Section */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ShoppingBag className="text-primary" /> {t('profile_orders')}
              </h2>

              {loading ? (
                <div className="bg-white p-12 rounded-[2.5rem] flex items-center justify-center border border-slate-100">
                  <Clock className="animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">{t('profile_no_orders')}</h3>
                  <p className="text-slate-400 font-bold mb-6">
                    {language === 'ar' 
                      ? 'ابدأ رحلتك الصحية الآن واطلب منتجاتك المفضلة' 
                      : 'Start your health journey now and order your favorite products'
                    }
                  </p>
                  <button 
                    onClick={() => router.push('/products')}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-50">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
                        </div>
                        <div className="text-sm font-black text-slate-800">#{order.orderNumber}</div>
                      </div>
                      <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {language === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
                        </div>
                        <div className="text-sm font-black text-slate-800">
                          {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-xs font-black ${
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {order.status === 'pending' ? (language === 'ar' ? 'قيد الانتظار' : 'Pending') : 
                         order.status === 'shipped' ? (language === 'ar' ? 'تم الشحن' : 'Shipped') : 
                         (language === 'ar' ? 'تم التوصيل' : 'Delivered')}
                      </div>
                    </div>

                    {/* Tracking Progress */}
                    <div className="relative flex justify-between mb-8 px-4">
                      <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 z-0" />
                      <div className={`absolute top-4 left-0 h-0.5 bg-primary transition-all duration-1000 z-0`} style={{ 
                        width: order.status === 'pending' ? '0%' : order.status === 'shipped' ? '50%' : '100%' 
                      }} />
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mb-2 shadow-lg shadow-primary/20">
                          <Clock size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{language === 'ar' ? 'تم الاستلام' : 'Received'}</span>
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-lg ${
                          order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Truck size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{language === 'ar' ? 'في الطريق' : 'In Transit'}</span>
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-lg ${
                          order.status === 'delivered' ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <CheckCircle size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 group relative">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="text-lg font-black text-primary">{order.total} {t('currency')}</div>
                      <div className="flex items-center gap-4">
                        {order.shippingRef && (
                          <div className="text-[10px] font-black text-slate-400">
                            {language === 'ar' ? 'رقم التتبع: ' : 'Tracking Number: '}
                            <span className="text-slate-800">{order.shippingRef}</span>
                          </div>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="bg-red-50 hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 text-red-500 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {cancellingId === order.id ? (
                              <Clock size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Sidebar Stats/Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 mb-6">{t('profile_details')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <Phone size={16} className="text-primary" /> {user.phone || (language === 'ar' ? 'لم يتم إضافة رقم' : 'No phone number added')}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <MapPin size={16} className="text-primary" /> {language === 'ar' ? 'مصر' : 'Egypt'}
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-[2.5rem] p-8 shadow-lg shadow-primary/20 text-white">
                <div className="text-4xl font-black mb-2">{orders.length}</div>
                <div className="text-sm font-bold opacity-80 uppercase tracking-widest">
                  {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-[10px] font-bold opacity-70">
                    {language === 'ar'
                      ? 'شكراً لثقتك في عائلة The VitaHub. نحن نسعى دائماً لتقديم الأفضل لصحتك ورشاقتك.'
                      : 'Thank you for your trust in the The VitaHub family. We always strive to deliver the best for your health and fitness.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
