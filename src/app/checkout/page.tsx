"use client"

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShoppingBag, MapPin, CreditCard, ChevronRight, CheckCircle2, Truck, ShieldCheck, ArrowRight, Smartphone, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { useLanguage } from '@/context/LanguageContext'
import { trackInitiateCheckout, trackPurchase } from '@/lib/tracking'

const governorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "الشرقية", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الأقصر", "قنا", "شمال سيناء", "سوهاج", "جنوب سيناء", "كفر الشيخ", "مطروح", "العين السخنة"
]

const districtsByGovernorate: Record<string, string[]> = {
  "أسوان": ["أسوان", "ابو سمبل", "السد العالي", "كوم امبو", "مركز إدفو", "مركز دراو", "نصر النوبة"],
  "أسيوط": ["أبو منقار", "أبوتيج", "أسيوط", "أسيوط الجديدة", "البلينا", "الفرافرة", "القوصية", "ديروط", "مركز أبنوب", "مركز البدارى", "مركز الغنايم", "مركز الفتح", "مركز دار السلام", "مركز ساحل سليم", "مركز صدفا", "مركز منفلوط", "منطقة سمكس"],
  "الإسكندرية": ["الإسكندرية", "الدخيلة", "الساحل الشمالى", "العامرية", "برج العرب", "سيدي كرير", "عوايد راس سودا", "كنج مريوط", "مركز ادكو"],
  "الإسماعيلية": ["أبو سلطان", "أبوصوير", "الإسماعيلية", "التل الكبير", "القنطرة شرق", "القنطرة غرب", "فايد"],
  "البحر الأحمر": ["الاحياء", "الجونة", "العريش", "الغردقة", "القصير", "حلايب و شلاتين", "رأس غارب", "راس شقير", "سفاجا", "سهل حشيش", "مرسى علم", "وادي دار الظرايا"],
  "البحيرة": ["المحمودية", "النوبارية", "دمنهور", "فاراسكور", "كفر الدوار", "كفر سعد", "مدينة الزرقا", "مركز ابو المطامير", "مركز ابو حمص", "مركز الدلنجات", "مركز الرحمانية", "مركز ايتاي البارود", "مركز حوش عيسى", "مركز شبراخيت", "مركز كوم حمادة", "وادي النطرون"],
  "الجيزة": ["أبو رواش", "أرض اللواء", "أطفيح", "إمبابة", "البدرشين", "الجيزة", "الحوامدية", "الدقي", "السادس من أكتوبر", "الصف", "العطف", "العمرانية", "العياط", "الكريمات", "المنيب", "المهندسين", "الهرم", "الواحات البحرية", "الوراق", "اوسيم", "براجيل", "بشتيل", "بهتيم", "بولاق الدكرور", "حدائق الاهرام", "دهشور", "زمالك", "سقارة", "شبرا منت", "طريق اسكندرية الصحراوى", "عجوزة", "فيصل", "مدينة الشيخ زايد", "منيل الروضة"],
  "الدقهلية": ["أجا", "السنبلاوين", "المنزلة", "المنصورة", "بلقاس", "بني عبيد", "دكرنس", "شربين", "طلخا", "مدينة الجمالية", "مدينة المطرية", "مدينة تامي الامديد", "منية النصر", "ميت غمر", "نبروة"],
  "السويس": ["السلام", "السويس", "قرية عامر"],
  "الشرقية": ["أبو حماد", "أبو كبير", "أولاد صقر", "الإبراهيمية", "الحسينية", "الزقازيق", "الصالحية الجديدة", "الصوفية", "العدوه", "القنايات", "القيران", "المناصافور", "انشاص", "بلبيس", "ديرب نجم", "كفر الحمام", "كفر صقر", "مدينة العاشر من رمضان", "مشتول السوق", "منيا القمح", "هيهيا"],
  "العين السخنة": ["العين السخنة"],
  "الغربية": ["السنطة", "المحلة الكبرى", "المنشأه الكبرى", "بسيون", "زفتي", "سمنود", "طنطا", "فاقوس", "قطور", "كفر الزيات"],
  "الفيوم": ["أطسا", "إبشواى", "الفيوم", "سنورس", "طامية", "مدينة الفيوم الجديدة", "يوسف الصديق"],
  "القاهرة": ["اسبيكو", "الأميرية", "الإباجية", "الازبكية", "البساتين", "التبين", "الجمالية", "الحرفيين", "الرحاب", "الزاوية الحمراء", "الزيتون", "الساحل", "السلام أول", "السواح", "السيدة زينب", "الشرابية", "الشروق", "الضاهر", "العاصمة الادارية الجديدة", "العباسية", "العتبة", "القاهرة", "القاهرة الجديدة", "القصر العيني", "القطامية", "المرج", "المطرية", "المعادى", "المعصرة", "المقطم", "النزهة", "الهايكستب", "الوايلي", "باب الشعرية", "بولاق ابوالعلا", "جاردن سيتي", "حدائق القبة", "حلوان", "دار السلام", "رمسيس", "روض الفرج", "شبرا مصر", "طرة", "عابدين", "عين شمس الغربيه", "عين شمس- الشرقية", "غمره", "قسم الخليفة", "قصر النيل", "كورنيش النيل", "مدينة 15 مايو", "مدينة السلام", "مدينة المستقبل", "مدينة بدر", "مدينة نصر", "مدينتي", "منشية ناصر", "منيل شيحة", "هليوبوليس", "وادى حوف", "وراق الحضر", "وسط البلد"],
  "القليوبية": ["ابو زعبل", "الخانكة", "القليوبية", "القناطر الخيرية", "باسوس", "بنها", "بيجام", "شبرا الخيمة", "شبين القناطر", "طوخ", "قليوب", "قها", "كفر شكر", "مدينة العبور", "مسطرد"],
  "المنوفية": ["أشمون", "الباجور", "الشهداء", "المنوفية", "بركة السبع", "تلا", "شبين الكوم", "قويسنا Merc", "كفر المصيلحة", "مدينة منوف", "مدينه السادات"],
  "المنيا": ["أبو قرقاص", "العدوى", "المنيا", "بنى مزار", "دير مواس", "سملوط", "طه السبع", "عزبة شاهين", "مالاوى", "مدينة المنيا الجديدة", "مطاى", "مغاغة"],
  "الوادي الجديد": ["الخارجة", "الواحات الداخلة", "الوادي الجديد", "باريس", "بلاط", "توشكى"],
  "بني سويف": ["أهناسيا", "الفشن", "الواسطى", "ببا", "بنى سويف", "سمسطا", "ناصر"],
  "بورسعيد": ["بور سعيد", "بور فؤاد", "شرق التفريعة"],
  "جنوب سيناء": ["أبو رديس", "الطور", "الغرقانة", "الهضبة", "حى النور", "دهب", "راس سدر", "سانت كاترين", "شرم الشيخ", "طابا", "نعمة باى", "نويبع"],
  "دمياط": ["بورت دمياط", "دمياط", "راس البر", "عزبت البرج", "مدينة دمياط الجديدة"],
  "سوهاج": ["جهينة", "سوهاج", "صحراء جهينة الغربية", "مدينة سوهاج الجديدة", "مركز أخميم", "مركز البلينا", "مركز المراغة", "مركز المنشأة", "مركز جرجا", "مركز ساقلتة", "مركز طما", "مركز طهطا"],
  "شمال سيناء": ["بئر العبد", "الشيخ زويد"],
  "قنا": ["أبو تشت", "الوقف", "دشنا", "فرشوط", "قفط", "قنا", "قوص", "مدينة نجع حمادي", "نقادة"],
  "كفر الشيخ": ["الحامول", "الرياض", "بلطيم", "بيلا", "دسوق", "سيدي سالم", "فوه", "قلين", "كفر الشيخ", "مطوبس"],
  "مطروح": ["الضبعة", "السلوم", "العلمين", "النجيلية", "سيدي براني", "سيوة", "مرسى مطروح", "مارينا"],
  "الأقصر": ["الاقصر", "ارمنت", "اسنا", "طيبة الجديدة"]
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const { user, token, loading } = useAuth()
  const { showAlert } = useModal()
  const { t, dir, language, translate } = useLanguage()

  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState('instapay')
  const [placedOrder, setPlacedOrder] = useState<any>(null)
  const [whatsappNumber, setWhatsappNumber] = useState('01201450111')
  const [receivingNumber, setReceivingNumber] = useState('01009596452')

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
        if (data.receiving_number) setReceivingNumber(data.receiving_number)
      })
      .catch(err => console.error('Error fetching settings in checkout:', err))
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phone2: '',
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
    const saved = localStorage.getItem('vitamins_hub_checkout_data')
    if (saved) {
      try {
        queueMicrotask(() => setFormData(JSON.parse(saved)))
      } catch (e) { console.error(e) }
    }
  }, [])

  // Save data on change
  React.useEffect(() => {
    localStorage.setItem('vitamins_hub_checkout_data', JSON.stringify(formData))
  }, [formData])

  // Pre-populate with user info if logged in
  React.useEffect(() => {
    if (user) {
      queueMicrotask(() => setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      })))
    }
  }, [user])

  const hasTrackedCheckout = React.useRef(false)
  React.useEffect(() => {
    if (cart && cart.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true
      const trackedItems = cart.map(item => ({
        id: String(item.id),
        title: translate(item.title),
        price: item.price,
        quantity: item.quantity
      }))
      trackInitiateCheckout(trackedItems, cartTotal)
    }
  }, [cart, cartTotal])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'governorate') {
        next.district = ''
      }
      return next
    })
  }

  const handleContinueToPayment = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.governorate.trim() || !formData.district.trim()) {
      await showAlert(
        language === 'ar' 
          ? 'الرجاء إكمال جميع البيانات المطلوبة (الاسم، الهاتف، المحافظة، المنطقة، العنوان)' 
          : 'Please complete all required fields (Name, Phone, Province, District, Address)', 
        language === 'ar' ? 'بيانات ناقصة' : 'Missing Information'
      )
      return
    }
    setStep(2)
  }

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.governorate || !formData.district) {
      await showAlert(
        language === 'ar' 
          ? 'الرجاء إكمال جميع البيانات المطلوبة (الاسم، الهاتف، المحافظة، المنطقة، العنوان)' 
          : 'Please complete all required fields (Name, Phone, Province, District, Address)', 
        language === 'ar' ? 'بيانات ناقصة' : 'Missing Information'
      )
      return
    }

    try {
      const getCookieVal = (name: string) => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match && match[2] ? decodeURIComponent(match[2]) : null;
      };
      let fbcVal = getCookieVal('_fbc');
      if (!fbcVal && typeof window !== 'undefined') {
        try {
          const params = new URLSearchParams(window.location.search);
          const fbclid = params.get('fbclid');
          if (fbclid) fbcVal = `fb.1.${Date.now()}.${fbclid}`;
        } catch(e) {}
      }

      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone2 ? `${formData.phone} - ${formData.phone2}` : formData.phone,
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
        userId: user?.id || null,
        language: language,
        fbp: getCookieVal('_fbp') || null,
        fbc: fbcVal || null
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      })

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const responseBody = isJson ? await response.json() : await response.text()

      if (response.ok) {
        const orderData = responseBody
        const storedOrder = {
          ...orderData,
          localSavedAt: new Date().toISOString(),
          checkoutData: orderPayload,
          isGuestOrder: !user
        }
        const savedOrders = localStorage.getItem('vitamins_hub_orders')
        const parsedOrders = savedOrders ? JSON.parse(savedOrders) : []
        const localOrders = Array.isArray(parsedOrders) ? parsedOrders : []
        localStorage.setItem('vitamins_hub_orders', JSON.stringify([storedOrder, ...localOrders].slice(0, 20)))
        
        // Track Purchase event on Facebook, Google, TikTok, Snapchat
        trackPurchase({
          id: orderData.id || '',
          orderNumber: orderData.orderNumber || 'ORD-XXXX',
          total: total,
          shippingFee: shippingFee + codFee,
          items: cart.map(item => ({
            productId: String(item.id),
            title: translate(item.title),
            price: item.price,
            quantity: item.quantity
          }))
        });

        setPlacedOrder(orderData)
        setStep(3)
        clearCart()
      } else {
        const errorMessage = isJson
          ? responseBody?.error || responseBody?.message
          : (language === 'ar' ? `الخادم رجّع رد غير متوقع (HTTP ${response.status})` : `Server returned unexpected response (HTTP ${response.status})`)
        await showAlert(
          (language === 'ar' ? 'فشل إتمام الطلب: ' : 'Failed to place order: ') + (errorMessage || 'Unknown error'), 
          language === 'ar' ? 'خطأ في الطلب' : 'Order Error'
        )
      }
    } catch (err) {
      console.error(err)
      await showAlert(
        language === 'ar' ? 'حدث خطأ أثناء إتمام الطلب' : 'An error occurred while placing the order', 
        language === 'ar' ? 'خطأ' : 'Error'
      )
    }
  }

  const shippingFee = 0 
  const codFee = paymentMethod === 'cod' ? 15 : 0
  const total = cartTotal + shippingFee + codFee
  const isRtl = language === 'ar'

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted font-bold">{language === 'ar' ? 'جاري تجهيز صفحة الدفع...' : 'Preparing checkout...'}</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (step === 3) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center p-4" dir={dir}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground">{t('checkout_success_title')}</h1>
              <p className="text-muted">{language === 'ar' ? 'رقم الطلب الخاص بك هو' : 'Your order number is'} <span className="font-bold text-primary">#{placedOrder?.orderNumber || 'ORD-XXXX'}</span></p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-600">
                {language === 'ar' 
                  ? `سوف نرسل لك تفاصيل الطلب ورابط التتبع عبر البريد الإلكتروني والرسائل النصية قريباً إلى الرقم ${formData.phone}`
                  : `We will send you order details and tracking details via email and SMS shortly to ${formData.phone}`}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/">
                <button className="w-full bg-primary text-white h-14 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg cursor-pointer">
                  {t('cart_back_shopping')}
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
      <main className="min-h-screen bg-slate-50 pb-24" dir={dir}>
        <div className="bg-white border-b py-8 mb-8">
          <div className={`container mx-auto px-4 flex items-center justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
            <h1 className={`text-2xl font-black flex items-center gap-3 ${isRtl ? 'justify-start' : 'flex-row-reverse justify-end'}`}>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShoppingBag size={20} />
              </div>
              <span>{t('checkout_heading')}</span>
            </h1>
            <div className={`flex items-center gap-2 text-sm font-bold ${isRtl ? '' : 'flex-row-reverse'}`}>
              <span className={step >= 1 ? 'text-primary' : 'text-muted'}>{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
              <ChevronRight size={16} className={`text-slate-300 ${isRtl ? '' : 'rotate-180'}`} />
              <span className={step >= 2 ? 'text-primary' : 'text-muted'}>{language === 'ar' ? 'الدفع' : 'Payment'}</span>
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
                    className={`bg-white rounded-[2.5rem] p-4 xs:p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 md:space-y-8 ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    <h2 className={`text-lg xs:text-xl font-black flex items-center gap-2 ${isRtl ? 'justify-start' : 'flex-row-reverse justify-end'}`}>
                      <MapPin size={24} className="text-primary" />
                      <span>{t('checkout_billing_details')}</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{t('checkout_full_name')} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`} 
                          placeholder={language === 'ar' ? "أحمد محمد" : "John Doe"} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{t('checkout_phone')} <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 text-sm xs:text-base focus:border-primary focus:bg-white transition-all outline-none font-mono ${isRtl ? 'pr-14 text-right' : 'pl-14 text-left'}`} 
                            placeholder="01xxxxxxxxx" 
                          />
                          <span className={`absolute top-1/2 -translate-y-1/2 text-muted font-bold text-xs xs:text-sm ${isRtl ? 'right-4 border-l pl-2' : 'left-4 border-r pr-2'}`}>+20</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{language === 'ar' ? 'رقم الهاتف البديل' : 'Alternative Phone'} ({language === 'ar' ? 'اختياري' : 'Optional'})</label>
                        <div className="relative">
                          <input 
                            type="tel" 
                            name="phone2"
                            value={formData.phone2 || ''}
                            onChange={handleInputChange}
                            className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 text-sm xs:text-base focus:border-primary focus:bg-white transition-all outline-none font-mono ${isRtl ? 'pr-14 text-right' : 'pl-14 text-left'}`} 
                            placeholder="01xxxxxxxxx" 
                          />
                          <span className={`absolute top-1/2 -translate-y-1/2 text-muted font-bold text-xs xs:text-sm ${isRtl ? 'right-4 border-l pl-2' : 'left-4 border-r pr-2'}`}>+20</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{t('login_email')} ({language === 'ar' ? 'اختياري' : 'Optional'})</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`} 
                          placeholder="name@example.com" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{t('checkout_city')} <span className="text-red-500">*</span></label>
                        <select 
                          name="governorate"
                          value={formData.governorate}
                          onChange={handleInputChange}
                          className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none appearance-none font-bold text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`}
                        >
                          {governorates.map(gov => (
                            <option key={gov} value={gov}>{translate(gov)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{language === 'ar' ? 'المنطقة / الحي' : 'District / Neighborhood'} <span className="text-red-500">*</span></label>
                        {(() => {
                          const availableDistricts = districtsByGovernorate[formData.governorate] || [];
                          if (availableDistricts.length > 0) {
                            return (
                              <select 
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none appearance-none font-bold text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`}
                                required
                              >
                                <option value="">{language === 'ar' ? '-- اختر المنطقة / الحي --' : '-- Select District / Neighborhood --'}</option>
                                {availableDistricts.map(dist => (
                                  <option key={dist} value={dist}>{translate(dist)}</option>
                                ))}
                              </select>
                            );
                          }
                          return (
                            <input 
                              type="text" 
                              name="district"
                              value={formData.district}
                              onChange={handleInputChange}
                              className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`} 
                              placeholder={language === 'ar' ? "مثلاً: المعادي، سموحة" : "e.g., Maadi, Smouha"} 
                              required
                            />
                          );
                        })()}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{language === 'ar' ? 'اسم الشارع / العنوان بالكامل' : 'Street Name / Complete Address'} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-3 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`} 
                          placeholder={language === 'ar' ? "اسم الشارع، رقم المنزل" : "Street name, building number"} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 xs:gap-4 md:col-span-2">
                        <div className="space-y-2">
                          <label className="text-[10px] xs:text-xs font-bold text-slate-700">{language === 'ar' ? 'رقم العمارة' : 'Building'}</label>
                          <input 
                            type="text" 
                            name="building"
                            value={formData.building}
                            onChange={handleInputChange}
                            className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-2 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-center text-sm xs:text-base`} 
                            placeholder="12" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] xs:text-xs font-bold text-slate-700">{language === 'ar' ? 'الطابق' : 'Floor'}</label>
                          <input 
                            type="text" 
                            name="floor"
                            value={formData.floor}
                            onChange={handleInputChange}
                            className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-2 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-center text-sm xs:text-base`} 
                            placeholder="3" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] xs:text-xs font-bold text-slate-700">{language === 'ar' ? 'رقم الشقة' : 'Apartment'}</label>
                          <input 
                            type="text" 
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleInputChange}
                            className={`w-full h-12 xs:h-13 bg-slate-50 border-2 border-slate-50 rounded-xl px-2 xs:px-5 focus:border-primary focus:bg-white transition-all outline-none text-center text-sm xs:text-base`} 
                            placeholder="5" 
                          />
                        </div>
                      </div>
 
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs xs:text-sm font-bold text-slate-700">{t('checkout_notes')}</label>
                        <textarea 
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className={`w-full h-24 bg-slate-50 border-2 border-slate-50 rounded-xl p-3 xs:p-5 focus:border-primary focus:bg-white transition-all outline-none resize-none text-sm xs:text-base ${isRtl ? 'text-right' : 'text-left'}`} 
                          placeholder={language === 'ar' ? "بجوار صيدلية كذا، الدور الأرضي..." : "e.g., Near pharmacy, ground floor..."}
                        ></textarea>
                      </div>
                    </div>
 
                    <button 
                      onClick={handleContinueToPayment}
                      className="w-full bg-primary text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-sm xs:text-base cursor-pointer"
                    >
                      {language === 'ar' ? 'متابعة للدفع' : 'Continue to Payment'}
                      <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white rounded-[2.5rem] p-4 xs:p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 md:space-y-8 ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`flex items-center gap-3 xs:gap-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <button onClick={() => setStep(1)} className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer">
                        <ChevronRight size={20} className={isRtl ? '' : 'rotate-180'} />
                      </button>
                      <h2 className={`text-lg xs:text-xl font-black flex items-center gap-2 ${isRtl ? 'justify-start' : 'flex-row-reverse justify-end'}`}>
                        <CreditCard size={24} className="text-primary" />
                        <span>{t('checkout_payment_method')}</span>
                      </h2>
                    </div>


                    <div className="grid grid-cols-1 gap-3 xs:gap-4">
                      {[
                        { id: 'instapay', name: language === 'ar' ? 'الدفع عبر إنستاباي (Instapay)' : 'Pay via Instapay', icon: Smartphone },
                        { id: 'wallet', name: language === 'ar' ? 'الدفع بالمحفظة الإلكترونية' : 'Pay via Mobile Wallet', icon: Smartphone },
                        { id: 'cod', name: language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery (COD)', icon: Truck },
                      ].map((method) => (
                        <label key={method.id} className={`flex items-center gap-3 xs:gap-4 p-4 xs:p-6 rounded-2xl border-2 cursor-pointer transition-all ${isRtl ? 'flex-row' : 'flex-row-reverse'} ${
                          paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/50'
                        }`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === method.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <method.icon size={20} className="xs:w-6 xs:h-6" />
                          </div>
                          <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <span className="font-bold block text-sm xs:text-base">{method.name}</span>
                            {method.id === 'instapay' && <span className="text-[10px] xs:text-xs text-muted block truncate">{language === 'ar' ? 'تحويل سريع ومباشر عبر التطبيق' : 'Direct instant bank transfer via app'}</span>}
                            {method.id === 'wallet' && <span className="text-[10px] xs:text-xs text-muted block truncate">{language === 'ar' ? 'فودافون كاش / اتصالات كاش / غيرها' : 'Vodafone Cash / Orange Cash / etc.'}</span>}
                            {method.id === 'cod' && <span className="text-[10px] xs:text-xs text-muted block truncate">{language === 'ar' ? 'الدفع نقداً عند استلام الطلب (+15 ج.م مصاريف)' : 'Pay in cash upon delivery (+15 EGP fee)'}</span>}
                          </div>
                          <div className={`w-5 h-5 xs:w-6 xs:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === method.id ? 'border-primary bg-primary' : 'border-slate-300'
                          }`}>
                            {paymentMethod === method.id && <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-white" />}
                          </div>
                        </label>
                      ))}
                    </div>

                    {(paymentMethod === 'wallet' || paymentMethod === 'instapay') && (
                      <div className={`bg-amber-50 border border-amber-200 rounded-[2rem] p-4 xs:p-6 space-y-3 xs:space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 xs:gap-3 text-amber-800 font-bold text-sm xs:text-base ${isRtl ? '' : 'flex-row-reverse'}`}>
                          <Info size={20} className="flex-shrink-0" />
                          <span>{language === 'ar' ? `تعليمات الدفع عبر ${paymentMethod === 'instapay' ? 'إنستاباي' : 'المحفظة الإلكترونية'}` : `Payment instructions via ${paymentMethod === 'instapay' ? 'Instapay' : 'Mobile Wallet'}`}</span>
                        </div>
                        <div className="space-y-2 xs:space-y-3 text-xs xs:text-sm text-amber-700 leading-relaxed">
                          <p>{language === 'ar' ? 'يرجى تحويل مبلغ' : 'Please transfer the amount of'} <span className="font-black text-amber-900">{total} {t('currency')}</span> {language === 'ar' ? 'إلى الرقم التالي:' : 'to the following phone number:'}</p>
                          <div className={`bg-white p-3 xs:p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span className="text-base xs:text-xl font-black text-amber-900 tracking-wider">{receivingNumber}</span>
                            <button onClick={async () => {
                              navigator.clipboard.writeText(receivingNumber)
                              await showAlert(language === 'ar' ? 'تم نسخ الرقم بنجاح ✅' : 'Number copied successfully ✅', language === 'ar' ? 'نسخ الرقم' : 'Copy Number')
                            }} className="h-11 px-6 bg-amber-100 rounded-xl font-bold text-amber-800 hover:bg-amber-200 transition-colors flex-shrink-0 text-xs flex items-center justify-center cursor-pointer">{t('edit') === 'تعديل' ? 'نسخ' : 'Copy'}</button>
                          </div>
                          {paymentMethod === 'instapay' ? (
                            <p className="text-[10px] xs:text-xs font-bold text-amber-800 bg-amber-100/50 p-2 rounded-lg">
                              {language === 'ar' 
                                ? 'يمكنك استخدام الرقم أعلاه لإتمام التحويل من خلال تطبيق إنستاباي مباشرة.' 
                                : 'You can use the phone number above to complete the bank transfer directly via Instapay.'}
                            </p>
                          ) : (
                            <p className="text-[10px] xs:text-xs font-bold text-amber-800 bg-amber-100/50 p-2 rounded-lg">
                              {language === 'ar' 
                                ? 'يمكنك التحويل إلى الرقم أعلاه عبر أي محفظة إلكترونية (فودافون كاش، اتصالات كاش، إلخ).' 
                                : 'You can transfer to the above phone number via any mobile wallet (Vodafone Cash, Orange Cash, etc.).'}
                            </p>
                          )}
                          <p>{language === 'ar' ? 'بعد التحويل، يرجى إرسال صورة إيصال التأكيد عبر الواتساب لتفعيل الطلب.' : 'After transferring, please send a screenshot of the confirmation receipt via WhatsApp to activate your order.'}</p>
                          <a 
                            href={`https://wa.me/20${whatsappNumber.replace(/^0/, '')}?text=${encodeURIComponent(`تم تحويل مبلغ ${total} ج.م لطلب جديد عبر ${paymentMethod === 'instapay' ? 'إنستاباي' : 'المحفظة الإلكترونية'} باسم: ${formData.name}`)}`} 
                            target="_blank" 
                            className={`inline-flex items-center justify-center gap-2 xs:gap-3 bg-[#25D366] text-white w-full py-3.5 xs:py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/20 text-sm xs:text-base cursor-pointer ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                          >
                            <Smartphone size={20} />
                            <span>{language === 'ar' ? 'إرسال الإيصال عبر واتساب' : 'Send receipt via WhatsApp'}</span>
                          </a>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handlePlaceOrder}
                      className="w-full bg-primary text-white h-14 xs:h-16 rounded-2xl font-bold text-base xs:text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 cursor-pointer"
                    >
                      {language === 'ar' 
                        ? (paymentMethod === 'cod' ? `تأكيد الطلب ${total} ج.م` : `تأكيد ودفع ${total} ج.م`) 
                        : (paymentMethod === 'cod' ? `Confirm Order ${total} EGP` : `Confirm & Pay ${total} EGP`)}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Side */}
            <div className="space-y-6">
              <div className={`bg-white rounded-[2.5rem] p-4 xs:p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 sticky top-24 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h3 className="font-black text-lg">{t('checkout_order_summary')}</h3>
                
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className={`flex gap-3 xs:gap-4 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className="w-14 h-14 xs:w-16 xs:h-16 bg-slate-50 rounded-xl border p-2 flex-shrink-0 flex items-center justify-center">
                        <img src={item.image} className="max-h-full max-w-full object-contain" alt={translate(item.title)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs xs:text-sm font-bold line-clamp-1">{translate(item.title)}</h4>
                        <p className="text-[10px] xs:text-xs text-muted mt-0.5 xs:mt-1">{language === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}</p>
                        <p className="text-xs xs:text-sm font-black text-primary mt-0.5 xs:mt-1">{item.price} {t('currency')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50 text-xs xs:text-sm">
                  <div className={`flex justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
                    <span className="text-muted">{t('cart_subtotal')}</span>
                    <span className="font-bold">{cartTotal} {t('currency')}</span>
                  </div>
                  <div className={`flex justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
                    <span className="text-muted">{t('cart_shipping')}</span>
                    <span className="text-green-500 font-bold">{shippingFee === 0 ? t('cart_shipping_free') : `${shippingFee} ${t('currency')}`}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className={`flex justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <span className="text-muted">{language === 'ar' ? 'رسوم الدفع عند الاستلام' : 'Cash on Delivery Fee'}</span>
                      <span className="font-bold">15 {t('currency')}</span>
                    </div>
                  )}
                  <div className={`flex justify-between items-center text-base xs:text-xl font-black pt-6 border-t border-slate-100 ${isRtl ? '' : 'flex-row-reverse'}`}>
                    <span>{t('cart_total')}</span>
                    <span className="text-primary text-xl xs:text-2xl font-black">{total} {t('currency')}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className={`flex items-center gap-3 text-[10px] xs:text-xs text-muted ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <ShieldCheck size={18} className="text-green-500 flex-shrink-0" />
                    <span>{language === 'ar' ? 'تسوق آمن ومشفر 100%' : '100% Secure & Encrypted Checkout'}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-[10px] xs:text-xs text-muted ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <Truck size={18} className="text-primary flex-shrink-0" />
                    <span>{language === 'ar' ? 'توصيل سريع لباب المنزل' : 'Fast home delivery'}</span>
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
