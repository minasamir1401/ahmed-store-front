import { useEffect, useRef, useState } from 'react'
import { useModal } from '@/context/ModalContext'
import {
  ADMIN_TABS,
  BACKEND_API,
  DEFAULT_CATEGORIES,
  DEFAULT_DOSAGE_CALCULATOR,
  parseAIJSON
} from '../admin-dashboard-utils'

type AIProvider = 'openrouter' | 'gemini'

export function useAdminDashboard() {
  const { showAlert, showConfirm } = useModal()
  const AI_MAX_TOKENS = {
    productFill: 1800,
    seo: 1800,
    tip: 1400
  }

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES)
  const [brands, setBrands] = useState<any[]>([])
  const [productsList, setProductsList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [isSEOLoading, setIsSEOLoading] = useState(false)
  const [isTranslatingLoading, setIsTranslatingLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [brandUploading, setBrandUploading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    if (typeof window !== 'undefined') {
      const savedProvider = localStorage.getItem('mithaly_ai_provider')
      return savedProvider === 'openrouter' ? 'openrouter' : 'gemini'
    }
    return 'gemini'
  })

  const handleAiProviderChange = (provider: AIProvider) => {
    setAiProvider(provider)
    localStorage.setItem('mithaly_ai_provider', provider)
    const providerNames = { gemini: 'Gemini (مباشر)', openrouter: 'OpenRouter' }
    addLog(`تم تغيير مزود الذكاء الاصطناعي إلى ${providerNames[provider]}`)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [supplementFactsList, setSupplementFactsList] = useState<any[]>([])
  const [sizesPricesList, setSizesPricesList] = useState<any[]>([])
  const [productSpecsObj, setProductSpecsObj] = useState<any>({})
  const [keyInfoObj, setKeyInfoObj] = useState<any>({})
  const [certificationsObj, setCertificationsObj] = useState<any>({})
  const [dosageCalculatorObj, setDosageCalculatorObj] = useState<any>(DEFAULT_DOSAGE_CALCULATOR)
  const [faqsList, setFaqsList] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    pendingOrders: 0
  })
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [whatsappStatus, setWhatsappStatus] = useState<any>({ status: 'disconnected', qr: '' })
  const [wsLoading, setWsLoading] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState<any>(null)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null)

  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)
  const brandLogoRef = useRef<HTMLInputElement>(null)

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 4))

  const clearAdminSession = () => {
    setIsLoggedIn(false)
    setAdminToken(null)
    localStorage.removeItem('mithaly_admin_auth')
    localStorage.removeItem('mithaly_admin_token')
  }

  const splitLocalizedText = (value: any) => {
    if (typeof value !== 'string') return { ar: value || '', en: '' }
    const trimmed = value.trim()
    if (!trimmed.startsWith('{')) return { ar: value, en: '' }
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object' && ('ar' in parsed || 'en' in parsed)) {
        return { ar: parsed.ar || '', en: parsed.en || '' }
      }
    } catch {
      // Keep original value if it is not a bilingual JSON string.
    }
    return { ar: value, en: '' }
  }

  const normalizeProductTranslations = (item: any) => {
    const title = splitLocalizedText(item.title)
    const desc = splitLocalizedText(item.desc)
    const features = splitLocalizedText(item.features)
    const usage = splitLocalizedText(item.usage)
    const ingredients = splitLocalizedText(item.ingredients)
    const warnings = splitLocalizedText(item.warnings)
    const disclaimer = splitLocalizedText(item.disclaimer)
    const seoKeywords = splitLocalizedText(item.seoKeywords)
    const seoDesc = splitLocalizedText(item.seoDesc)

    return {
      ...item,
      title: title.ar,
      titleEn: item.titleEn || title.en || '',
      desc: desc.ar,
      descEn: item.descEn || desc.en || '',
      features: features.ar,
      featuresEn: item.featuresEn || features.en || '',
      usage: usage.ar,
      usageEn: item.usageEn || usage.en || '',
      directions: item.directions || usage.ar || '',
      ingredients: ingredients.ar,
      ingredientsEn: item.ingredientsEn || ingredients.en || '',
      warnings: warnings.ar,
      warningsEn: item.warningsEn || warnings.en || '',
      disclaimer: disclaimer.ar,
      disclaimerEn: item.disclaimerEn || disclaimer.en || '',
      seoKeywords: seoKeywords.ar,
      seoKeywordsEn: item.seoKeywordsEn || seoKeywords.en || '',
      seoDesc: seoDesc.ar,
      seoDescEn: item.seoDescEn || seoDesc.en || ''
    }
  }

  const mergeSeoKeywords = (currentKeywords = '', newKeywords = '') => {
    const seen = new Set<string>()
    return [currentKeywords, newKeywords]
      .flatMap(value => value.split(/[،,]/))
      .map(value => value.trim())
      .filter(value => {
        if (!value) return false
        const normalized = value.toLowerCase()
        if (seen.has(normalized)) return false
        seen.add(normalized)
        return true
      })
      .join(', ')
  }

  const appendSeoText = (currentText = '', newText = '') => {
    const current = currentText.trim()
    const next = newText.trim()
    if (!next) return current
    if (!current) return next
    if (current.toLowerCase().includes(next.toLowerCase())) return current
    return `${current}\n\n${next}`
  }

  const getAuthHeaders = (contentType: string | null = 'application/json') => {
    const token = localStorage.getItem('mithaly_admin_token')
    const headers: any = {}
    if (contentType) headers['Content-Type'] = contentType
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  const fetchWithAdminAuth = async (url: string, init: RequestInit = {}, contentType: string | null = 'application/json') => {
    const token = localStorage.getItem('mithaly_admin_token')
    if (!token) {
      clearAdminSession()
      throw new Error('يجب تسجيل الدخول كمسؤول أولاً')
    }

    const headers = new Headers(getAuthHeaders(contentType))
    new Headers(init.headers).forEach((value, key) => headers.set(key, value))

    const res = await fetch(url, { ...init, headers })
    if (res.status === 401) {
      clearAdminSession()
      await showAlert('انتهت جلسة المسؤول. سجل الدخول مرة أخرى ثم أعد رفع الصورة.', 'انتهت الجلسة')
      const error = new Error('انتهت جلسة المسؤول')
        ; (error as any).isAdminUnauthorized = true
      throw error
    }
    return res
  }

  const fetchWhatsappStatus = async () => {
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/whatsapp/status?t=${Date.now()}`)
      if (res.ok) setWhatsappStatus(await res.json())
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const [ordRes, prodRes, brandRes, catRes] = await Promise.all([
        fetchWithAdminAuth(`${BACKEND_API}/api/orders?t=${Date.now()}`),
        fetch(`${BACKEND_API}/api/products?t=${Date.now()}`),
        fetch(`${BACKEND_API}/api/brands?t=${Date.now()}`),
        fetch(`${BACKEND_API}/api/categories?t=${Date.now()}`)
      ])

      let ords: any[] = []
      let prods: any[] = []
      let bnds: any[] = []
      let cats: any[] = []

      if (ordRes.ok) ords = await ordRes.json()
      if (prodRes.ok) prods = await prodRes.json()
      if (brandRes.ok) bnds = await brandRes.json()
      if (catRes.ok) cats = await catRes.json()

      const sales = ords.reduce((acc: number, o: any) => acc + (o.status === 'delivered' ? o.total : 0), 0)
      const pending = ords.filter((o: any) => o.status === 'pending').length

      setStats({
        totalSales: sales,
        totalOrders: ords.length,
        totalProducts: prods.length,
        totalBrands: bnds.length,
        totalCategories: cats.length,
        pendingOrders: pending
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchMeta = async () => {
    try {
      addLog('جاري تحديث البيانات...')
      const [catRes, brandRes, prodRes] = await Promise.all([
        fetch(`${BACKEND_API}/api/categories?t=${Date.now()}`),
        fetch(`${BACKEND_API}/api/brands?t=${Date.now()}`),
        fetch(`${BACKEND_API}/api/products?t=${Date.now()}`)
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
      if (prodRes.ok) {
        const prods = await prodRes.json()
        setProductsList(Array.isArray(prods) ? prods : [])
        addLog(`تم تحميل ${Array.isArray(prods) ? prods.length : 0} منتج`)
      }
    } catch (err: any) {
      addLog(`خطأ في البيانات الأساسية: ${err.message}`)
    }
  }

  const fetchData = async () => {
    if (!isLoggedIn) return
    if (activeTab === 'whatsapp') return
    if (activeTab === 'admin-settings') {
      setLoading(true)
      try {
        const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/profile?t=${Date.now()}`)
        if (res.ok) {
          const json = await res.json()
          setAdminEmail(json.email || '')
          setAdminName(json.name || '')
          setAdminPassword('')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const endpoint = ADMIN_TABS.find(t => t.id === activeTab)?.endpoint
      addLog(`جاري طلب ${endpoint}...`)
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/${endpoint}?t=${Date.now()}`)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const json = await res.json()
      if (activeTab === 'hero') {
        setFormData(json)
        setData([json])
      } else {
        setData(Array.isArray(json) ? json : [])
      }
      addLog('تم جلب البيانات بنجاح')
      fetchStats()
    } catch (err: any) {
      console.error('Fetch error:', err)
      addLog(`خطأ: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(BACKEND_API + '/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const result = await res.json()
      if (res.ok && result.token) {
        setIsLoggedIn(true)
        setAdminToken(result.token)
        localStorage.setItem('mithaly_admin_auth', 'true')
        localStorage.setItem('mithaly_admin_token', result.token)
        addLog('تم تسجيل الدخول كمسؤول بنجاح')
      } else {
        await showAlert(result.error || 'بيانات الدخول خاطئة', 'خطأ في تسجيل الدخول')
      }
    } catch (err: any) {
      await showAlert('حدث خطأ في الاتصال بالخادم: ' + err.message, 'خطأ في الاتصال')
    }
  }

  const handleLogout = () => {
    clearAdminSession()
  }

  const handleDelete = async (id: string) => {
    if (!(await showConfirm('هل أنت متأكد من الحذف؟', 'تأكيد الحذف'))) return
    try {
      const endpoint = ADMIN_TABS.find(t => t.id === activeTab)?.endpoint
      await fetchWithAdminAuth(`${BACKEND_API}/api/${endpoint}/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleShipToAramex = async (id: string) => {
    if (!(await showConfirm('هل تريد إرسال هذا الطلب لشركة أورابيكس (Aramex)؟', 'تأكيد الشحن'))) return
    addLog('جاري إرسال الطلب لشركة الشحن...')
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/orders/${id}/ship`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        await showAlert(`تم الإرسال بنجاح! رقم التتبع: ${json.trackingNumber}`, 'شحن ناجح')
        addLog(`تم الشحن: ${json.trackingNumber}`)
        fetchData()
      } else {
        await showAlert('فشل الإرسال: ' + json.error, 'خطأ في الشحن')
      }
    } catch (err: any) {
      await showAlert('خطأ: ' + err.message, 'خطأ')
    }
  }

  const handleWhatsappLogout = async () => {
    if (!(await showConfirm('هل أنت متأكد من تسجيل الخروج من واتساب؟ سيتوقف إرسال الرسائل وتنبيهات الطلبات حتى تقوم بربط الحساب مرة أخرى.', 'تسجيل خروج واتساب'))) return
    setWsLoading(true)
    try {
      const res = await fetchWithAdminAuth(BACKEND_API + '/api/whatsapp/logout', { method: 'POST' })
      if (res.ok) {
        await showAlert('تم تسجيل الخروج بنجاح وجاري إعادة تهيئة النظام لطلب رمز جديد...', 'تم تسجيل الخروج')
        fetchWhatsappStatus()
      } else {
        const err = await res.json()
        await showAlert('فشل تسجيل الخروج: ' + (err.error || 'خطأ غير معروف'), 'خطأ')
      }
    } catch (err: any) {
      await showAlert('خطأ في الاتصال بالخادم: ' + err.message, 'خطأ')
    } finally {
      setWsLoading(false)
    }
  }

  const uploadAdminImage = async (file: File, altText: string, title?: string) => {
    const uploadData = new FormData()
    uploadData.append('image', file)
    uploadData.append('altText', altText || file.name)
    if (title) uploadData.append('title', title)

    const res = await fetchWithAdminAuth(BACKEND_API + '/api/upload', { method: 'POST', body: uploadData }, null)
    const result = await res.json()
    if (!res.ok || !result.url) {
      throw new Error(result.error || 'فشل في رفع الصورة')
    }
    return result
  }

  const handleFileUpload = async (file: File, type: 'main' | 'brand' | 'gallery' | 'side1' | 'side2' | 'prod1' | 'prod2' | 'prod3' | 'prod4') => {
    if (!file) return
    if (type === 'brand') setBrandUploading(true)
    else setUploading(true)

    try {
      const altText = type === 'brand' ? formData.brandName : formData.imageAlt || formData.title || file.name
      const result = await uploadAdminImage(file, altText, formData.title)
      if (type === 'brand') setFormData((prev: any) => ({ ...prev, brandImage: result.url }))
      else if (type === 'main') setFormData((prev: any) => ({
        ...prev,
        image: result.url,
        imageAlt: prev.imageAlt || result.altText || prev.title || '',
        imageWidth: result.width || prev.imageWidth || null,
        imageHeight: result.height || prev.imageHeight || null
      }))
      else if (type === 'side1') setFormData((prev: any) => ({ ...prev, side1Image: result.url }))
      else if (type === 'side2') setFormData((prev: any) => ({ ...prev, side2Image: result.url }))
      else if (type.startsWith('prod')) setFormData((prev: any) => ({ ...prev, [`${type}Image`]: result.url }))
      else if (type === 'gallery') {
        setFormData((prev: any) => {
          const current = prev.images ? prev.images.split(',').filter(Boolean) : []
          return { ...prev, images: [...current, result.url].join(',') }
        })
      }
      addLog('تم رفع الصورة بنجاح')
    } catch (err: any) {
      if (err.isAdminUnauthorized) {
        addLog('انتهت جلسة المسؤول أثناء رفع الصورة')
        return
      }
      await showAlert('فشل الرفع: ' + err.message, 'خطأ في الرفع')
      addLog('خطأ في الرفع: ' + err.message)
    } finally {
      setBrandUploading(false)
      setUploading(false)
    }
  }

  const handleOpenModal = (item: any = null) => {
    if (item) {
      const normalizedItem = normalizeProductTranslations(item)
      setEditingItem(item)
      setFormData({
        ...normalizedItem,
        brandName: normalizedItem.brand?.name || '',
        brandImage: normalizedItem.brand?.image || ''
      })
      setBrandSearch(item.brand?.name || '')
      try {
        setSupplementFactsList(item.supplementFacts ? (typeof item.supplementFacts === 'string' ? JSON.parse(item.supplementFacts) : item.supplementFacts) : [])
      } catch {
        setSupplementFactsList([])
      }
      try {
        setSizesPricesList(item.sizeOptions ? (typeof item.sizeOptions === 'string' ? JSON.parse(item.sizeOptions) : item.sizeOptions) : [])
      } catch {
        setSizesPricesList([])
      }
      try {
        setProductSpecsObj(item.specifications ? (typeof item.specifications === 'string' ? JSON.parse(item.specifications) : item.specifications) : {})
      } catch {
        setProductSpecsObj({})
      }
      try {
        setKeyInfoObj(item.keyInfo ? (typeof item.keyInfo === 'string' ? JSON.parse(item.keyInfo) : item.keyInfo) : {})
      } catch {
        setKeyInfoObj({})
      }
      try {
        setCertificationsObj(item.certifications ? (typeof item.certifications === 'string' ? JSON.parse(item.certifications) : item.certifications) : {})
      } catch {
        setCertificationsObj({})
      }
      try {
        setDosageCalculatorObj(item.dosageCalculator ? (typeof item.dosageCalculator === 'string' ? JSON.parse(item.dosageCalculator) : item.dosageCalculator) : DEFAULT_DOSAGE_CALCULATOR)
      } catch {
        setDosageCalculatorObj(DEFAULT_DOSAGE_CALCULATOR)
      }
      try {
        setFaqsList(item.faqs ? (typeof item.faqs === 'string' ? JSON.parse(item.faqs) : item.faqs) : [])
      } catch {
        setFaqsList([])
      }
    } else {
      setEditingItem(null)
      setBrandSearch('')
      setSupplementFactsList([])
      setSizesPricesList([])
      setProductSpecsObj({ authentic: true })
      setKeyInfoObj({})
      setCertificationsObj({ glutenFree: true, nonGmo: true })
      setDosageCalculatorObj(DEFAULT_DOSAGE_CALCULATOR)
      setFaqsList([])
      if (activeTab === 'products') {
        setFormData({
          title: '', desc: '', features: '', price: '', oldPrice: '',
          image: '', images: '', sizes: '', brandName: '', brandImage: '',
          discountType: '', discountValue: '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          sizesPrices: '', productSpecs: '', keyInfo: '', certifications: '',
          overview: '', warnings: '', disclaimer: '', directions: '', ingredients: '', supplementFacts: '', dosageCalculator: '',
          titleEn: '', descEn: '', featuresEn: '', usageEn: '', ingredientsEn: '', warningsEn: '', disclaimerEn: '', seoKeywordsEn: '', seoDescEn: ''
        })
      } else if (activeTab === 'offers') {
        setFormData({ title: '', discount: '', image: '', productId: '' })
      } else if (activeTab === 'medical-tips') {
        setFormData({ title: '', titleEn: '', content: '', contentEn: '', image: '' })
      } else {
        setFormData({ name: '', nameEn: '', title: '', image: '' })
      }
    }
    setIsModalOpen(true)
  }

  const handleAIFill = async (providerOverride?: AIProvider) => {
    if (!formData.title) {
      await showAlert('يرجى إدخال اسم المنتج أولاً في حقل "اسم المنتج"!', 'حقل مطلوب')
      return
    }
    setIsAILoading(true)
    const activeProvider = providerOverride || aiProvider
    const providerNames = { gemini: 'Gemini', openrouter: 'OpenRouter' }
    addLog(`جاري جلب تفاصيل ${formData.title.substring(0, 15)} باستخدام ${providerNames[activeProvider]}...`)
    try {
      const response = await fetchWithAdminAuth('/services/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          provider: activeProvider,
          max_tokens: AI_MAX_TOKENS.productFill,
          model: 'google/gemma-4-31b-it:free',
          models: [
            'google/gemma-4-31b-it:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openrouter/free'
          ],
          messages: [
            {
              role: 'system',
              content: `أنت خبير محتوى منتجات وSEO للمتاجر الإلكترونية.
سيتم إعطاؤك اسم منتج فقط.
مهمتك هي كتابة معلومات منتج عملية ومباشرة تساعد العميل على الشراء، بدون أسلوب إنشائي أو مبالغة أو كلام تسويقي فارغ.
اكتب باللهجة العربية المصرية الواضحة، وبنبرة بيع محترمة ومختصرة، وركز على:
- ماذا يفعل المنتج
- أهم فوائده الفعلية
- لمن يناسب
- طريقة الاستخدام أو أهم النقاط العملية إن كانت معروفة من اسم المنتج
- أي تفاصيل مفيدة للشراء أو المقارنة

قم بإرجاع تفاصيل هذا المنتج بصيغة JSON فقط، بدون أي نص إضافي.
يجب أن يكون الوصف واضحاً ومفيداً ومقسماً بشكل يسهل قراءته.
يرجى تحليل مواصفات ومكونات المنتج وتحديد قيم الشهادات الستة التالية بدقة كقيم منطقية (true أو false) بداخل كائن certifications:
- خالي من الجلوتين (glutenFree)
- خالي من الألبان (dairyFree)
- خالي من الصويا (soyFree)
- خالي من المكسرات (treeNutFree)
- غير معدل وراثياً (nonGmo)
- منتج عضوي (organic)

الهيكل المطلوب:
{
  "desc": "وصف منتج عملي ومباشر ومطول قليلاً، يشرح الوظيفة الرئيسية للمنتج والفوائد المهمة ولماذا يشتريه العميل، بصياغة سهلة ومناسبة للسوق المصري، وبدون مبالغة.",
  "features": "قائمة مميزات المنتج والفوائد والمكونات النشطة الأساسية، كل ميزة في سطر منفصل (مثال: ميزة 1\\nميزة 2\\nميزة 3)",
  "brandName": "اسم الشركة المصنعة باللغة الإنجليزية",
  "brandImage": "رابط لوجو الشركة (استخدم https://www.google.com/s2/favicons?domain=brandname.com&sz=128)",
  "price": السعر التقريبي بالجنيه المصري (كرقم صحيح، مثلا 150),
  "sizes": "الأحجام المتوفرة (مثال: 60 كبسولة) أو اتركها فارغة",
  "sizesPrices": "[{\\"size\\": \\"الحجم 1\\", \\"price\\": 150}, {\\"size\\": \\"الحجم 2\\", \\"price\\": 250}]",
  "productSpecs": "{\\"authentic\\": true, \\"sku\\": \\"رمز\\", \\"shippingWeight\\": \\"وزن\\"}",
  "keyInfo": "{\\"servingSize\\": \\"حجم الجرعة\\", \\"totalServings\\": \\"إجمالي الحصص\\", \\"bestBefore\\": \\"تاريخ\\", \\"origin\\": \\"المنشأ\\"}",
  "certifications": "{\\"glutenFree\\": true/false, \\"dairyFree\\": true/false, \\"soyFree\\": true/false, \\"treeNutFree\\": true/false, \\"nonGmo\\": true/false, \\"organic\\": true/false}",
  "warnings": "تحذيرات (نص)",
  "directions": "طريقة الاستخدام (نص)",
  "ingredients": "المكونات (نص)",
  "supplementFacts": "[{\\"name\\": \\"Vitamin C\\", \\"amount\\": \\"500mg\\", \\"dv\\": \\"556%\\"}]",
  "seoKeywords": "كلمات بحث قصيرة وطويلة مرتبطة باسم المنتج والفائدة الرئيسية وسوق الشراء، مفصولة بفواصل فقط",
  "seoDesc": "وصف ميتا قصير ومقنع يشرح المنتج ويشجع على الشراء ويحتوي على الكلمات الأساسية المهمة بشكل طبيعي",
  "faqs": "[{\\"question_ar\\": \\"سؤال بالعربي\\", \\"answer_ar\\": \\"إجابة بالعربي\\", \\"question_en\\": \\"Question in English\\", \\"answer_en\\": \\"Answer in English\\"}]",
  "dosageCalculator": "{\\"enabled\\": true/false (true if product requires dose calc like vitamins/minerals/sports supplements, false for general creams/beauty), \\"genderTarget\\": \\"both\\"/\\"male\\"/\\"female\\", \\"title\\": \\"حاسبة الجرعة الموصى بها (مثال: حاسبة جرعة المغنيسيوم الذكية)\\", \\"icon\\": \\"Activity\\"/\\"Sun\\"/\\"Droplet\\"/\\"Moon\\"/\\"Dumbbell\\"/\\"Sparkles\\", \\"optionsLabel\\": \\"الهدف الأساسي:\\", \\"rules\\": [{\\"value\\": \\"sleep\\", \\"label\\": \\"النوم والاسترخاء\\", \\"icon\\": \\"Moon\\", \\"maleDose\\": \\"400 ملجم من المغنيسيوم العنصري\\", \\"maleCapsules\\": \\"كبسولتين يومياً\\", \\"maleTip\\": \\"يفضل تناوله قبل النوم بـ 30-60 دقيقة.\\", \\"femaleDose\\": \\"320 ملجم من المغنيسيوم العنصري\\", \\"femaleCapsules\\": \\"كبسولتين يومياً\\", \\"femaleTip\\": \\"يفضل تناوله قبل النوم بـ 30-60 دقيقة.\\"}]}"
}`
            },
            { role: 'user', content: formData.title }
          ]
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || `AI request failed (${response.status})`)
      }

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const parsed = parseAIJSON(data.choices[0].message.content)
        setFormData((prev: any) => ({
          ...prev,
          desc: parsed.desc || prev.desc,
          features: parsed.features || prev.features,
          brandName: parsed.brandName || prev.brandName,
          brandImage: parsed.brandImage || prev.brandImage,
          price: parsed.price ? String(parsed.price) : prev.price,
          sizes: parsed.sizes || prev.sizes,
          seoKeywords: parsed.seoKeywords || prev.seoKeywords,
          seoDesc: parsed.seoDesc || prev.seoDesc,
          warnings: parsed.warnings || prev.warnings,
          directions: parsed.directions || prev.directions,
          ingredients: parsed.ingredients || prev.ingredients
        }))

        try {
          setSupplementFactsList(parsed.supplementFacts ? (typeof parsed.supplementFacts === 'string' ? JSON.parse(parsed.supplementFacts) : parsed.supplementFacts) : [])
        } catch {
          setSupplementFactsList([])
        }
        try {
          setSizesPricesList(parsed.sizesPrices ? (typeof parsed.sizesPrices === 'string' ? JSON.parse(parsed.sizesPrices) : parsed.sizesPrices) : [])
        } catch {
          setSizesPricesList([])
        }
        try {
          setProductSpecsObj(parsed.productSpecs ? (typeof parsed.productSpecs === 'string' ? JSON.parse(parsed.productSpecs) : parsed.productSpecs) : { authentic: true })
        } catch {
          setProductSpecsObj({ authentic: true })
        }
        try {
          setKeyInfoObj(parsed.keyInfo ? (typeof parsed.keyInfo === 'string' ? JSON.parse(parsed.keyInfo) : parsed.keyInfo) : {})
        } catch {
          setKeyInfoObj({})
        }
        try {
          setCertificationsObj(parsed.certifications ? (typeof parsed.certifications === 'string' ? JSON.parse(parsed.certifications) : parsed.certifications) : {})
        } catch {
          setCertificationsObj({})
        }
        try {
          setDosageCalculatorObj(parsed.dosageCalculator ? (typeof parsed.dosageCalculator === 'string' ? JSON.parse(parsed.dosageCalculator) : parsed.dosageCalculator) : DEFAULT_DOSAGE_CALCULATOR)
        } catch {
          setDosageCalculatorObj(DEFAULT_DOSAGE_CALCULATOR)
        }
        try {
          if (parsed.faqs) {
            setFaqsList(typeof parsed.faqs === 'string' ? JSON.parse(parsed.faqs) : parsed.faqs)
          }
        } catch {
          // keep existing if error
        }

        if (parsed.brandName) setBrandSearch(parsed.brandName)
        addLog('تم التوليد وتعبئة الحقول بنجاح!')
      } else {
        throw new Error(data.error?.message || 'Invalid Response')
      }
    } catch (err) {
      console.error(err)
      addLog('فشل الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.')
    } finally {
      setIsAILoading(false)
    }
  }

  const handleSEOAI = async (providerOverride?: AIProvider) => {
    if (!formData.title) {
      await showAlert('يرجى إدخال اسم المنتج أو توليد البيانات الأساسية أولاً!', 'حقل مطلوب')
      return
    }
    setIsSEOLoading(true)
    const activeProvider = providerOverride || aiProvider
    const providerNames = { gemini: 'Gemini', openrouter: 'OpenRouter' }
    addLog(`جاري توليد كلمات SEO لمنتج ${formData.title.substring(0, 15)} باستخدام ${providerNames[activeProvider]}...`)
    try {
      const response = await fetchWithAdminAuth('/services/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          provider: activeProvider,
          max_tokens: AI_MAX_TOKENS.seo,
          model: 'google/gemma-4-31b-it:free',
          models: [
            'google/gemma-4-31b-it:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openrouter/free'
          ],
          messages: [
            {
              role: 'system',
              content: `أنت خبير SEO محترف جداً لمتاجر المكملات والمنتجات الصحية في السوق المصري.
مهمتك هي استخراج أقصى قيمة SEO ممكنة من بيانات المنتج الحالية، مع صياغة قوية تساعد المنتج يظهر في نتائج بحث جوجل وتساعد العميل يقرر الشراء.
اكتب محتوى عملي ومفيد مبني على التفاصيل الفعلية فقط، بدون ادعاءات طبية علاجية مبالغ فيها وبدون حشو عام.
استخدم لغة عربية مصرية مفهومة واحترافية، مع تنسيق لغوي واضح وعلامات ترقيم جيدة، واذكر الاسم الإنجليزي أو المادة الفعالة إن كانت موجودة.
ركّز على:
- اسم المنتج التجاري والعلمي بالعربي والإنجليزي إن وجد
- المادة الفعالة والتركيز والحجم
- الفئة الرئيسية مثل فيتامينات، معادن، أوميجا، أعشاب، عظام ومفاصل، نوم، طاقة، شعر وبشرة
- نية البحث الشرائية مثل السعر، أفضل نوع، شراء، في مصر، الأصلي، مستورد، طريقة الاستخدام
- الفوائد الواقعية المذكورة في بيانات المنتج فقط
- كلمات طويلة Long-tail بجانب الكلمات القصيرة

قواعد مهمة:
- لا تستخدم Markdown.
- لا تكتب أي نص خارج JSON.
- لا تجعل العنوان طويلاً جداً، لكن اجعله غني بالكلمات المهمة.
- وصف الميتا يجب أن يكون مقنعاً ومناسباً للظهور في جوجل، ويفضل بين 150 و 220 حرفاً تقريباً.
- الكلمات المفتاحية يجب أن تكون كثيرة ومنوعة ومفصولة بفواصل، وتشمل عربي وإنجليزي، ومرادفات، ونوايا شراء، ولا تكرر نفس الكلمة بلا فائدة.
- لا تضف تشكيل كامل للحروف العربية لأن ذلك يضعف البحث، لكن اضبط الصياغة وعلامات الترقيم والتنسيق.
قم بإرجاع كائن JSON فقط بالهيكل التالي بدقة ودون أي كلام خارجي على الإطلاق:
{
  "title": "عنوان SEO قوي ومقروء، يبدأ باسم المنتج أو المادة الفعالة، ويذكر التركيز/الحجم والفائدة أو الفئة الأساسية بشكل طبيعي",
  "seoKeywords": "40 إلى 80 كلمة أو عبارة بحثية قصيرة وطويلة، عربية وإنجليزية، مفصولة بفواصل فقط، وتشمل أسماء بديلة ونوايا شراء ومرادفات وفوائد فعلية",
  "seoDesc": "وصف ميتا مقنع ومنسق لغوياً، يوضح المنتج والفائدة الأساسية والتركيز أو الحجم إن وجد، ويشجع على الشراء بدون مبالغة"
}`
            },
            {
              role: 'user',
              content: 'اسم المنتج:\n' + formData.title + (formData.desc ? `\n\nالوصف:\n${formData.desc}` : '') + (formData.features ? `\n\nالمميزات:\n${formData.features}` : '')
            }
          ]
        })
      })

      const isJson = response.headers.get('content-type')?.includes('application/json')
      if (!isJson) {
        const text = await response.text()
        throw new Error(`Server Error: ${text}`)
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || `AI request failed (${response.status})`)
      }

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const parsed = parseAIJSON(data.choices[0].message.content)
        const addAboveExisting = (generated: string | undefined, current: string | undefined, separator: string) => {
          const generatedText = generated?.trim()
          const currentText = current?.trim()

          if (!generatedText) return current || ''
          if (!currentText) return generatedText
          if (currentText.startsWith(generatedText)) return currentText

          return `${generatedText}${separator}${currentText}`
        }

        setFormData((prev: any) => ({
          ...prev,
          title: parsed.title || prev.title,
          seoKeywords: addAboveExisting(parsed.seoKeywords, prev.seoKeywords, '، '),
          seoDesc: addAboveExisting(parsed.seoDesc, prev.seoDesc, '\n'),
          seoKeywordsEn: parsed.seoKeywordsEn || prev.seoKeywordsEn || '',
          seoDescEn: parsed.seoDescEn || prev.seoDescEn || ''
        }))
        addLog('تم توليد الـ SEO والعنوان بنجاح!')
      } else {
        throw new Error(data.error?.message || 'Invalid Response from AI')
      }
    } catch (err) {
      console.error(err)
      addLog('فشل توليد الـ SEO.')
    } finally {
      setIsSEOLoading(false)
    }
  }

  const translateText = async (text: string) => {
    const cleaned = text?.trim()
    if (!cleaned) return ''

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const res = await fetchWithAdminAuth(BACKEND_API + '/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text: cleaned })
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok) return (data.translation || '').trim()

      if (attempt === 3 || ![429, 500, 502, 503, 504].includes(res.status)) {
        throw new Error(data.error || 'Translation failed')
      }

      await new Promise(resolve => setTimeout(resolve, 500 * attempt))
    }

    return ''
  }

  const translateObjectField = async (source: any, target: any, key: string, targetKey = `${key}_en`) => {
    if (!source?.[key] || source?.[targetKey]) return target
    return { ...target, [targetKey]: await translateText(source[key]) }
  }

  const translateSupplementFacts = async () => {
    return Promise.all(supplementFactsList.map(async (item: any) => {
      let translated = { ...item }
      translated = await translateObjectField(item, translated, 'name')
      translated = await translateObjectField(item, translated, 'amount')
      return translated
    }))
  }

  const translateKeyInfo = async () => {
    let translated = { ...keyInfoObj }
    for (const key of ['servingSize', 'totalServings', 'origin', 'bestBefore']) {
      translated = await translateObjectField(keyInfoObj, translated, key)
    }
    return translated
  }

  const translateProductSpecs = async () => {
    let translated = { ...productSpecsObj }
    for (const key of ['shippingWeight', 'dimensions']) {
      translated = await translateObjectField(productSpecsObj, translated, key)
    }
    return translated
  }

  const translateDosageCalculator = async () => {
    const source = dosageCalculatorObj || {}
    let translated = { ...source }
    translated = await translateObjectField(source, translated, 'title')
    translated = await translateObjectField(source, translated, 'optionsLabel')

    translated.rules = await Promise.all((source.rules || []).map(async (rule: any) => {
      let translatedRule = { ...rule }
      for (const key of ['label', 'maleDose', 'maleCapsules', 'maleTip', 'femaleDose', 'femaleCapsules', 'femaleTip']) {
        translatedRule = await translateObjectField(rule, translatedRule, key)
      }
      return translatedRule
    }))

    return translated
  }

  const handleAutoTranslate = async () => {
    if (!formData.title && !formData.desc) {
      await showAlert('يرجى إدخال بيانات المنتج العربية أولاً ثم الضغط على الترجمة.', 'حقل مطلوب')
      return
    }

    setIsTranslatingLoading(true)
    addLog('جاري ترجمة بيانات المنتج إلى الإنجليزية...')

    try {
      const [
        titleEn,
        descEn,
        featuresEn,
        usageEn,
        ingredientsEn,
        warningsEn,
        disclaimerEn,
        seoKeywordsEn,
        seoDescEn,
        translatedSupplementFacts,
        translatedKeyInfo,
        translatedProductSpecs,
        translatedDosageCalculator
      ] = await Promise.all([
        translateText(formData.title || ''),
        translateText(formData.desc || ''),
        translateText(formData.features || ''),
        translateText(formData.directions || ''),
        translateText(formData.ingredients || ''),
        translateText(formData.warnings || ''),
        translateText(formData.disclaimer || ''),
        translateText(formData.seoKeywords || ''),
        translateText(formData.seoDesc || ''),
        translateSupplementFacts(),
        translateKeyInfo(),
        translateProductSpecs(),
        translateDosageCalculator()
      ])

      setFormData((prev: any) => ({
        ...prev,
        titleEn: titleEn || prev.titleEn || '',
        descEn: descEn || prev.descEn || '',
        featuresEn: featuresEn || prev.featuresEn || '',
        usageEn: usageEn || prev.usageEn || '',
        ingredientsEn: ingredientsEn || prev.ingredientsEn || '',
        warningsEn: warningsEn || prev.warningsEn || '',
        disclaimerEn: disclaimerEn || prev.disclaimerEn || '',
        seoKeywordsEn: seoKeywordsEn || prev.seoKeywordsEn || '',
        seoDescEn: seoDescEn || prev.seoDescEn || ''
      }))

      setSupplementFactsList(translatedSupplementFacts)
      setKeyInfoObj(translatedKeyInfo)
      setProductSpecsObj(translatedProductSpecs)
      setDosageCalculatorObj(translatedDosageCalculator)

      addLog('تمت إضافة الترجمة الإنجليزية لكل بيانات المنتج بنجاح!')
    } catch (err: any) {
      console.error(err)
      addLog('فشل ترجمة بيانات المنتج.')
      await showAlert(err.message || 'فشل ترجمة بيانات المنتج', 'خطأ في الترجمة')
    } finally {
      setIsTranslatingLoading(false)
    }
  }

  const handleTipAI = async () => {
    if (!formData.title) {
      await showAlert('يرجى إدخال عنوان أو موضوع النصيحة أولاً في حقل "عنوان النصيحة"!', 'حقل مطلوب')
      return
    }
    setIsAILoading(true)
    addLog(`جاري توليد المقالة الطبية عن: ${formData.title.substring(0, 15)}...`)
    try {
      const response = await fetchWithAdminAuth('/services/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          provider: aiProvider,
          max_tokens: AI_MAX_TOKENS.tip,
          model: 'google/gemma-4-31b-it:free',
          models: [
            'google/gemma-4-31b-it:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openrouter/free'
          ],
          messages: [
            {
              role: 'system',
              content: `أنت طبيب وخبير صحي محترف جداً. طلب منك كتابة مقالة صحية.
سيتم إعطاؤك موضوع أو عنوان المقالة. 
قم بإرجاع النتيجة بصيغة JSON فقط كالتالي:
{
  "title": "عنوان المقالة الاحترافي (جذاب وعلمي)",
  "content": "محتوى المقالة الطبية. اكتب مقالة متكاملة، احترافية، ومقسمة لفقرات. ابدأ بمقدمة، ثم النقاط الرئيسية، ثم خاتمة. يجب أن يكون النص منسقاً للقراءة (استخدم \\n للأسطر الجديدة)."
}
بدون أي نصوص إضافية خارج الـ JSON.`
            },
            { role: 'user', content: formData.title }
          ]
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || `AI request failed (${response.status})`)
      }

      if (data.choices && data.choices[0]) {
        const parsed = parseAIJSON(data.choices[0].message.content)
        setFormData((prev: any) => ({
          ...prev,
          title: parsed.title || prev.title,
          content: parsed.content || prev.content
        }))
        addLog('تم كتابة المقالة بنجاح!')
      } else {
        throw new Error(data.error?.message || 'Invalid Response from AI')
      }
    } catch (err) {
      console.error(err)
      addLog('فشل توليد المقالة.')
    } finally {
      setIsAILoading(false)
    }
  }

  const handleDownloadBackup = async () => {
    setBackupLoading(true)
    addLog('جاري تجهيز النسخة الاحتياطية للتحميل...')
    try {
      const token = localStorage.getItem('mithaly_admin_token')
      const res = await fetch(`${BACKEND_API}/api/admin/backup`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('فشل توليد النسخة الاحتياطية من السيرفر')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mithaly-backup-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      addLog('تم تحميل النسخة الاحتياطية بنجاح ✅')
    } catch (err: any) {
      await showAlert('حدث خطأ أثناء تحميل النسخة الاحتياطية: ' + err.message, 'خطأ')
      addLog('خطأ في تحميل النسخة الاحتياطية')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleRestoreBackup = async (file: File) => {
    if (!file) return
    if (!(await showConfirm('تحذير: استعادة النسخة الاحتياطية سيؤدي إلى مسح كافة البيانات الحالية بالمتجر (المنتجات، الطلبات، الأقسام، إلخ) واستبدالها ببيانات الملف. هل أنت متأكد تماماً؟', 'تأكيد الاستعادة والمسح'))) {
      return
    }

    setRestoreLoading(true)
    addLog('جاري استعادة النسخة الاحتياطية للبيانات...')
    try {
      const formData = new FormData()
      formData.append('backup', file)

      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/restore`, {
        method: 'POST',
        body: formData
      }, null)

      if (res.ok) {
        await showAlert('تم استعادة النسخة الاحتياطية بنجاح! تم استبدال كافة البيانات وتحديث الصور.', 'استعادة ناجحة')
        addLog('تمت استعادة البيانات بنجاح ✅')
        fetchStats()
        fetchMeta()
      } else {
        const err = await res.json()
        await showAlert('فشل استعادة النسخة الاحتياطية: ' + (err.error || 'خطأ غير معروف'), 'خطأ')
        addLog('خطأ في استعادة البيانات')
      }
    } catch (err: any) {
      await showAlert('خطأ في الاتصال بالخادم: ' + err.message, 'خطأ')
      addLog('خطأ في الاستعادة')
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleSaveAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetchWithAdminAuth(BACKEND_API + '/api/admin/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          name: adminName,
          password: adminPassword || undefined
        })
      })
      if (res.ok) {
        await showAlert('تم تحديث بيانات المسؤول بنجاح! يرجى استخدام البيانات الجديدة لتسجيل الدخول مستقبلاً.', 'تحديث ناجح')
        setAdminPassword('')
      } else {
        const err = await res.json()
        await showAlert('فشل حفظ البيانات: ' + (err.error || 'خطأ غير معروف'), 'خطأ')
      }
    } catch (err: any) {
      await showAlert('خطأ في الاتصال بالخادم: ' + err.message, 'خطأ')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (activeTab === 'hero') {
        const res = await fetchWithAdminAuth(BACKEND_API + '/api/hero', {
          method: 'PATCH',
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          addLog('تم تحديث بيانات الهيرو بنجاح!')
          await showAlert('تم الحفظ بنجاح! ✅', 'حفظ الهيرو')
          fetchData()
        } else {
          await showAlert('فشل حفظ بيانات الهيرو', 'خطأ')
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
          const brandRes = await fetchWithAdminAuth(BACKEND_API + '/api/brands', {
            method: 'POST',
            body: JSON.stringify({ name: formData.brandName.trim(), image: formData.brandImage })
          })
          if (brandRes.ok) {
            const newBrand = await brandRes.json()
            finalBrandId = newBrand.id
          }
        }
      }

      const endpoint = ADMIN_TABS.find(t => t.id === activeTab)?.endpoint
      const method = editingItem ? 'PATCH' : 'POST'
      const url = editingItem ? `/api/${endpoint}/${editingItem.id}` : `/api/${endpoint}`

      const payload: any = { ...formData }
      delete payload.brandName
      delete payload.brandImage
      delete payload.brand
      delete payload.category

      if (activeTab === 'products') {
        payload.brandId = finalBrandId
        payload.supplementFacts = supplementFactsList.length > 0 ? JSON.stringify(supplementFactsList) : ''
        payload.sizeOptions = sizesPricesList.length > 0 ? JSON.stringify(sizesPricesList) : ''
        payload.specifications = Object.keys(productSpecsObj).length > 0 ? JSON.stringify(productSpecsObj) : ''
        payload.keyInfo = Object.keys(keyInfoObj).length > 0 ? JSON.stringify(keyInfoObj) : ''
        payload.certifications = Object.keys(certificationsObj).length > 0 ? JSON.stringify(certificationsObj) : ''
        payload.dosageCalculator = dosageCalculatorObj ? JSON.stringify(dosageCalculatorObj) : ''
        payload.faqs = faqsList.length > 0 ? JSON.stringify(faqsList) : ''
        payload.usage = payload.directions || payload.usage || ''
        payload.usageEn = payload.usageEn || ''
        payload.imageAlt = payload.imageAlt || payload.title || ''

        payload.imageAlt = payload.imageAlt || payload.title || ''

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

        delete payload.directions
      }

      const res = await fetchWithAdminAuth(BACKEND_API + url, {
        method,
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsModalOpen(false)
        await fetchData()
        await showAlert('تم الحفظ بنجاح! ✅', 'حفظ ناجح')
      } else {
        const errData = await res.json()
        await showAlert(`فشل الحفظ: ${errData.error || 'خطأ غير معروف'}`, 'خطأ في الحفظ')
      }
    } catch (err: any) {
      await showAlert(`خطأ: ${err.message}`, 'خطأ')
    } finally {
      setLoading(false)
    }
  }

  const filteredBrands = (Array.isArray(brands) ? brands : []).filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))

  useEffect(() => {
    const auth = localStorage.getItem('mithaly_admin_auth')
    const token = localStorage.getItem('mithaly_admin_token')
    if (auth === 'true' && token) {
      setIsLoggedIn(true)
      setAdminToken(token)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'whatsapp' && isLoggedIn) {
      fetchWhatsappStatus()
      const interval = setInterval(fetchWhatsappStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [activeTab, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      fetchData()
      fetchMeta()
    }
  }, [activeTab, isLoggedIn])

  return {
    showAlert,
    showConfirm,
    BACKEND_API,
    isLoggedIn,
    setIsLoggedIn,
    username,
    setUsername,
    password,
    setPassword,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    data,
    categories,
    brands,
    productsList,
    loading,
    isAILoading,
    isSEOLoading,
    isTranslatingLoading,
    uploading,
    setUploading,
    brandUploading,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    setFormData,
    supplementFactsList,
    setSupplementFactsList,
    sizesPricesList,
    setSizesPricesList,
    faqsList,
    setFaqsList,
    productSpecsObj,
    setProductSpecsObj,
    keyInfoObj,
    setKeyInfoObj,
    certificationsObj,
    setCertificationsObj,
    dosageCalculatorObj,
    setDosageCalculatorObj,
    stats,
    brandSearch,
    setBrandSearch,
    showBrandSuggestions,
    setShowBrandSuggestions,
    searchQuery,
    setSearchQuery,
    adminToken,
    whatsappStatus,
    wsLoading,
    adminEmail,
    setAdminEmail,
    adminName,
    setAdminName,
    adminPassword,
    setAdminPassword,
    logs,
    selectedOrderForWaybill,
    setSelectedOrderForWaybill,
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    mainFileInputRef,
    galleryFileInputRef,
    brandLogoRef,
    addLog,
    getAuthHeaders,
    fetchWithAdminAuth,
    uploadAdminImage,
    fetchWhatsappStatus,
    fetchStats,
    fetchData,
    fetchMeta,
    handleLogin,
    handleLogout,
    handleDelete,
    handleShipToAramex,
    handleWhatsappLogout,
    handleFileUpload,
    handleOpenModal,
    handleAIFill,
    handleAutoTranslate,
    handleSEOAI,
    handleTipAI,
    handleSaveAdminSettings,
    handleSave,
    filteredBrands,
    backupLoading,
    restoreLoading,
    handleDownloadBackup,
    handleRestoreBackup,
    aiProvider,
    handleAiProviderChange,
    tabs: ADMIN_TABS
  }
}
