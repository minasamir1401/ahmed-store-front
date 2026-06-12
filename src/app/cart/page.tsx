"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'

export default function CartPage() {
  const { cart: items, removeFromCart: removeItem, updateQuantity, cartTotal: subtotal } = useCart()
  const { t, dir, language, translate } = useLanguage()

  const handleUpdateQuantity = (id: string | number, currentQty: number, delta: number) => {
    const item = items.find(cartItem => cartItem.id === id)
    updateQuantity(id, currentQty + delta, item?.size)
  }

  const isRtl = language === 'ar'

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50 pb-24 md:pb-12" dir={dir}>
        <div className="bg-white border-b py-8 mb-8">
          <div className="container mx-auto px-4">
            <h1 className={`text-2xl md:text-3xl font-black flex items-center gap-3 ${isRtl ? 'justify-start' : 'flex-row-reverse justify-end'}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShoppingCart size={24} />
              </div>
              <span className="font-black">{t('cart')}</span>
              <span className="text-sm font-medium text-muted bg-slate-100 px-3 py-1 rounded-full">
                {language === 'ar' ? `${items.length} منتجات` : `${items.length} items`}
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
                      key={`${item.id}:${item.size || ''}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-[2rem] p-3 xs:p-4 md:p-6 shadow-sm border border-slate-100 flex gap-3 xs:gap-6 relative group"
                    >
                      <button 
                        onClick={() => removeItem(item.id, item.size)}
                        className={`absolute top-3 xs:top-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 cursor-pointer ${isRtl ? 'left-3 xs:left-4' : 'right-3 xs:right-4'}`}
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="w-20 h-20 xs:w-28 xs:h-28 md:w-32 md:h-32 flex-shrink-0 bg-slate-50 rounded-2xl p-2 xs:p-4 border border-slate-50 flex items-center justify-center">
                        <img src={item.image} className="max-h-full max-w-full object-contain" alt={translate(item.title)} />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className={`${isRtl ? 'pl-6 md:pl-0 text-right' : 'pr-6 md:pr-0 text-left'}`}>
                          <h3 className="text-sm xs:text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2 md:line-clamp-none">{translate(item.title)}</h3>
                          {item.size && <p className="text-xs xs:text-sm text-muted mt-1">{language === 'ar' ? 'الحجم:' : 'Size:'} {translate(item.size)}</p>}
                        </div>
                        
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
                          <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-100 self-start">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              className="w-11 h-11 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-500 cursor-pointer"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-black text-sm xs:text-lg">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              className="w-11 h-11 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-500 cursor-pointer"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <div className="text-[10px] xs:text-xs text-muted mb-0.5 xs:mb-1">{language === 'ar' ? 'السعر الإجمالي' : 'Total Price'}</div>
                            <span className="text-base xs:text-xl font-black text-primary">{item.price * item.quantity} <span className="text-[10px] xs:text-xs">{t('currency')}</span></span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className={`bg-primary/5 rounded-3xl p-4 xs:p-6 border border-primary/10 flex items-center gap-3 xs:gap-4 text-primary ${isRtl ? 'text-right' : 'text-left'}`}>
                  <Info size={24} className="flex-shrink-0" />
                  <p className="text-xs xs:text-sm font-medium">
                    {language === 'ar' 
                      ? 'أضف منتجات بقيمة 150 ج.م إضافية للحصول على شحن مجاني!' 
                      : 'Add 150 EGP more to qualify for FREE shipping!'}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-6">
                <div className={`bg-white rounded-[2.5rem] p-4 xs:p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 sm:space-y-8 sticky top-24 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <h2 className="text-lg xs:text-xl font-black text-foreground">{t('cart_summary')}</h2>


                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className={`flex justify-between text-xs xs:text-sm ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <span className="text-muted">{t('cart_subtotal')}</span>
                      <span className="font-bold">{subtotal} {t('currency')}</span>
                    </div>
                    <div className={`flex justify-between text-xs xs:text-sm ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <span className="text-muted">{t('cart_shipping')}</span>
                      <span className="text-green-500 font-bold">{t('cart_shipping_free')}</span>
                    </div>
                    <div className={`flex justify-between text-xs xs:text-sm ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <span className="text-muted">{language === 'ar' ? 'ضريبة القيمة المضافة' : 'VAT'}</span>
                      <span className="font-bold">0.00 {t('currency')}</span>
                    </div>
                    
                    <div className={`flex justify-between items-center text-lg xs:text-xl pt-6 border-t border-slate-100 font-black ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <span>{t('cart_total')}</span>
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <div className="text-primary text-2xl xs:text-3xl leading-none font-black">{subtotal} {t('currency')}</div>
                        <div className="text-[10px] text-muted font-medium mt-1">{language === 'ar' ? 'شامل الضريبة' : 'Includes Tax'}</div>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <button className="w-full bg-primary text-white h-14 xs:h-16 rounded-2xl font-bold text-base xs:text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 cursor-pointer">
                      {t('cart_checkout_btn')}
                      <ArrowRight size={24} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                  </Link>

                  <div className="flex flex-col items-center justify-center gap-2 pt-4 border-t border-slate-100 mt-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'طرق الدفع المدعومة' : 'Supported Payment Methods'}</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-black">{language === 'ar' ? 'إنستاباي Instapay' : 'Instapay'}</span>
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black">{language === 'ar' ? 'محفظة إلكترونية' : 'Mobile Wallets'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-20 space-y-6">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <ShoppingCart size={48} />
              </div>
              <h2 className="text-2xl font-black">{t('cart_empty')}</h2>
              <p className="text-muted">{t('cart_empty_desc')}</p>
              <Link href="/">
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg cursor-pointer">
                  {t('cart_back_shopping')}
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
