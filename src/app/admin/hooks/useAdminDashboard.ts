import { useEffect, useRef, useState } from 'react'
import { useModal } from '@/context/ModalContext'
import {
  ADMIN_TABS,
  BACKEND_API,
  DEFAULT_CATEGORIES,
  DEFAULT_DOSAGE_CALCULATOR,
  parseAIJSON
} from '../admin-dashboard-utils'

type AIProvider = 'openrouter' | 'apifree'

export function useAdminDashboard() {
  const { showAlert, showConfirm } = useModal()
  const AI_MAX_TOKENS = {
    productFill: 4000,
    seo: 4000,
    tip: 1000
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
  const [rowSeoLoading, setRowSeoLoading] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [brandUploading, setBrandUploading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [cleanLoading, setCleanLoading] = useState(false)
  const [excelImporting, setExcelImporting] = useState(false)
  const [aiProvider, setAiProvider] = useState<AIProvider>('openrouter')

  const handleAiProviderChange = (provider: AIProvider) => {
    setAiProvider(provider)
    localStorage.setItem('mithaly_ai_provider', provider)
    addLog(`تم تغيير مزود الذكاء الاصطناعي إلى ${provider === 'apifree' ? 'APIFreeLLM' : 'OpenRouter'}`)
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
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpSecure, setSmtpSecure] = useState('false')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('The VitaHub')
  const [whatsappNumber, setWhatsappNumber] = useState('01201450111')
  const [receivingNumber, setReceivingNumber] = useState('01009596452')

  const [testRecipient, setTestRecipient] = useState('')
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [settingsSaveLoading, setSettingsSaveLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState<any>(null)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null)

  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)
  const brandLogoRef = useRef<HTMLInputElement>(null)
  const excelInputRef = useRef<HTMLInputElement>(null)

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
        addLog(`تم تحميل ${Array.isArray(bnds) ? bnds.length : 0} ماركة`)
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
    if (activeTab === 'whatsapp' || activeTab === 'admin-settings') {
      setLoading(true)
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetchWithAdminAuth(`${BACKEND_API}/api/admin/profile?t=${Date.now()}`),
          fetchWithAdminAuth(`${BACKEND_API}/api/admin/settings?t=${Date.now()}`)
        ])

        if (profileRes.ok) {
          const json = await profileRes.json()
          setAdminEmail(json.email || '')
          setAdminName(json.name || '')
          setAdminPassword('')
        }

        if (settingsRes.ok) {
          const json = await settingsRes.json()
          if (json.smtp_host !== undefined) setSmtpHost(json.smtp_host)
          if (json.smtp_port !== undefined) setSmtpPort(json.smtp_port)
          if (json.smtp_secure !== undefined) setSmtpSecure(json.smtp_secure)
          if (json.smtp_user !== undefined) setSmtpUser(json.smtp_user)
          if (json.smtp_pass !== undefined) setSmtpPass(json.smtp_pass)
          if (json.from_email !== undefined) setFromEmail(json.from_email)
          if (json.from_name !== undefined) setFromName(json.from_name)
          if (json.whatsapp_number !== undefined) setWhatsappNumber(json.whatsapp_number)
          if (json.receiving_number !== undefined) setReceivingNumber(json.receiving_number)
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
    const providerNames: Record<AIProvider, string> = { openrouter: 'OpenRouter', apifree: 'APIFreeLLM' }
    addLog(`جاري جلب تفاصيل ${formData.title.substring(0, 15)} باستخدام ${providerNames[activeProvider]}...`)
    try {
      const response = await fetchWithAdminAuth(`${BACKEND_API}/api/ai/generate`, {
        method: 'POST',
        body: JSON.stringify({
          provider: activeProvider,
          max_tokens: AI_MAX_TOKENS.productFill,
          model: 'openai/gpt-oss-120b:free',
          models: [
            'openai/gpt-oss-120b:free',
            'openai/gpt-oss-20b:free',
            'google/gemini-2.5-flash'
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
  "title": "إعادة كتابة اسم المنتج المدخل ليكون اسماً احترافياً ومختصراً ومناسباً لعنوان منتج في متجر الكتروني (مثال: أوبتيموم نيوترشن كرياتين ميكرونيزد 600 جرام). لا تذكر اسم المتجر The VitaHub هنا أبداً.",
  "titleEn": "اسم المنتج الاحترافي باللغة الإنجليزية (مثال: Optimum Nutrition Micronized Creatine Monohydrate 600g). لا تذكر اسم المتجر The VitaHub هنا أبداً.",
  "desc": "وصف منتج عملي ومباشر ومفصل ومطول جداً (يتجاوز 350 كلمة)، يشرح الوظيفة الرئيسية للمنتج بالتفصيل والفوائد المهمة ولماذا يشتريه العميل، بصياغة سهلة ومناسبة للسوق المصري، وبدون مبالغة.",
  "features": "قائمة مميزات المنتج والفوائد والمكونات النشطة الأساسية، كل ميزة في سطر منفصل (مثال: ميزة 1\\nميزة 2\\nميزة 3)",
  "brandImage": "رابط لوجو الشركة (استخدم https://www.google.com/s2/favicons?domain=brandname.com&sz=128)",
  "productSpecs": "{\\"authentic\\": true, \\"sku\\": \\"رمز\\", \\"shippingWeight\\": \\"وزن\\"}",
  "keyInfo": "{\\"servingSize\\": \\"حجم الجرعة\\", \\"totalServings\\": \\"إجمالي الحصص\\", \\"bestBefore\\": \\"تاريخ\\", \\"origin\\": \\"المنشأ\\"}",
  "certifications": "{\\"glutenFree\\": true/false, \\"dairyFree\\": true/false, \\"soyFree\\": true/false, \\"treeNutFree\\": true/false, \\"nonGmo\\": true/false, \\"organic\\": true/false}",
  "warnings": "تحذيرات (نص)",
  "directions": "طريقة الاستخدام (نص)",
  "ingredients": "المكونات (نص)",
  "supplementFacts": "[{\\"name\\": \\"Vitamin C\\", \\"amount\\": \\"500mg\\", \\"dv\\": \\"556%\\"}]",
  "seoKeywords": "قائمة ضخمة ومكثفة تتكون من 300 كلمة أو عبارة بحث مفتاحية متنوعة وقوية باللغة العربية مفصولة بفواصل لتغطية كافة عمليات البحث الممكنة بشكل كامل.",
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
          title: parsed.title || prev.title,
          titleEn: parsed.titleEn || prev.titleEn,
          desc: parsed.desc || prev.desc,
          features: parsed.features || prev.features,
          brandImage: parsed.brandImage || prev.brandImage,
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
    const providerNames: Record<AIProvider, string> = { openrouter: 'OpenRouter', apifree: 'APIFreeLLM' }
    
    // Extract metadata dynamically to populate the prompt placeholders
    const activeCategory = categories.find((c: any) => c.id === formData.categoryId)?.name || 'فيتامينات ومكملات غذائية';
    const concentration = formData.title.match(/\d+\s*(mg|mcg|iu|g|ملجم|جم|وحدة)/i)?.[0] || 'غير محدد في الاسم';
    const quantity = keyInfoObj.totalServings || sizesPricesList.map((s: any) => s.size).join(', ') || 'غير محدد';
    const ingredients = formData.ingredients || supplementFactsList.map((s: any) => s.name).join(', ') || 'غير محدد';
    const brand = formData.brandName || brandSearch || 'غير محدد';

    try {
      addLog(`جاري توليد الكلمات المفتاحية والـ Meta للمنتج باستخدام ${providerNames[activeProvider]}...`)
      
      const response = await fetchWithAdminAuth(`${BACKEND_API}/api/ai/generate`, {
        method: 'POST',
        body: JSON.stringify({
          provider: activeProvider,
          max_tokens: 3000,
          model: 'openai/gpt-oss-120b:free',
          models: [
            'openai/gpt-oss-120b:free',
            'openai/gpt-oss-20b:free',
            'google/gemini-2.5-flash'
          ],
          messages: [
            {
              role: 'system',
              content: `أنت خبير SEO متخصص في المتاجر الإلكترونية التي تبيع الفيتامينات والمكملات الغذائية. أريد منك إنشاء قائمة شاملة من الكلمات المفتاحية (SEO Keywords) لمنتج مكمل غذائي.

التعليمات:
* أنشئ من 200 إلى 500 كلمة مفتاحية.
* اكتب الكلمات المفتاحية بالعربية والإنجليزية معًا بداخل حقل "seoKeywords" بفاصلة عربية "،".
* أضف جميع أشكال اسم المنتج والعلامة التجارية.
* أضف الكلمات المفتاحية المتعلقة بالفوائد المحتملة للمنتج بطريقة متوافقة مع سياسات Google.
* أضف الكلمات المفتاحية المتعلقة بالاستخدامات العامة والصحة والعافية.
* أضف كلمات البحث التجارية مثل: شراء، سعر، أفضل، أصلي، مستورد.
* أضف الكلمات المفتاحية الخاصة بالمكونات النشطة.
* أضف الكلمات المفتاحية الخاصة بالفئة (فيتامينات، مكملات، أعشاب، بروبيوتيك، معادن، إلخ).
* أضف الكلمات المفتاحية الخاصة بالجمهور المستهدف (رجال، نساء، أطفال، رياضيين، كبار السن).
* أضف الكلمات المفتاحية الخاصة بالجودة مثل: Non GMO، Gluten Free، Vegan، Organic، Made in USA.
* أضف الكلمات المفتاحية الخاصة بالدعم الصحي بصيغة "دعم" فقط، وتجنب الادعاءات الطبية أو العلاجية.
* لا تكرر الكلمات المفتاحية نفسها.
* افصل جميع الكلمات المفتاحية بفاصلة عربية "،".
* اجعل الناتج جاهزًا للنسخ واللصق في SEO.

بيانات المنتج لدمجها:
- اسم المنتج: ${formData.title}
- العلامة التجارية: ${brand}
- التركيز: ${concentration}
- الكمية: ${quantity}
- المكونات الرئيسية: ${ingredients}
- الفئة: ${activeCategory}

يجب عليك إرجاع كائن JSON فقط بدون أي نصوص خارجية بالهيكل التالي بدقة:
{
  "title": "عنوان SEO الرئيسي الاحترافي المتوافق مع محركات البحث بالعربية",
  "titleEn": "Professional English SEO Title",
  "seoDesc": "وصف ميتا احترافي للبحث بالعربية مقنع وجذاب ويشجع على الشراء (بين 150 و 220 حرفاً) مع ذكر اسم المتجر The VitaHub بشكل طبيعي.",
  "seoDescEn": "Meta description in English for Google search (150-220 characters) naturally mentioning the store name The VitaHub.",
  "seoKeywords": "قائمة من 200 إلى 500 كلمة مفتاحية SEO بالعربية والإنجليزية معًا مفصولة بفاصلة عربية '،'.",
  "faqs": [
    {
      "question_ar": "سؤال شائع 1 بالعربية؟",
      "answer_ar": "إجابة احترافية 1 بالعربية.",
      "question_en": "Question 1 in English?",
      "answer_en": "Professional answer 1 in English."
    },
    {
      "question_ar": "سؤال شائع 2 بالعربية؟",
      "answer_ar": "إجابة احترافية 2 بالعربية.",
      "question_en": "Question 2 in English?",
      "answer_en": "Professional answer 2 in English."
    },
    {
      "question_ar": "سؤال شائع 3 بالعربية؟",
      "answer_ar": "إجابة احترافية 3 بالعربية.",
      "question_en": "Question 3 in English?",
      "answer_en": "Professional answer 3 in English."
    }
  ]
}`
            },
            {
              role: 'user',
              content: `اسم المنتج:\n${formData.title}\n\nالوصف الحالي:\n${formData.desc || ''}`
            }
          ]
        })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`SEO generation failed: ${text}`)
      }
      const data = await response.json()
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const parsed = parseAIJSON(data.choices[0].message.content)
        
        const addAboveExisting = (generated: string | undefined, current: string | undefined, separator: string) => {
          const generatedText = generated?.trim()
          const currentText = current?.trim()
          if (!generatedText) return current || ''
          if (!currentText) return generatedText
          if (currentText.includes(generatedText) || generatedText.includes(currentText)) return currentText
          return `${generatedText}${separator}${currentText}`
        }

        setFormData((prev: any) => ({
          ...prev,
          title: parsed.title || prev.title,
          titleEn: parsed.titleEn || prev.titleEn,
          seoDesc: addAboveExisting(parsed.seoDesc, prev.seoDesc, '\n'),
          seoDescEn: addAboveExisting(parsed.seoDescEn, prev.seoDescEn, '\n'),
          seoKeywords: addAboveExisting(parsed.seoKeywords, prev.seoKeywords, '، '),
          seoKeywordsEn: addAboveExisting(parsed.seoKeywords, prev.seoKeywordsEn, ', ')
        }))

        if (parsed.faqs && Array.isArray(parsed.faqs)) {
          setFaqsList(parsed.faqs)
        }

        addLog('تم توليد وتحديث بيانات الـ SEO والأسئلة الشائعة بنجاح! 🎉')
      } else {
        throw new Error('Invalid SEO response structure')
      }
    } catch (err: any) {
      console.error(err)
      addLog(`فشل توليد الـ SEO: ${err.message}`)
    } finally {
      setIsSEOLoading(false)
    }
  }

  const handleProductRowSEO = async (productId: string, providerOverride?: AIProvider) => {
    setRowSeoLoading(productId)
    const activeProvider = providerOverride || aiProvider
    const providerNames: Record<AIProvider, string> = { openrouter: 'OpenRouter', apifree: 'APIFreeLLM' }
    addLog(`جاري توليد الـ SEO للمنتج باستخدام ${providerNames[activeProvider]}...`)
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/products/${productId}/generate-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: activeProvider })
      })
      const resData = await res.json()
      if (res.ok) {
        await showAlert('تم توليد وتحديث بيانات الـ SEO للمنتج بنجاح! ✅', 'تحديث ناجح')
        addLog(`تم تحديث الـ SEO للمنتج بنجاح.`)
        await fetchData() // Refresh product list data
      } else {
        await showAlert(resData.error || 'فشل تحديث الـ SEO', 'خطأ')
      }
    } catch (err: any) {
      await showAlert('حدث خطأ أثناء الاتصال بالخادم: ' + err.message, 'خطأ')
    } finally {
      setRowSeoLoading(null)
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
      const response = await fetchWithAdminAuth(`${BACKEND_API}/api/ai/generate`, {
        method: 'POST',
        body: JSON.stringify({
          provider: aiProvider,
          max_tokens: AI_MAX_TOKENS.tip,
          model: 'openai/gpt-oss-120b:free',
          models: [
            'openai/gpt-oss-120b:free',
            'openai/gpt-oss-20b:free',
            'google/gemini-2.5-flash'
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

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExcelImporting(true)
    addLog(`يجري استيراد المنتجات من ملف Excel: ${file.name}...`)

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      // Use fetchWithAdminAuth to send the request
      const res = await fetchWithAdminAuth(
        `${BACKEND_API}/api/products/import-excel`,
        { method: 'POST', body: uploadData },
        null
      )

      if (res.ok) {
        const result = await res.json()
        addLog(result.message || 'تم استيراد المنتجات بنجاح!')
        await showAlert(
          result.message || 'تم استيراد المنتجات بنجاح!',
          'استيراد ناجح'
        )
        // Refresh products list
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'حدث خطأ غير معروف')
      }
    } catch (err: any) {
      console.error('Excel Import Error:', err)
      addLog(`فشل الاستيراد: ${err.message}`)
      await showAlert(
        err.message || 'تعذر معالجة واستيراد ملف Excel',
        'خطأ في الاستيراد'
      )
    } finally {
      setExcelImporting(false)
      if (excelInputRef.current) {
        excelInputRef.current.value = ''
      }
    }
  }

  const handleCleanBase64Images = async () => {
    if (!(await showConfirm('تحذير: سيتم البحث في كامل قاعدة البيانات وحذف كافة الصور بصيغة Base64 واستبدالها بصور افتراضية. هل تريد الاستمرار؟', 'تأكيد تنظيف قاعدة البيانات'))) {
      return
    }

    setCleanLoading(true)
    addLog('جاري تنظيف قاعدة البيانات من صور Base64...')
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/clean-base64-images`, {
        method: 'POST'
      }, null)

      if (res.ok) {
        const data = await res.json()
        await showAlert(`تم تنظيف قاعدة البيانات بنجاح! تم تحديث عدد ${data.count || 0} سجل.`, 'تنظيف ناجح')
        addLog(`تم تنظيف قاعدة البيانات بنجاح ✅ (تم تحديث ${data.count || 0} سجل)`)
        fetchStats()
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        await showAlert('فشل تنظيف قاعدة البيانات: ' + (err.error || 'خطأ غير معروف'), 'خطأ')
        addLog('خطأ في تنظيف قاعدة البيانات')
      }
    } catch (err: any) {
      await showAlert('خطأ في الاتصال بالخادم: ' + err.message, 'خطأ')
      addLog('خطأ في التنظيف')
    } finally {
      setCleanLoading(false)
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

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaveLoading(true)
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/settings`, {
        method: 'POST',
        body: JSON.stringify({
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_secure: smtpSecure,
          smtp_user: smtpUser,
          smtp_pass: smtpPass,
          from_email: fromEmail,
          from_name: fromName,
          whatsapp_number: whatsappNumber,
          receiving_number: receivingNumber
        })
      })
      if (res.ok) {
        await showAlert('تم حفظ إعدادات النظام SMTP وأرقام التواصل بنجاح! ✅', 'تحديث ناجح')
      } else {
        const err = await res.json()
        await showAlert('فشل حفظ إعدادات النظام: ' + (err.error || 'خطأ غير معروف'), 'خطأ')
      }
    } catch (err: any) {
      await showAlert('خطأ في الاتصال بالخادم: ' + err.message, 'خطأ')
    } finally {
      setSettingsSaveLoading(false)
    }
  }

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testRecipient.trim()) {
      await showAlert('يرجى إدخال البريد الإلكتروني للمستلم لتجربة الإرسال.', 'حقل مطلوب')
      return
    }
    setTestEmailLoading(true)
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/settings/test-email`, {
        method: 'POST',
        body: JSON.stringify({
          to: testRecipient
        })
      })
      const json = await res.json()
      if (res.ok) {
        await showAlert('تم إرسال البريد الإلكتروني التجريبي بنجاح! تفقد صندوق بريدك الوارد (والـ Spam). ✅', 'تم الإرسال بنجاح')
      } else {
        await showAlert('فشل إرسال البريد التجريبي: ' + (json.error || 'خطأ غير معروف'), 'خطأ')
      }
    } catch (err: any) {
      await showAlert('خطأ في الاتصال بالخادم: ' + err.message, 'خطأ')
    } finally {
      setTestEmailLoading(false)
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

        if (!payload.image) {
          await showAlert('يجب رفع الصورة الرئيسية للمنتج قبل الحفظ لأنها الصورة المستخدمة في Google وSEO وكروت المنتجات.', 'الصورة الرئيسية مطلوبة')
          setLoading(false)
          return
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

        delete payload.directions
      }

      const res = await fetchWithAdminAuth(BACKEND_API + url, {
        method,
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsModalOpen(false)
        await fetchData()
        if (activeTab === 'products') addLog('تم حفظ المنتج، والخادم الخلفي يتولى إشعار Google Indexing وتسجيل النتيجة')
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
      queueMicrotask(() => {
        setIsLoggedIn(true)
        setAdminToken(token)
      })
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'whatsapp' && isLoggedIn) {
      queueMicrotask(() => fetchWhatsappStatus())
      const interval = setInterval(fetchWhatsappStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [activeTab, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      queueMicrotask(() => {
        fetchData()
        fetchMeta()
      })
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
    excelInputRef,
    excelImporting,
    handleExcelImport,
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
    rowSeoLoading,
    handleProductRowSEO,
    backupLoading,
    restoreLoading,
    handleDownloadBackup,
    handleRestoreBackup,
    cleanLoading,
    handleCleanBase64Images,
    aiProvider,
    handleAiProviderChange,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    smtpSecure,
    setSmtpSecure,
    smtpUser,
    setSmtpUser,
    smtpPass,
    setSmtpPass,
    fromEmail,
    setFromEmail,
    fromName,
    setFromName,
    whatsappNumber,
    setWhatsappNumber,
    receivingNumber,
    setReceivingNumber,
    testRecipient,
    setTestRecipient,
    testEmailLoading,
    settingsSaveLoading,
    handleSaveGeneralSettings,
    handleSendTestEmail,
    tabs: ADMIN_TABS
  }
}
