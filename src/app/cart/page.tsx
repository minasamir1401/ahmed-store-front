"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Info } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { cart: items, removeFromCart: removeItem, updateQuantity, cartTotal: subtotal } = useCart()

  const handleUpdateQuantity = (id: string | number, currentQty: number, delta: number) => {
    updateQuantity(id, currentQty + delta)
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50 pb-24 md:pb-12">
        <div className="bg-white border-b py-8 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShoppingCart size={24} />
              </div>
              سلة التسوق
              <span className="text-sm font-medium text-muted bg-slate-100 px-3 py-1 rounded-full">
                {items.length} منتجات
              </span>
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 relative group"
                    >
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-4 left-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="w-full md:w-32 aspect-square bg-slate-50 rounded-2xl p-4 border border-slate-50">
                        <img src={item.image} className="w-full h-full object-contain" alt={item.title} />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer">{item.title}</h3>
                          {item.size && <p className="text-sm text-muted mt-1">الحجم: {item.size}</p>}
                        </div>
                        
                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-500"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-500"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-muted mb-1">السعر الإجمالي</div>
                            <span className="text-xl font-black text-primary">{item.price * item.quantity} <span className="text-xs">ج.م</span></span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex items-center gap-4 text-primary">
                  <Info size={24} />
                  <p className="text-sm font-medium">أضف منتجات بقيمة 150 ج.م إضافية للحصول على شحن مجاني!</p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 space-y-8 sticky top-24">
                  <h2 className="text-xl font-black text-foreground">ملخص الطلب</h2>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="كود الخصم" 
                        className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-12 focus:border-primary outline-none transition-all"
                      />
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold">تطبيق</button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">مجموع المنتجات</span>
                      <span className="font-bold">{subtotal} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">رسوم الشحن</span>
                      <span className="text-green-500 font-bold">مجاني</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">ضريبة القيمة المضافة</span>
                      <span className="font-bold">0.00 ج.م</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xl pt-6 border-t border-slate-100 font-black">
                      <span>الإجمالي</span>
                      <div className="text-right">
                        <div className="text-primary text-3xl leading-none">{subtotal}</div>
                        <div className="text-[10px] text-muted font-medium mt-1">شامل الضريبة</div>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <button className="w-full bg-primary text-white h-16 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                      إتمام الطلب
                      <ArrowRight size={24} className="rotate-180" />
                    </button>
                  </Link>

                  <div className="flex items-center justify-center gap-4 pt-4 opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-20 space-y-6">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <ShoppingCart size={48} />
              </div>
              <h2 className="text-2xl font-black">سلة التسوق فارغة</h2>
              <p className="text-muted">يبدو أنك لم تضف أي منتجات بعد، ابدأ بالتسوق الآن واكتشف عروضنا</p>
              <Link href="/">
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg">
                  العودة للرئيسية
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  )
}
