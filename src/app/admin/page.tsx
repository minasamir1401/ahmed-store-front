"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  LayoutDashboard, Package, Tag, Award, FileText, Plus, Edit2, Trash2, Eye,
  Loader2, Lock, User, LogIn, X, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Layers, Building2, Search, RotateCcw, Sparkles, Menu, ShoppingCart, Printer, Truck
} from 'lucide-react'

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [activeTab, setActiveTab] = useState('products')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([
    { id: 'cmonkzdcq0000whysb7ljy2z2', name: "مكملات الأوميجا" },
    { id: 'cmonkzdd50001whyshu2vm1w9', name: "البشرة والشعر" },
    { id: 'cmonja7ec0001whwczxwylt69', name: "فيتامينات ومعادن" },
    { id: 'cmonkzdda0003whysjg212jjb', name: "مسكنات" },
    { id: 'cmonkzdde0004whys5br0gm4l', name: "الصحة الجنسية" },
    { id: 'cmonkzddj0005whyshfi6rwsb', name: "الصحة العامة" },
    { id: 'cmonkzddo0006whys3tt7jg85', name: "مكملات عشبية" },
    { id: 'cmonkzdds0007whysw04c5iu2', name: "التخسيس واللياقة" },
    { id: 'cmonkzddw0008whysrgmw2eub', name: "صحة الطفل" },
    { id: 'cmonkzde10009whysbllifetr', name: "الحمل والرضاعة" },
    { id: 'cmonkzde4000awhys5z8l4eqq', name: "فيتامينات متعددة" },
    { id: 'cmonkzde8000bwhys0y1i32qs', name: "عظام ومفاصل" },
    { id: 'cmonkzdec000cwhysv1374fwx', name: "أحماض أمينية" },
    { id: 'cmonja7dy0000whwcvhpt0kxi', name: "العناية بالبشرة" },
  ])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [isSEOLoading, setIsSEOLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [brandUploading, setBrandUploading] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  
  // Brand Suggestion State
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('mithaly_admin_auth')
    if (auth === 'true') setIsLoggedIn(true)
  }, [])

  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)
  const brandLogoRef = useRef<HTMLInputElement>(null)

  const tabs = [
    { id: 'products', label: 'المنتجات', icon: <Package size={18} />, endpoint: 'products' },
    { id: 'orders', label: 'الطلبات', icon: <ShoppingCart size={18} />, endpoint: 'orders' },
    { id: 'brands', label: 'الشركات', icon: <Building2 size={18} />, endpoint: 'brands' },
    { id: 'categories', label: 'الأقسام', icon: <Award size={18} />, endpoint: 'categories' },
    { id: 'offers', label: 'العروض', icon: <Tag size={18} />, endpoint: 'offers' },
    { id: 'hero', label: 'الهيرو', icon: <Layers size={18} />, endpoint: 'hero' },
  ]

  const [logs, setLogs] = useState<string[]>([])
  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5))

  const fetchData = async () => {
    if (!isLoggedIn) return
    setLoading(true)
    try {
      const endpoint = tabs.find(t => t.id === activeTab)?.endpoint
      addLog(`جاري طلب ${endpoint}...`)
      const res = await fetch(`/api/${endpoint}?t=${Date.now()}`)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const json = await res.json()
      if (activeTab === 'hero') {
        setFormData(json)
        setData([json])
      } else {
        setData(Array.isArray(json) ? json : [])
      }
      addLog(`تم جلب البيانات بنجاح`)
    } catch (err: any) { 
      console.error('Fetch error:', err)
      addLog(`خطأ: ${err.message}`)
    } finally { 
      setLoading(false) 
    }
  }

  const fetchMeta = async () => {
    try {
      addLog('جاري تحديث الأقسام والشركات...')
      const [catRes, brandRes] = await Promise.all([
        fetch(`/api/categories?t=${Date.now()}`),
        fetch(`/api/brands?t=${Date.now()}`)
      ])
      
      if (catRes.ok) {
        const cats = await catRes.json()
        setCategories(Array.isArray(cats) ? cats : [])
        addLog(`تم تحميل ${Array.isArray(cats) ? cats.length : 0} قسم`)
      }
      if (brandRes.ok) {
        const bnds = await brandRes.json()
        setBrands(Array.isArray(bnds) ? bnds : [])
        addLog(`تم تحميل ${Array.isArray(bnds) ? bnds.length : 0} شركة`)
      }
    } catch (err: any) { 
      addLog(`خطأ في البيانات الأساسية: ${err.message}`)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchData()
      fetchMeta()
    }
  }, [activeTab, isLoggedIn])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'mithaly2024') {
      setIsLoggedIn(true)
      localStorage.setItem('mithaly_admin_auth', 'true')
    } else {
      alert('بيانات الدخول خاطئة')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('mithaly_admin_auth')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      const endpoint = tabs.find(t => t.id === activeTab)?.endpoint
      await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleShipToAramex = async (id: string) => {
    if (!confirm('هل تريد إرسال هذا الطلب لشركة أورابيكس (Aramex)؟')) return
    addLog('جاري إرسال الطلب لشركة الشحن...')
    try {
      const res = await fetch(`/api/orders/${id}/ship`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        alert(`تم الإرسال بنجاح! رقم التتبع: ${json.trackingNumber}`)
        addLog(`تم الشحن: ${json.trackingNumber}`)
        fetchData()
      } else {
        alert('فشل الإرسال: ' + json.error)
      }
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    }
  }

  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState<any>(null)

  const handleFileUpload = async (file: File, type: 'main' | 'brand' | 'gallery' | 'side1' | 'side2') => {
    if (type === 'brand') setBrandUploading(true)
    else setUploading(true)
    
    const uploadData = new FormData()
    uploadData.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData })
      const result = await res.json()
      if (res.ok && result.url) {
        if (type === 'brand') setFormData((prev: any) => ({ ...prev, brandImage: result.url }))
        else if (type === 'main') setFormData((prev: any) => ({ ...prev, image: result.url }))
        else if (type === 'side1') setFormData((prev: any) => ({ ...prev, side1Image: result.url }))
        else if (type === 'side2') setFormData((prev: any) => ({ ...prev, side2Image: result.url }))
        else if (type === 'gallery') {
          setFormData((prev: any) => {
            const current = prev.images ? prev.images.split(',').filter(Boolean) : []
            return { ...prev, images: [...current, result.url].join(',') }
          })
        }
        addLog('تم رفع الصورة بنجاح')
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة')
      }
    } catch (err: any) { 
       alert('فشل الرفع: ' + err.message)
       addLog('خطأ في الرفع: ' + err.message)
    } finally { 
       setBrandUploading(false)
       setUploading(false)
    }
  }

  const handleOpenModal = (item: any = null) => {
    if (item) { 
      setEditingItem(item)
      setFormData({ 
        ...item, 
        brandName: item.brand?.name || '', 
        brandImage: item.brand?.image || '' 
      })
      setBrandSearch(item.brand?.name || '')
    } else {
      setEditingItem(null)
      setBrandSearch('')
      if (activeTab === 'products') {
        setFormData({ 
          title: '', desc: '', features: '', price: '', oldPrice: '', 
          image: '', images: '', sizes: '', brandName: '', brandImage: '',
          discountType: '', discountValue: '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          sizesPrices: '', productSpecs: '', keyInfo: '', certifications: '',
          overview: '', warnings: '', disclaimer: '', directions: '', ingredients: '', supplementFacts: ''
        })
      } else {
        setFormData({ name: '', title: '', image: '' })
      }
    }
    setIsModalOpen(true)
  }

  const handleAIFill = async () => {
    if (!formData.title) {
      alert('يرجى إدخال اسم المنتج أولاً في حقل "اسم المنتج"!');
      return;
    }
    setIsAILoading(true);
    addLog(`جاري جلب تفاصيل ${formData.title.substring(0, 15)}...`);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [
            {
              role: "system",
              content: `أنت خبير في المكملات الغذائية ومنتجات العناية. سيتم إعطاؤك اسم منتج.
قم بإرجاع تفاصيل هذا المنتج بصيغة JSON فقط، بدون أي نص إضافي.
يجب أن يكون الوصف بلهجة واضحة ومفهومة جداً للسوق المصري، وأن يكون مطولاً وشاملاً.
الهيكل المطلوب:
{
  "desc": "وصف مفصل جداً ومطول للمنتج (مفهوم للمصريين)، يشرح كل فوائده بالتفصيل ولماذا هو الخيار الأفضل.",
  "features": "قائمة شاملة وكاملة بكل مميزات المنتج وفوائده والمكونات النشطة بدون أي اختصار، كل ميزة في سطر منفصل (مثال: ميزة 1\\nميزة 2\\nميزة 3)",
  "brandName": "اسم الشركة المصنعة باللغة الإنجليزية",
  "brandImage": "رابط لوجو الشركة (استخدم https://logo.clearbit.com/brandname.com)",
  "price": السعر التقريبي بالجنيه المصري (كرقم صحيح، مثلا 150),
  "sizes": "الأحجام المتوفرة (مثال: 60 كبسولة) أو اتركها فارغة",
  "sizesPrices": "[{\\"size\\": \\"الحجم 1\\", \\"price\\": 150}, {\\"size\\": \\"الحجم 2\\", \\"price\\": 250}] (أو اتركها فارغة)",
  "productSpecs": "{\\"authentic\\": true, \\"bestBefore\\": \\"تاريخ\\", \\"firstAvailable\\": \\"تاريخ\\", \\"shippingWeight\\": \\"وزن\\", \\"sku\\": \\"رمز\\", \\"upc\\": \\"رمز\\", \\"quantity\\": \\"كمية\\", \\"dimensions\\": \\"أبعاد\\", \\"animalDerived\\": false} (أو اتركها فارغة)",
  "keyInfo": "{\\"servingSize\\": \\"حجم الجرعة\\", \\"totalServings\\": \\"إجمالي الحصص\\", \\"bestBefore\\": \\"تاريخ\\", \\"origin\\": \\"المنشأ\\"} (أو اتركها فارغة)",
  "certifications": "{\\"glutenFree\\": true, \\"dairyFree\\": true, \\"soyFree\\": true, \\"treeNutFree\\": true} (أو اتركها فارغة)",
  "overview": "لمحة عامة (HTML أو نص)",
  "warnings": "تحذيرات (نص)",
  "disclaimer": "إخلاء مسؤولية (نص)",
  "directions": "طريقة الاستخدام (نص)",
  "ingredients": "المكونات (نص)",
  "supplementFacts": "[{\\"name\\": \\"اسم العنصر\\", \\"amount\\": \\"الكمية\\", \\"dv\\": \\"النسبة\\"}...]"
}`
            },
            {
              role: "user",
              content: formData.title
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found in response");
        
        const jsonStr = match[0];
        const parsed = JSON.parse(jsonStr);

        setFormData((prev: any) => ({
          ...prev,
          desc: parsed.desc || prev.desc,
          features: parsed.features || prev.features,
          brandName: parsed.brandName || prev.brandName,
          brandImage: parsed.brandImage || prev.brandImage,
          price: parsed.price ? String(parsed.price) : prev.price,
          sizes: parsed.sizes || prev.sizes,
          sizesPrices: parsed.sizesPrices ? (typeof parsed.sizesPrices === 'string' ? parsed.sizesPrices : JSON.stringify(parsed.sizesPrices)) : prev.sizesPrices,
          productSpecs: parsed.productSpecs ? (typeof parsed.productSpecs === 'string' ? parsed.productSpecs : JSON.stringify(parsed.productSpecs)) : prev.productSpecs,
          keyInfo: parsed.keyInfo ? (typeof parsed.keyInfo === 'string' ? parsed.keyInfo : JSON.stringify(parsed.keyInfo)) : prev.keyInfo,
          certifications: parsed.certifications ? (typeof parsed.certifications === 'string' ? parsed.certifications : JSON.stringify(parsed.certifications)) : prev.certifications,
          overview: parsed.overview || prev.overview,
          warnings: parsed.warnings || prev.warnings,
          disclaimer: parsed.disclaimer || prev.disclaimer,
          directions: parsed.directions || prev.directions,
          ingredients: parsed.ingredients || prev.ingredients,
          supplementFacts: parsed.supplementFacts ? (typeof parsed.supplementFacts === 'string' ? parsed.supplementFacts : JSON.stringify(parsed.supplementFacts)) : prev.supplementFacts
        }));
        if (parsed.brandName) setBrandSearch(parsed.brandName);
        addLog("تم التوليد بنجاح!");
      } else {
         throw new Error(data.error?.message || "Invalid Response");
      }
    } catch (err) {
      console.error(err);
      addLog("فشل الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsAILoading(false);
    }
  }

  const handleSEOAI = async () => {
    if (!formData.title) {
      alert('يرجى إدخال اسم المنتج أو توليد البيانات الأساسية أولاً!');
      return;
    }
    setIsSEOLoading(true);
    addLog(`جاري توليد كلمات SEO لمنتج ${formData.title.substring(0, 15)}...`);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [
            {
              role: "system",
              content: `أنت خبير SEO مصري. قم بإرجاع بيانات JSON فقط (لا تكتب أي كلام آخر). 
الهيكل:
{
  "seoKeywords": "اكتب هنا 50 كلمة مفتاحية و 50 جملة بحث (Long-tail) باللهجة المصرية مفصولة بفاصلة.",
  "seoDesc": "وصف جذاب وطويل نسبياً (Meta Description) يستهدف السوق المصري."
}`
            },
            {
              role: "user",
              content: "اسم المنتج:\n" + formData.title + (formData.desc ? `\n\nالوصف:\n${formData.desc}` : "")
            }
          ]
        })
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (!isJson) {
        const text = await response.text();
        throw new Error(`Server Error: ${text}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        // استخراج الـ JSON بأمان
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("لم يقم الذكاء الاصطناعي بتوليد البيانات بالشكل الصحيح");
        
        const jsonStr = match[0];
        const parsed = JSON.parse(jsonStr);

        setFormData((prev: any) => ({
          ...prev,
          seoKeywords: parsed.seoKeywords || prev.seoKeywords,
          seoDesc: parsed.seoDesc || prev.seoDesc
        }));
        addLog("تم توليد الـ SEO بنجاح!");
      } else {
         throw new Error(data.error?.message || "Invalid Response from AI");
      }
    } catch (err) {
      console.error(err);
      addLog("فشل توليد الـ SEO.");
    } finally {
      setIsSEOLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (activeTab === 'hero') {
        const res = await fetch('/api/hero', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
           addLog('تم تحديث بيانات الهيرو بنجاح!')
           alert('تم الحفظ بنجاح! ✅')
           fetchData()
        } else {
           alert('فشل حفظ بيانات الهيرو')
        }
        setLoading(false)
        return
      }

      let finalBrandId = formData.brandId || null

      if (activeTab === 'products' && formData.brandName && formData.brandName.trim() !== '') {
        const existingBrand = brands.find(b => b.name.toLowerCase() === formData.brandName.trim().toLowerCase())
        if (existingBrand) {
          finalBrandId = existingBrand.id
        } else {
          const brandRes = await fetch('/api/brands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formData.brandName.trim(), image: formData.brandImage })
          })
          if (brandRes.ok) {
            const newBrand = await brandRes.json()
            finalBrandId = newBrand.id
          }
        }
      }

      const endpoint = tabs.find(t => t.id === activeTab)?.endpoint
      const method = editingItem ? 'PATCH' : 'POST'
      const url = editingItem ? `/api/${endpoint}/${editingItem.id}` : `/api/${endpoint}`
      
      const payload: any = { ...formData, brandId: finalBrandId }
      delete payload.brandName
      delete payload.brandImage
      delete payload.brand
      delete payload.category
      
      // Map UI state to Database schema fields
      if (payload.sizeOptions) {
        payload.sizesPrices = typeof payload.sizeOptions === 'string' ? payload.sizeOptions : JSON.stringify(payload.sizeOptions)
      }
      if (payload.specifications) {
        payload.productSpecs = typeof payload.specifications === 'string' ? payload.specifications : JSON.stringify(payload.specifications)
      }

      if (payload.price) {
        const p = parseFloat(payload.price)
        payload.price = isNaN(p) ? 0 : p
      } else {
        payload.price = 0
      }

      if (payload.oldPrice) {
        const op = parseFloat(payload.oldPrice)
        payload.oldPrice = isNaN(op) ? null : op
      } else {
        payload.oldPrice = null
      }

      if (payload.discountType && payload.discountValue) {
        const dv = parseFloat(payload.discountValue)
        payload.discountValue = isNaN(dv) ? null : dv
      } else {
        payload.discountType = null
        payload.discountValue = null
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) { 
        setIsModalOpen(false)
        await fetchData()
        alert('تم الحفظ بنجاح! ✅')
      } else {
        const errData = await res.json()
        alert(`فشل الحفظ: ${errData.error || 'خطأ غير معروف'}`)
      }
    } catch (err: any) { 
      alert(`خطأ: ${err.message}`) 
    } finally {
      setLoading(false)
    }
  }

  const filteredBrands = (Array.isArray(brands) ? brands : []).filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-md:max-w-md space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="bg-[#2e7d5e1a] w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-800">تسجيل الدخول للإدارة</h1>
            <p className="text-sm text-gray-500 font-bold">يرجى إدخال بيانات الاعتماد للوصول</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-600">اسم المستخدم</label>
              <div className="relative">
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-50 rounded-2xl py-3 pr-12 pl-4 font-bold outline-none border border-transparent focus:border-primary/30 transition-all" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-600">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 rounded-2xl py-3 pr-12 pl-4 font-bold outline-none border border-transparent focus:border-primary/30 transition-all" required />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <LogIn size={20} /> دخول
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <div className="bg-white border-b px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          <div className="bg-primary p-2 rounded-lg text-white">
            <LayoutDashboard size={20} className="md:w-6 md:h-6" />
          </div>
          <h1 className="text-lg md:text-xl font-black text-gray-800">إدارة المتجر</h1>
        </div>
        <button onClick={handleLogout} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">خروج</button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <aside className={`
          fixed inset-y-0 right-0 z-40 w-64 bg-white border-l p-6 flex flex-col shrink-0 transition-transform duration-300 transform shadow-2xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          ${isModalOpen ? 'hidden' : ''}
        `}>
          <div className="flex-1 space-y-2">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsSidebarOpen(false)
                  setIsModalOpen(false)
                }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 mr-2">حالة النظام</h4>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-[9px] text-gray-400 italic">لا توجد سجلات حالياً</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-[9px] font-bold text-gray-500 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:pr-64' : 'md:pr-0'} ${isModalOpen ? 'p-0 bg-white' : 'p-4 md:p-8'}`}>
          {!isModalOpen ? (
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b flex flex-col lg:flex-row lg:items-center justify-between bg-gray-50/30 gap-4">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="bg-white p-2.5 rounded-2xl border border-gray-100 flex items-center gap-2 shadow-sm w-full lg:min-w-[260px]">
                  <Search size={18} className="text-gray-400" />
                  <input type="text" placeholder="ابحث هنا..." className="bg-transparent text-sm font-bold w-full outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 w-full lg:w-auto justify-end">
                <button onClick={fetchData} className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all bg-white border border-gray-100 shadow-sm" title="تحديث البيانات">
                  <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                {activeTab !== 'hero' && activeTab !== 'orders' && (
                  <button onClick={() => handleOpenModal()} className="bg-primary text-white flex-1 lg:flex-none px-6 md:px-8 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap">
                    <Plus size={20} /> إضافة جديد
                  </button>
                )}
              </div>
            </div>
            
            {activeTab === 'hero' ? (
              <div className="p-6 md:p-10 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h4 className="text-sm font-black text-primary uppercase tracking-widest border-b pb-2">البانر الرئيسي</h4>
                      <div className="space-y-4">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 block mr-1">العنوان الرئيسي</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 block mr-1">العنوان الفرعي</label><input type="text" value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold" /></div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 block mr-1">رابط الصورة أو رفع صورة</label>
                          <div className="flex flex-col sm:flex-row gap-2">
                             <input type="text" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="flex-1 bg-gray-50 rounded-2xl py-4 px-6 font-bold" />
                             <div className="relative shrink-0">
                                <button type="button" className="w-full sm:w-auto bg-primary/10 text-primary px-4 h-full min-h-[56px] rounded-2xl font-bold flex items-center justify-center gap-2">
                                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                  <span className="sm:hidden text-sm">رفع صورة</span>
                                </button>
                                <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                             </div>
                          </div>
                          {formData.image && <img src={formData.image} className="mt-2 h-20 w-full object-cover rounded-xl border" alt="Hero" />}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 block mr-1">نص الزر</label><input type="text" value={formData.buttonText || ''} onChange={e => setFormData({...formData, buttonText: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold" /></div>
                           <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 block mr-1">رابط الزر</label><input type="text" value={formData.buttonLink || ''} onChange={e => setFormData({...formData, buttonLink: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold" /></div>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-sm font-black text-primary uppercase tracking-widest border-b pb-2">صناديق العرض الجانبية</h4>
                      <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-gray-400">الصندوق العلوي (الأقسام)</h5>
                           <input type="text" placeholder="العنوان" value={formData.side1Title || ''} onChange={e => setFormData({...formData, side1Title: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                           <input type="text" placeholder="الوصف" value={formData.side1Desc || ''} onChange={e => setFormData({...formData, side1Desc: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 block mr-1">رابط صورة الصندوق 1</label>
                              <div className="flex gap-2">
                                 <input type="text" value={formData.side1Image || ''} onChange={e => setFormData({...formData, side1Image: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                                 <div className="relative shrink-0">
                                    <button type="button" className="bg-gray-100 p-3 rounded-xl">
                                      <Upload size={16} />
                                    </button>
                                    <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'side1')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                 </div>
                              </div>
                           </div>
                           <input type="text" placeholder="رابط التوجيه (Link)" value={formData.side1Link || ''} onChange={e => setFormData({...formData, side1Link: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-gray-400">الصندوق السفلي (العروض)</h5>
                           <input type="text" placeholder="العنوان" value={formData.side2Title || ''} onChange={e => setFormData({...formData, side2Title: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                           <input type="text" placeholder="الوصف" value={formData.side2Desc || ''} onChange={e => setFormData({...formData, side2Desc: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 block mr-1">رابط صورة الصندوق 2</label>
                              <div className="flex gap-2">
                                 <input type="text" value={formData.side2Image || ''} onChange={e => setFormData({...formData, side2Image: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                                 <div className="relative shrink-0">
                                    <button type="button" className="bg-gray-100 p-3 rounded-xl">
                                      <Upload size={16} />
                                    </button>
                                    <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'side2')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                 </div>
                              </div>
                           </div>
                           <input type="text" placeholder="رابط التوجيه (Link)" value={formData.side2Link || ''} onChange={e => setFormData({...formData, side2Link: e.target.value})} className="w-full bg-white rounded-xl py-3 px-4 text-sm" />
                        </div>
                      </div>
                   </div>
                </div>
                <div className="flex justify-end pt-6 border-t">
                   <button onClick={handleSave} className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                     {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />} حفظ التعديلات
                   </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[600px]">
                  <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase border-b border-gray-100">
                    <tr className="text-right">
                      <th className="px-4 md:px-8 py-5">{activeTab === 'orders' ? 'رقم الطلب / العميل' : 'العنصر'}</th>
                      <th className="px-4 md:px-8 py-5">{activeTab === 'orders' ? 'الحالة / الإجمالي' : 'التفاصيل / السعر'}</th>
                      <th className="px-4 md:px-8 py-5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading && data.length === 0 ? (
                      <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
                    ) : (Array.isArray(data) ? data : []).filter(i => (i.title || i.name || i.orderNumber || i.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <tr><td colSpan={3} className="py-20 text-center text-gray-400 font-bold">لا توجد بيانات تطابق بحثك</td></tr>
                    ) : (
                      (Array.isArray(data) ? data : []).filter(i => (i.title || i.name || i.orderNumber || i.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                          <td className="px-4 md:px-8 py-5">
                            <div className="flex items-center gap-4">
                              {activeTab !== 'orders' && (
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                  <img src={item.image || 'https://placehold.co/400x400?text=No+Image'} className="h-full w-full object-cover group-hover:scale-110 transition-transform" alt="item" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs md:text-sm font-black text-gray-800 truncate max-w-[150px] md:max-w-none">
                                  {activeTab === 'orders' ? `#${item.orderNumber}` : (item.title || item.name || 'بدون عنوان')}
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold mt-0.5 flex flex-wrap items-center gap-2">
                                  {activeTab === 'orders' ? (
                                    <>
                                      <span>{item.customerName}</span>
                                      <span className="bg-gray-100 px-2 py-0.5 rounded">{item.customerPhone}</span>
                                      <span className="text-primary">{item.governorate}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="bg-gray-100 px-2 py-0.5 rounded">ID: {item.id.substring(0, 8)}</span>
                                      {item.categoryId && <span className="text-primary opacity-60">#{categories.find(c => c.id === item.categoryId)?.name}</span>}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <div className="text-[10px] md:text-xs font-black text-gray-600 bg-gray-50 w-fit px-3 py-1 rounded-lg">
                                {item.price ? `${item.price} ج.م` : (item.total ? `${item.total} ج.م` : (item.discount || '---'))}
                              </div>
                              {activeTab === 'orders' && (
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                  item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  item.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {item.status === 'pending' ? 'قيد الانتظار' : item.status === 'shipped' ? 'تم الشحن' : 'مكتمل'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 md:px-8 py-5">
                            <div className="flex gap-2 justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              {activeTab === 'orders' ? (
                                <>
                                  <button onClick={() => setSelectedOrderForWaybill(item)} className="p-2 md:p-2.5 text-primary hover:bg-primary/5 rounded-lg md:rounded-xl transition-colors" title="طباعة البوليصة"><Printer size={16} /></button>
                                  {item.status === 'pending' && (
                                    <button onClick={() => handleShipToAramex(item.id)} className="p-2 md:p-2.5 text-blue-500 hover:bg-blue-50 rounded-lg md:rounded-xl transition-colors" title="إرسال لشركة الشحن"><Truck size={16} /></button>
                                  )}
                                  <button onClick={() => handleDelete(item.id)} className="p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors" title="حذف"><Trash2 size={16} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleOpenModal(item)} className="p-2 md:p-2.5 text-blue-500 hover:bg-blue-50 rounded-lg md:rounded-xl transition-colors" title="تعديل"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors" title="حذف"><Trash2 size={16} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          ) : (
            <div className="bg-white min-h-screen flex flex-col">
              {/* Form Header */}
              <div className="bg-gray-50 border-b px-6 py-6 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:bg-white rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black text-gray-800 italic uppercase">إدارة {tabs.find(t => t.id === activeTab)?.label}</h3>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 transition-all">إلغاء</button>
                  <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'حفظ البيانات بالكامل'}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 md:p-12 max-w-6xl mx-auto w-full">
                <form onSubmit={handleSave} className="space-y-12 pb-20">
                  {activeTab === 'products' ? (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1 space-y-4">
                          <label className="text-xs font-black text-primary uppercase tracking-widest block mr-1">الصورة الرئيسية</label>
                          <div className="aspect-square bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                            {formData.image ? (
                              <>
                                <img src={formData.image} className="w-full h-full object-contain p-4" alt="preview" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-white p-3 rounded-2xl text-primary flex items-center gap-2 font-bold text-sm">
                                    <Edit2 size={18} /> تغيير الصورة
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload size={48} className="text-gray-300" />
                                <span className="text-[10px] font-bold text-gray-400">اختر صورة رئيسية</span>
                              </div>
                            )}
                            <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            {uploading && (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={32} />
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-6 space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">صور المعرض</label>
                            <div className="grid grid-cols-4 gap-3">
                              {(formData.images ? formData.images.split(',').filter(Boolean) : []).map((img: string, idx: number) => (
                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group shadow-sm hover:shadow-md transition-all">
                                  <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="gallery" />
                                  
                                  {/* Overlays for Change/Delete */}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="relative">
                                      <button type="button" className="bg-white text-primary p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[10px] font-black">
                                        <Edit2 size={14} /> استبدال
                                      </button>
                                      <input type="file" accept="image/*" onChange={async (e) => {
                                        if (!e.target.files?.[0]) return;
                                        setUploading(true);
                                        const uploadData = new FormData();
                                        uploadData.append('image', e.target.files[0]);
                                        try {
                                          const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
                                          const result = await res.json();
                                          if (res.ok && result.url) {
                                            const imgs = formData.images.split(',').filter(Boolean);
                                            imgs[idx] = result.url;
                                            setFormData({...formData, images: imgs.join(',')});
                                            addLog('تم استبدال الصورة بنجاح');
                                          }
                                        } catch (err) { alert('فشل الاستبدال'); }
                                        finally { setUploading(false); }
                                      }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    
                                    <button type="button" onClick={() => {
                                      if (!confirm('هل تريد حذف هذه الصورة من المعرض؟')) return;
                                      const imgs = formData.images.split(',').filter(Boolean);
                                      imgs.splice(idx, 1);
                                      setFormData({...formData, images: imgs.join(',')});
                                      addLog('تم حذف الصورة من المعرض');
                                    }} className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[10px] font-black">
                                      <Trash2 size={14} /> حذف
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className="relative aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                                {uploading ? <Loader2 className="animate-spin text-primary" size={20} /> : <Plus size={24} className="text-primary/40" />}
                                <input type="file" accept="image/*" multiple onChange={async (e) => {
                                  if (!e.target.files) return;
                                  const files = Array.from(e.target.files);
                                  for (const file of files) await handleFileUpload(file, 'gallery');
                                  e.target.value = '';
                                }} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-gray-800 block mr-1 uppercase">اسم المنتج</label>
                              <div className="flex gap-2">
                                <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="flex-1 bg-gray-50 rounded-2xl py-4 px-6 font-bold text-lg outline-none focus:bg-white focus:ring-2 ring-primary/10 transition-all border border-transparent focus:border-primary/20" placeholder="اسم المنتج..." required />
                                <button type="button" onClick={handleAIFill} disabled={isAILoading || !formData.title} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                                  {isAILoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                  <span>تعبئة بالذكاء الاصطناعي</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">القسم</label>
                                <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none border border-transparent focus:border-primary/20 transition-all" required>
                                  <option value="" disabled>اختر قسماً...</option>
                                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2 relative">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">الشركة المصنعة</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input type="text" value={brandSearch} onChange={e => {setBrandSearch(e.target.value); setFormData({...formData, brandName: e.target.value}); setShowBrandSuggestions(true)}} onFocus={() => setShowBrandSuggestions(true)} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none border border-transparent focus:border-primary/20 transition-all" placeholder="اسم الشركة..." />
                                    {showBrandSuggestions && brandSearch && (
                                      <div className="absolute top-full right-0 left-0 bg-white shadow-2xl rounded-2xl mt-2 z-50 border max-h-48 overflow-y-auto">
                                        {filteredBrands.length > 0 ? filteredBrands.map(b => (
                                          <button key={b.id} type="button" onClick={() => {setFormData({...formData, brandId: b.id, brandName: b.name}); setBrandSearch(b.name); setShowBrandSuggestions(false)}} className="w-full text-right px-6 py-3 hover:bg-gray-50 font-bold text-sm flex items-center gap-3">
                                            <img src={b.image} className="w-6 h-6 rounded-full object-cover" />
                                            {b.name}
                                          </button>
                                        )) : (
                                          <div className="px-6 py-3 text-xs text-gray-400 font-bold italic">سيتم إنشاء شركة جديدة باسم "{brandSearch}"</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="relative shrink-0">
                                     <button type="button" className="bg-gray-100 p-4 rounded-2xl hover:bg-gray-200 transition-all">
                                        {brandUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                                     </button>
                                     <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'brand')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">السعر الحالي</label>
                                <input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-black text-primary text-xl outline-none" placeholder="0.00" required />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">السعر القديم</label>
                                <input type="number" value={formData.oldPrice || ''} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-red-500 outline-none" placeholder="اختياري" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">نوع الخصم</label>
                                <div className="flex gap-2">
                                  <select value={formData.discountType || ''} onChange={e => setFormData({...formData, discountType: e.target.value})} className="flex-1 bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none">
                                    <option value="">بدون خصم</option>
                                    <option value="percentage">نسبة (%)</option>
                                    <option value="fixed">مبلغ ثابت</option>
                                  </select>
                                  {formData.discountType && (
                                    <input type="number" value={formData.discountValue || ''} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-24 bg-gray-50 rounded-2xl py-4 px-4 font-black text-center" placeholder="Val" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-xs font-black text-gray-800 block mr-1 uppercase">وصف المنتج (مطول)</label>
                            <textarea value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-gray-50 rounded-[2rem] py-6 px-8 font-bold min-h-[200px] outline-none focus:bg-white focus:ring-2 ring-primary/10 transition-all border border-transparent focus:border-primary/20" placeholder="اكتب وصفاً جذاباً ومفصلاً هنا..." required />
                          </div>

                          <div className="space-y-4">
                            <label className="text-xs font-black text-gray-800 block mr-1 uppercase">مميزات المنتج (كل ميزة في سطر)</label>
                            <textarea value={formData.features || ''} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-gray-50 rounded-[2rem] py-6 px-8 font-bold min-h-[150px] outline-none" placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3" />
                          </div>

                          <div className="bg-gray-50 rounded-[3rem] p-8 md:p-10 space-y-8">
                             <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2"><Sparkles size={18} /> تحسين محركات البحث (SEO)</h4>
                                <button type="button" onClick={handleSEOAI} disabled={isSEOLoading || !formData.title} className="text-xs bg-white text-primary px-4 py-2 rounded-xl font-black shadow-sm flex items-center gap-2 hover:bg-primary hover:text-white transition-all disabled:opacity-50">
                                   {isSEOLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} توليد كلمات SEO
                                </button>
                             </div>
                             <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-400 uppercase mr-1">كلمات مفتاحية (Meta Keywords)</label>
                                   <textarea value={formData.seoKeywords || ''} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="w-full bg-white rounded-2xl py-4 px-6 font-bold min-h-[100px] outline-none" placeholder="كلمة 1، جملة 2..." />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-400 uppercase mr-1">وصف البحث (Meta Description)</label>
                                   <textarea value={formData.seoDesc || ''} onChange={e => setFormData({...formData, seoDesc: e.target.value})} className="w-full bg-white rounded-2xl py-4 px-6 font-bold min-h-[80px] outline-none" placeholder="وصف يظهر في نتائج جوجل..." />
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">حقائق المكمل (Supplement Facts)</label>
                                <textarea value={formData.supplementFacts || ''} onChange={e => setFormData({...formData, supplementFacts: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold min-h-[150px] outline-none" placeholder='[{"name": "Vitamin C", "amount": "500mg", "dv": "556%"}]' />
                             </div>
                             <div className="space-y-4">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">خيارات الحجم والسعر (JSON)</label>
                                <textarea value={formData.sizesPrices || ''} onChange={e => setFormData({...formData, sizesPrices: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold min-h-[150px] outline-none" placeholder='[{"size": "60 Caps", "price": 100}]' />
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">المواصفات الفنية (JSON)</label>
                                <textarea value={formData.productSpecs || ''} onChange={e => setFormData({...formData, productSpecs: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold min-h-[150px] outline-none" placeholder='{"authentic": true, "sku": "123"}' />
                             </div>
                             <div className="space-y-4">
                                <label className="text-xs font-black text-gray-800 block mr-1 uppercase">الشهادات والتحذيرات</label>
                                <div className="space-y-4">
                                   <input type="text" value={formData.certifications || ''} onChange={e => setFormData({...formData, certifications: e.target.value})} placeholder="الشهادات (JSON)" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold" />
                                   <textarea value={formData.warnings || ''} onChange={e => setFormData({...formData, warnings: e.target.value})} placeholder="تحذيرات الاستخدام" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold min-h-[80px]" />
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-8 max-w-2xl mx-auto">
                      <div className="aspect-video bg-gray-50 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group">
                         {formData.image ? <img src={formData.image} className="w-full h-full object-contain" alt="preview" /> : <Upload size={48} className="text-gray-300" />}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-black text-sm">تغيير الصورة</span>
                         </div>
                         <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-xs font-black text-gray-800 block mr-1 uppercase">الاسم</label>
                           <input type="text" value={formData.name || formData.title || ''} onChange={e => setFormData({...formData, [activeTab === 'categories' ? 'name' : 'title']: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-5 px-8 font-black text-lg" placeholder="العنوان..." required />
                         </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Waybill Printing Overlay */}
      {selectedOrderForWaybill && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="absolute top-6 left-6 flex gap-2 no-print">
              <button 
                onClick={() => window.print()} 
                className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Printer size={18} /> طباعة
              </button>
              <button 
                onClick={() => setSelectedOrderForWaybill(null)} 
                className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 bg-white" id="waybill-content">
              {/* Waybill Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                <div>
                  <div className="text-3xl font-black text-primary mb-1 italic">MITHALY</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Premium Healthcare Store</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-gray-800">بوليصة شحن</div>
                  <div className="text-sm text-gray-400 font-bold">رقم الطلب: #{selectedOrderForWaybill.orderNumber}</div>
                  <div className="text-[10px] text-gray-400 font-bold mt-1">{new Date(selectedOrderForWaybill.createdAt).toLocaleString('ar-EG')}</div>
                </div>
              </div>

              {/* Waybill Body */}
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">المرسل</h4>
                    <div className="text-sm font-black text-gray-800">شركة مثالي للتجارة</div>
                    <div className="text-xs text-gray-500 font-bold mt-1">القاهرة، مصر</div>
                    <div className="text-xs text-gray-500 font-bold">01270029230</div>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">طريقة الدفع</h4>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-sm font-black text-gray-800">
                        {selectedOrderForWaybill.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع مسبق / محفظة'}
                      </div>
                      <div className="text-xs text-primary font-black mt-1">
                        الإجمالي: {selectedOrderForWaybill.total} ج.م
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">المرسل إليه (العميل)</h4>
                    <div className="text-sm font-black text-gray-800">{selectedOrderForWaybill.customerName}</div>
                    <div className="text-sm font-black text-primary mt-1">{selectedOrderForWaybill.customerPhone}</div>
                    <div className="text-xs text-gray-500 font-bold mt-2 leading-relaxed">
                      {selectedOrderForWaybill.governorate} - {selectedOrderForWaybill.district}<br />
                      {selectedOrderForWaybill.address}<br />
                      عمارة: {selectedOrderForWaybill.building}، دور: {selectedOrderForWaybill.floor}، شقة: {selectedOrderForWaybill.apartment}
                    </div>
                  </div>

                  {selectedOrderForWaybill.notes && (
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ملاحظات</h4>
                      <p className="text-[10px] text-gray-500 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 italic">{selectedOrderForWaybill.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-10">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-1">تفاصيل المحتويات</h4>
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 border-b">
                      <th className="py-2">المنتج</th>
                      <th className="py-2 text-center">الكمية</th>
                      <th className="py-2 text-left">السعر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderForWaybill.items?.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-3 text-xs font-black text-gray-700">{item.title}</td>
                        <td className="py-3 text-xs font-bold text-center">x{item.quantity}</td>
                        <td className="py-3 text-xs font-black text-left">{item.price} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="pt-4 text-xs font-bold text-gray-400 text-left">الشحن</td>
                      <td className="pt-4 text-xs font-black text-left">{selectedOrderForWaybill.shippingFee} ج.م</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-sm font-black text-gray-800 text-left">الإجمالي النهائي</td>
                      <td className="text-sm font-black text-primary text-left border-t-2 border-primary mt-2 pt-1">{selectedOrderForWaybill.total} ج.م</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Waybill Footer / Barcode Simulation */}
              <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
                <div className="w-64 h-16 bg-gray-100 rounded flex flex-col items-center justify-center border-x-8 border-black font-mono text-xl font-bold tracking-[0.5em] text-gray-800">
                  {selectedOrderForWaybill.orderNumber}
                </div>
                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Scan to confirm delivery</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #waybill-content, #waybill-content * { visibility: visible; }
          #waybill-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

