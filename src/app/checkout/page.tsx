"use client"

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShoppingBag, MapPin, CreditCard, ChevronRight, CheckCircle2, Truck, ShieldCheck, ArrowRight, Smartphone, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

const governorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "الشرقية", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الأقصر", "قنا", "شمال سيناء", "سوهاج", "جنوب سيناء", "كفر الشيخ", "مطروح"
]

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState('card')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    governorate: 'القاهرة',
    district: '',
    address: '',
    building: '',
    floor: '',
    apartment: '',
    notes: ''
  })

  // Load saved data
  React.useEffect(() => {
    const saved = localStorage.getItem('mithaly_checkout_data')
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (e) { console.error(e) }
    }
  }, [])

  // Save data on change
  React.useEffect(() => {
    localStorage.setItem('mithaly_checkout_data', JSON.stringify(formData))
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const { user } = useAuth()

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.governorate || !formData.district) {
      alert('الرجاء إكمال جميع البيانات المطلوبة (الاسم، الهاتف، المحافظة، المنطقة، العنوان)')
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          governorate: formData.governorate,
          district: formData.district,
          address: formData.address,
          building: formData.building,
          floor: formData.floor,
          apartment: formData.apartment,
          notes: formData.notes,
          paymentMethod: paymentMethod,
          total: total,
          shippingFee: shippingFee + codFee,
          items: cart,
          userId: user?.id || null
        })
      })

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const responseBody = isJson ? await response.json() : await response.text()

      if (response.ok) {
        const orderData = responseBody
        setStep(3)
        clearCart()
      } else {
        const errorMessage = isJson
          ? responseBody?.error || responseBody?.message
          : `الخادم رجّع رد غير متوقع (HTTP ${response.status})`
        alert('فشل إتمام الطلب: ' + (errorMessage || 'خطأ غير معروف'))
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء إتمام الطلب')
    }
  }

  const shippingFee = 0 
  const codFee = paymentMethod === 'cod' ? 15 : 0
  const total = cartTotal + shippingFee + codFee

  if (step === 3) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground">تم استلام طلبك بنجاح!</h1>
              <p className="text-muted">رقم الطلب الخاص بك هو <span className="font-bold text-primary">#ORD-{Math.floor(1000 + Math.random() * 9000)}</span></p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-600">سوف نرسل لك تفاصيل الطلب ورابط التتبع عبر البريد الإلكتروني والرسائل النصية قريباً إلى الرقم {formData.phone}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/">
                <button className="w-full bg-primary text-white h-14 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg">
                  مواصلة التسوق
                </button>
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pb-24">
        <div className="bg-white border-b py-8 mb-8">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShoppingBag size={20} />
              </div>
              إتمام الطلب
            </h1>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className={step >= 1 ? 'text-primary' : 'text-muted'}>الشحن</span>
              <ChevronRight size={16} className="text-slate-300" />
              <span className={step >= 2 ? 'text-primary' : 'text-muted'}>الدفع</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Form Side */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8"
                  >
                    <h2 className="text-xl font-black flex items-center gap-2">
                      <MapPin size={24} className="text-primary" />
                      عنوان التوصيل
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">الاسم بالكامل <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                          placeholder="أحمد محمد" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">رقم الجوال <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 pr-14 text-right focus:border-primary focus:bg-white transition-all outline-none font-mono" 
                            placeholder="01xxxxxxxxx" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold border-l pl-2">+20</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">البريد الإلكتروني (اختياري)</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                          placeholder="name@example.com" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">المحافظة <span className="text-red-500">*</span></label>
                        <select 
                          name="governorate"
                          value={formData.governorate}
                          onChange={handleInputChange}
                          className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none appearance-none font-bold"
                        >
                          {governorates.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">المنطقة / الحي <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                          placeholder="مثلاً: المعادي، سموحة" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">اسم الشارع / العنوان <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                          placeholder="اسم الشارع، رقم المنزل" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 md:col-span-2">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">رقم العمارة</label>
                          <input 
                            type="text" 
                            name="building"
                            value={formData.building}
                            onChange={handleInputChange}
                            className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                            placeholder="12" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">الطابق</label>
                          <input 
                            type="text" 
                            name="floor"
                            value={formData.floor}
                            onChange={handleInputChange}
                            className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                            placeholder="3" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">رقم الشقة</label>
                          <input 
                            type="text" 
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleInputChange}
                            className="w-full h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-5 focus:border-primary focus:bg-white transition-all outline-none" 
                            placeholder="5" 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700">ملاحظات إضافية / علامات مميزة</label>
                        <textarea 
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="w-full h-24 bg-slate-50 border-2 border-slate-50 rounded-xl p-5 focus:border-primary focus:bg-white transition-all outline-none resize-none" 
                          placeholder="بجوار صيدلية كذا، الدور الأرضي..."
                        ></textarea>
                      </div>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-primary text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                      متابعة للدفع
                      <ArrowRight size={20} className="rotate-180" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8"
                  >
                    <div className="flex items-center gap-4">
                      <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all">
                        <ChevronRight size={20} />
                      </button>
                      <h2 className="text-xl font-black flex items-center gap-2">
                        <CreditCard size={24} className="text-primary" />
                        طريقة الدفع
                      </h2>
                    </div>


                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'wallet', name: 'الدفع بالمحفظة الإلكترونية', icon: Smartphone },
                        { id: 'cod', name: 'الدفع عند الاستلام', icon: Truck },
                      ].map((method) => (
                        <label key={method.id} className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/50'
                        }`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            paymentMethod === method.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <method.icon size={24} />
                          </div>
                          <div className="flex-1">
                            <span className="font-bold block">{method.name}</span>
                            {method.id === 'cod' && <span className="text-xs text-muted">تطبق رسوم إضافية 15 ج.م</span>}
                            {method.id === 'wallet' && <span className="text-xs text-muted">فودافون كاش / اتصالات كاش / غيرها</span>}
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id ? 'border-primary bg-primary' : 'border-slate-300'
                          }`}>
                            {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </label>
                      ))}
                    </div>

                    {paymentMethod === 'wallet' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center gap-3 text-amber-800 font-bold">
                          <Info size={20} />
                          <span>تعليمات الدفع بالمحفظة</span>
                        </div>
                        <div className="space-y-3 text-sm text-amber-700 leading-relaxed">
                          <p>يرجى تحويل مبلغ <span className="font-black text-amber-900">{total} ج.م</span> إلى الرقم التالي:</p>
                          <div className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                            <span className="text-xl font-black text-amber-900 tracking-wider">01270029230</span>
                            <button onClick={() => {
                              navigator.clipboard.writeText('01270029230')
                              alert('تم نسخ الرقم')
                            }} className="text-xs bg-amber-100 px-3 py-1.5 rounded-xl font-bold text-amber-800 hover:bg-amber-200 transition-colors">نسخ</button>
                          </div>
                          <p>بعد التحويل، يرجى إرسال صورة إيصال التأكيد عبر الواتساب لتفعيل الطلب.</p>
                          <a 
                            href={`https://wa.me/201270029230?text=${encodeURIComponent(`تم تحويل مبلغ ${total} ج.م لطلب جديد باسم: ${formData.name}`)}`} 
                            target="_blank" 
                            className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white w-full py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
                          >
                            <Smartphone size={20} />
                            إرسال الإيصال عبر واتساب
                          </a>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handlePlaceOrder}
                      className="w-full bg-primary text-white h-16 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                      تأكيد ودفع {total} ج.م
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Side */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 sticky top-24">
                <h3 className="font-black text-lg">ملخص الطلب</h3>
                
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl border p-2 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-contain" alt={item.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-muted mt-1">الكمية: {item.quantity}</p>
                        <p className="text-sm font-black text-primary mt-1">{item.price} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">المجموع الفرعي</span>
                    <span className="font-bold">{cartTotal} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">رسوم الشحن</span>
                    <span className="text-green-500 font-bold">{shippingFee === 0 ? 'مجاني' : `${shippingFee} ج.م`}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between">
                      <span className="text-muted">رسوم الدفع عند الاستلام</span>
                      <span className="font-bold">15 ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-black pt-6 border-t border-slate-100">
                    <span>الإجمالي</span>
                    <span className="text-primary text-2xl">{total} ج.م</span>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <ShieldCheck size={18} className="text-green-500" />
                    <span>تسوق آمن ومشفر 100%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <Truck size={18} className="text-primary" />
                    <span>توصيل سريع لباب المنزل</span>
                  </div>
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
