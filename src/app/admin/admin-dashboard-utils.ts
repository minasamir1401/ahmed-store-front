export const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || ''

export const DEFAULT_DOSAGE_CALCULATOR = {
  enabled: false,
  genderTarget: 'both',
  title: '',
  icon: 'Activity',
  optionsLabel: 'الهدف الأساسي:',
  rules: []
}

export const DEFAULT_CATEGORIES = [
  { id: 'cmonkzdcq0000whysb7ljy2z2', name: 'مكملات الأوميجا' },
  { id: 'cmonkzdd50001whyshu2vm1w9', name: 'البشرة والشعر' },
  { id: 'cmonja7ec0001whwczxwylt69', name: 'فيتامينات ومعادن' },
  { id: 'cmonkzdda0003whysjg212jjb', name: 'مسكنات' },
  { id: 'cmonkzdde0004whys5br0gm4l', name: 'الصحة الجنسية' },
  { id: 'cmonkzddj0005whyshfi6rwsb', name: 'الصحة العامة' },
  { id: 'cmonkzddo0006whys3tt7jg85', name: 'مكملات عشبية' },
  { id: 'cmonkzdds0007whysw04c5iu2', name: 'التخسيس واللياقة' },
  { id: 'cmonkzddw0008whysrgmw2eub', name: 'صحة الطفل' },
  { id: 'cmonkzde10009whysbllifetr', name: 'الحمل والرضاعة' },
  { id: 'cmonkzde4000awhys5z8l4eqq', name: 'فيتامينات متعددة' },
  { id: 'cmonkzde8000bwhys0y1i32qs', name: 'عظام ومفاصل' },
  { id: 'cmonkzdec000cwhysv1374fwx', name: 'أحماض أمينية' },
  { id: 'cmonja7dy0000whwcvhpt0kxi', name: 'العناية بالبشرة' }
]

export const ADMIN_TABS = [
  { id: 'products', label: 'المنتجات', endpoint: 'products', iconKey: 'Package' },
  { id: 'orders', label: 'الطلبات', endpoint: 'orders', iconKey: 'ShoppingCart' },
  { id: 'brands', label: 'الماركات', endpoint: 'brands', iconKey: 'Building2' },
  { id: 'categories', label: 'الأقسام', endpoint: 'categories', iconKey: 'Award' },
  { id: 'offers', label: 'العروض', endpoint: 'offers', iconKey: 'Tag' },
  { id: 'hero', label: 'الهيرو', endpoint: 'hero', iconKey: 'Layers' },
  { id: 'medical-tips', label: 'النصائح الطبية', endpoint: 'medical-tips', iconKey: 'Stethoscope' },
  { id: 'whatsapp', label: 'إعدادات واتساب', endpoint: 'whatsapp', iconKey: 'Smartphone' },
  { id: 'admin-settings', label: 'إعدادات الحساب', endpoint: 'admin/profile', iconKey: 'User' }
]

export const parseAIJSON = (str: string) => {
  let cleaned = str.trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) cleaned = match[0]
  cleaned = cleaned.replace(/\\(?!["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\')

  let insideQuote = false
  let result = ''
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const isEscaped = i > 0 && cleaned[i - 1] === '\\' && (i < 2 || cleaned[i - 2] !== '\\')

    if (char === '"' && !isEscaped) {
      insideQuote = !insideQuote
      result += char
    } else if (insideQuote) {
      if (char === '\n') result += '\\n'
      else if (char === '\r') result += '\\r'
      else if (char === '\t') result += '\\t'
      else result += char
    } else {
      result += char
    }
  }

  return JSON.parse(result)
}
