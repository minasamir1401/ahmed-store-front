"use client"

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import { Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart, Share2, ShoppingCart, Check, ChevronLeft, CheckCircle2, Building2, Award, Sparkles, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<any>(null) // ← moved up before any early return
  const isFavorite = isInWishlist(productId)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setActiveImage(data.image)
        setLoading(false)

        // Set default selected size if available
        try {
          const parsed = data.sizesPrices ? JSON.parse(data.sizesPrices) : (data.sizeOptions ? JSON.parse(data.sizeOptions) : [])
          if (Array.isArray(parsed) && parsed.length > 0) setSelectedSize(parsed[0])
        } catch { /* ignore parse errors */ }

        // Apply SEO Data Dynamically
        if (data.title) document.title = `${data.title} | متجر مثالي`;
        if (data.seoDesc) {
           let metaDesc = document.querySelector('meta[name="description"]');
           if (!metaDesc) {
               metaDesc = document.createElement('meta');
               metaDesc.setAttribute('name', 'description');
               document.head.appendChild(metaDesc);
           }
           metaDesc.setAttribute('content', data.seoDesc);
        }
        if (data.seoKeywords) {
           let metaKeywords = document.querySelector('meta[name="keywords"]');
           if (!metaKeywords) {
               metaKeywords = document.createElement('meta');
               metaKeywords.setAttribute('name', 'keywords');
               document.head.appendChild(metaKeywords);
           }
           metaKeywords.setAttribute('content', data.seoKeywords);
        }
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4" dir="rtl">
        <h1 className="text-2xl font-black text-gray-800">المنتج غير موجود</h1>
        <button onClick={() => router.back()} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold">العودة للمتجر</button>
      </div>
    )
  }

  const additionalImages = product.images ? product.images.split(',').map((img: string) => img.trim()).filter((i:string)=>i) : []
  const allImages = [product.image, ...additionalImages].filter(Boolean)
  const features = product.features ? product.features.split('\n').filter((f: string) => f.trim()) : []
  
  // Advanced Data Parsing — handles both array and object shapes
  let sizeOptions: any[] = []
  let specifications: any[] = []
  let keyInfo: any[] = []
  let certifications: string[] = []
  let supplementFactsRows: any[] = []

  // sizesPrices: [{size, price}]
  try {
    const raw = product.sizesPrices ? JSON.parse(product.sizesPrices) : (product.sizeOptions ? JSON.parse(product.sizeOptions) : [])
    sizeOptions = Array.isArray(raw) ? raw : []
  } catch { sizeOptions = [] }

  // productSpecs: {authentic, sku, ...} → convert to [{label, value}]
  try {
    const raw = product.productSpecs ? JSON.parse(product.productSpecs) : (product.specifications ? JSON.parse(product.specifications) : null)
    if (Array.isArray(raw)) {
      specifications = raw
    } else if (raw && typeof raw === 'object') {
      const labelMap: Record<string, string> = {
        authentic: 'أصلي 100%', bestBefore: 'صالح حتى', firstAvailable: 'أول إتاحة',
        shippingWeight: 'وزن الشحن', sku: 'رمز SKU', upc: 'رمز UPC',
        quantity: 'الكمية', dimensions: 'الأبعاد', animalDerived: 'مشتق حيواني'
      }
      specifications = Object.entries(raw)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => ({
          label: labelMap[k] || k,
          value: typeof v === 'boolean' ? (v ? 'نعم ✓' : 'لا ✗') : String(v),
          bold: k === 'authentic'
        }))
    }
  } catch { specifications = [] }

  // keyInfo: {servingSize, totalServings, ...} → [{label, value}]
  try {
    const raw = product.keyInfo ? JSON.parse(product.keyInfo) : null
    if (Array.isArray(raw)) {
      keyInfo = raw
    } else if (raw && typeof raw === 'object') {
      const labelMap: Record<string, string> = {
        servingSize: 'حجم الجرعة', totalServings: 'عدد الجرعات',
        bestBefore: 'صالح حتى', origin: 'بلد المنشأ'
      }
      keyInfo = Object.entries(raw)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => ({ label: labelMap[k] || k, value: String(v) }))
    }
  } catch { keyInfo = [] }

  // certifications: {glutenFree: true, dairyFree: true, ...} → ['خالي من الجلوتين', ...]
  try {
    const raw = product.certifications ? JSON.parse(product.certifications) : null
    if (Array.isArray(raw)) {
      certifications = raw
    } else if (raw && typeof raw === 'object') {
      const certLabels: Record<string, string> = {
        glutenFree: 'خالي من الجلوتين', dairyFree: 'خالي من الألبان',
        soyFree: 'خالي من الصويا', treeNutFree: 'خالي من المكسرات',
        vegan: 'نباتي', nonGMO: 'غير معدّل وراثياً', kosher: 'كوشر', halal: 'حلال'
      }
      certifications = Object.entries(raw)
        .filter(([, v]) => v === true)
        .map(([k]) => certLabels[k] || k)
    }
  } catch { certifications = [] }

  // supplementFacts: [{name, amount, dv}] OR {servingSize, rows: [{label, amount, dv}]}
  try {
    const raw = product.supplementFacts ? JSON.parse(product.supplementFacts) : null
    if (Array.isArray(raw)) {
      supplementFactsRows = raw // direct array [{name, amount, dv}]
    } else if (raw && raw.rows) {
      supplementFactsRows = raw.rows // {rows: [{label, amount, dv}]}
    }
  } catch { supplementFactsRows = [] }

  const currentPrice = selectedSize ? selectedSize.price : product.price
  const currentOldPrice = selectedSize ? selectedSize.originalPrice : product.oldPrice

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: product.id,
      title: product.title + (selectedSize ? ` (${selectedSize.size})` : ''),
      price: currentPrice,
      image: product.image,
      quantity: quantity
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-white pb-24" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/')}>الرئيسية</span>
            <ChevronLeft size={14} />
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/products')}>المتجر</span>
            <ChevronLeft size={14} />
            <span className="text-primary">{product.category?.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div className="space-y-6">
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-[3rem] bg-[#f0f7f4] overflow-hidden border border-[#e8f0ed] p-12 flex items-center justify-center relative shadow-sm"
              >
                <img src={activeImage} className="w-full h-full object-contain mix-blend-multiply" alt={product.title} />
              </motion.div>

              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, i) => (
                  <div key={i} onClick={() => setActiveImage(img)} className={`aspect-square rounded-2xl bg-[#f0f7f4] border-2 cursor-pointer transition-all p-3 overflow-hidden ${activeImage === img ? 'border-primary' : 'border-[#e8f0ed] hover:border-primary/50'}`}>
                    <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                  </div>
                ))}
              </div>

              {/* Product Specifications Table (Left Side) */}
              {specifications.length > 0 && (
                <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                   <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b pb-4">مواصفات المنتج</h3>
                   <ul className="space-y-4">
                      {specifications.map((spec: any, i: number) => (
                        <li key={i} className={`flex justify-between items-start gap-4 text-sm ${spec.bold ? 'font-black text-gray-800' : 'font-bold text-gray-500'}`}>
                           <span className="shrink-0">{spec.label}:</span>
                           <span className={spec.label === 'أصلي 100%' ? 'text-primary' : ''}>{spec.value}</span>
                        </li>
                      ))}
                   </ul>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{product.category?.name}</span>
                  {product.brand && (
                    <Link href={`/brands/${product.brand.id}`} className="flex items-center gap-2 bg-gray-50 text-gray-700 pr-1 pl-3 py-1 rounded-full text-[11px] font-black border border-gray-100 hover:border-primary/30 hover:bg-white transition-all shadow-sm">
                      {product.brand.image ? (
                        <img src={product.brand.image} alt={product.brand.name} className="w-6 h-6 rounded-full object-cover bg-white border border-gray-100" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 size={12} />
                        </div>
                      )}
                      <span>{product.brand.name}</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-gray-500">4.9 (120 تقييم)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight">{product.title}</h1>
                
                <div className="flex items-center gap-4 py-2">
                  <span className="text-4xl font-black text-primary">{currentPrice} جنيه</span>
                  {currentOldPrice && <span className="text-xl text-gray-400 line-through decoration-red-500/30">{currentOldPrice} جنيه</span>}
                </div>

                {/* Size Selector */}
                {sizeOptions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-black text-gray-800">اختر الحجم / الكمية:</label>
                    <div className="flex flex-wrap gap-3">
                      {sizeOptions.map((opt: any, i: number) => (
                        <button 
                          key={i} 
                          onClick={() => setSelectedSize(opt)}
                          className={`flex flex-col items-center px-6 py-3 rounded-2xl border-2 transition-all min-w-[100px] ${selectedSize?.size === opt.size ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-gray-500 hover:border-primary/30'}`}
                        >
                          <span className="text-sm font-black">{opt.size}</span>
                          <span className="text-[10px] font-bold opacity-60">{opt.price} ج.م</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {features.length > 0 && (
                  <div className="bg-[#f0f7f4] p-6 rounded-[2rem] border border-[#e8f0ed] space-y-3">
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">مميزات المنتج:</h4>
                    {features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700 font-bold">
                        <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" /><span className="leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="space-y-2 pt-4">
                   <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">الوصف:</h4>
                   <p className="text-gray-500 leading-relaxed text-sm whitespace-pre-line">{product.desc}</p>
                </div>
              </div>

              {/* Key Info Section (At a Glance) */}
              {keyInfo.length > 0 && (
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
                   {keyInfo.map((info: any, i: number) => (
                     <div key={i} className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase">{info.label}</span>
                        <div className="text-sm font-black text-gray-800">{info.value}</div>
                     </div>
                   ))}
                </div>
              )}

              {/* Certifications (Dietary Icons) */}
              {certifications.length > 0 && (
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الشهادات والأنظمة الغذائية</h4>
                   <div className="flex flex-wrap gap-3">
                      {certifications.map((cert: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full">
                           <ShieldCheck size={16} className="text-primary" />
                           <span className="text-xs font-black text-primary">{cert}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <div className="flex items-center border border-[#e8f0ed] rounded-[1.5rem] bg-[#f0f7f4] p-1 px-4 h-16">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Minus size={16} /></button>
                  <span className="w-12 text-center font-black text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Plus size={16} /></button>
                </div>
                <button onClick={handleAddToCart} disabled={isAdded} className={`flex-1 h-16 rounded-[1.5rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${isAdded ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-primary/20'}`}>
                  {isAdded ? <><Check size={24} /> تم الإضافة</> : <><ShoppingCart size={24} /> إضافة للسلة</>}
                </button>
                <button onClick={() => toggleWishlist({ id: product.id, title: product.title, price: currentPrice, image: product.image, categoryId: product.categoryId || '' })} className={`w-16 h-16 rounded-[1.5rem] border border-[#e8f0ed] flex items-center justify-center transition-all ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-white hover:text-red-500'}`}><Heart size={24} fill={isFavorite ? "currentColor" : "none"} /></button>
              </div>
            </div>
          </div>

          {/* Advanced Details Sections (Bottom) */}
          <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-16">
              {/* Overview & Description */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  لمحة عامة
                </h2>
                <div className="prose prose-primary max-w-none">
                   <p className="text-gray-600 leading-relaxed font-medium">{product.desc}</p>
                </div>
              </div>

              {/* Usage & Ingredients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {product.usage && (
                   <div className="space-y-4">
                      <h3 className="text-lg font-black text-gray-800">طريقة الاستخدام</h3>
                      <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100">{product.usage}</p>
                   </div>
                 )}
                 {product.ingredients && (
                   <div className="space-y-4">
                      <h3 className="text-lg font-black text-gray-800">المكونات</h3>
                      <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100">{product.ingredients}</p>
                   </div>
                 )}
              </div>

              {/* Warnings & Disclaimer */}
              <div className="space-y-8">
                 {product.warnings && (
                   <div className="space-y-4">
                      <h3 className="text-lg font-black text-gray-800">تحذيرات</h3>
                      <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100">
                         <p className="text-sm text-red-700/80 leading-relaxed font-bold italic">{product.warnings}</p>
                      </div>
                   </div>
                 )}
                 {product.disclaimer && (
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">إخلاء مسؤولية</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed italic">{product.disclaimer}</p>
                   </div>
                 )}
              </div>
            </div>

            {/* Supplement Facts Sidebar (Right) */}
            <div className="lg:col-span-1">
              {supplementFactsRows.length > 0 && (
                <div className="bg-gray-900 text-white rounded-[3rem] p-8 shadow-2xl sticky top-24">
                   <div className="border-b border-white/10 pb-6 mb-6">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2">Supplement Facts</h2>
                      <div className="text-xs font-bold text-gray-400">الحصص لكل عبوة: بحسب المنتج</div>
                   </div>
                   <table className="w-full text-xs font-bold">
                      <thead>
                         <tr className="text-gray-400 border-b border-white/10">
                            <th className="py-2 text-right font-black">العنصر</th>
                            <th className="py-2 text-center">الكمية</th>
                            <th className="py-2 text-left font-black">DV%</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {supplementFactsRows.map((row: any, i: number) => (
                           <tr key={i}>
                              <td className="py-3 text-right">{row.name || row.label}</td>
                              <td className="py-3 text-center text-primary">{row.amount}</td>
                              <td className="py-3 text-left">{row.dv && row.dv !== '-' ? row.dv : '†'}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                   <div className="mt-6 pt-6 border-t border-white/10 text-[10px] text-gray-500 italic">
                      † القيمة اليومية غير محددة.
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-[#f0f7f4] border border-[#e8f0ed]">
               <div className="bg-white p-4 rounded-2xl text-primary shadow-sm"><ShieldCheck size={32} /></div>
               <span className="font-black text-gray-800">منتج أصلي 100%</span>
            </div>
            <div className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-[#f0f7f4] border border-[#e8f0ed]">
               <div className="bg-white p-4 rounded-2xl text-primary shadow-sm"><Truck size={32} /></div>
               <span className="font-black text-gray-800">توصيل سريع مجاني</span>
            </div>
            <div className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-[#f0f7f4] border border-[#e8f0ed]">
               <div className="bg-white p-4 rounded-2xl text-primary shadow-sm"><RotateCcw size={32} /></div>
               <span className="font-black text-gray-800">سياسة استرجاع مرنة</span>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
