export const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || ''

export const DEFAULT_DOSAGE_CALCULATOR = {
  enabled: true,
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
  { id: 'indexing', label: 'أرشفة جوجل', endpoint: 'admin/indexing/logs', iconKey: 'Search' },
  { id: 'pixels', label: 'إحصائيات Pixel والعملاء', endpoint: 'admin/pixel-events', iconKey: 'Activity' },
  { id: 'shipping-returns', label: 'الشحن والإرجاع', endpoint: 'admin/profile', iconKey: 'Truck' },
  { id: 'admin-settings', label: 'إعدادات المتجر والحساب', endpoint: 'admin/profile', iconKey: 'User' }
]

export const parseAIJSON = (str: string) => {
  if (!str || typeof str !== 'string') {
    throw new Error('رد الذكاء الاصطناعي فارغ')
  }

  let cleaned = str.trim()

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  }

  // Extract the outermost JSON object {...}
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  } else {
    if (cleaned.startsWith('عذرًا') || cleaned.startsWith('عذرا') || cleaned.toLowerCase().includes('sorry')) {
      throw new Error(`اعتذر الذكاء الاصطناعي عن تلبية الطلب: "${cleaned.slice(0, 120)}..."`)
    }
    throw new Error(`رد الذكاء الاصطناعي ليس بصيغة JSON: "${cleaned.slice(0, 100)}..."`)
  }

  // 1. Try standard JSON.parse first (fastest & preserves valid JSON quotes)
  try {
    return JSON.parse(cleaned)
  } catch (e1) {
    // Continue to repair common LLM JSON syntax issues
  }

  // 2. Fix trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[\}\]])/g, '$1')

  try {
    return JSON.parse(cleaned)
  } catch (e2) {
    // Continue fixing
  }

  // 3. Fix unescaped newlines, carriage returns, and tabs inside quotes
  let insideString = false
  let fixedStr = ''
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const prevChar = i > 0 ? cleaned[i - 1] : ''
    const isEscaped = prevChar === '\\' && (i < 2 || cleaned[i - 2] !== '\\')

    if (char === '"' && !isEscaped) {
      insideString = !insideString
      fixedStr += char
    } else if (insideString) {
      if (char === '\n') fixedStr += '\\n'
      else if (char === '\r') fixedStr += '\\r'
      else if (char === '\t') fixedStr += '\\t'
      else fixedStr += char
    } else {
      fixedStr += char
    }
  }

  try {
    return JSON.parse(fixedStr)
  } catch (e3) {
    // 4. Safe fallback via Function constructor for minor loose syntax
    try {
      const sanitized = fixedStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      return new Function(`return (${sanitized})`)()
    } catch (e4) {
      if (str.startsWith('عذرًا') || str.startsWith('عذرا')) {
        throw new Error(`اعتذر الذكاء الاصطناعي: "${str.slice(0, 120)}..."`)
      }
      throw new Error(`تعذر تحليل استجابة الذكاء الاصطناعي (JSON غير صالح). يرجى الضغط على التوليد مرة أخرى.`)
    }
  }
}

