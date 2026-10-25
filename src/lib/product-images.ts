type ProductImageSource = {
  imageAlt?: string | null
  titleEn?: string | null
  title?: string | null
}

type VersionedImageSource = {
  updatedAt?: string | null
  imageUpdatedAt?: string | null
}

export const productImageAlt = (product: ProductImageSource, fallback = 'Product image') => {
  return product?.imageAlt || product?.titleEn || product?.title || fallback
}

export const productImageThumb = (src?: string | null) => {
  if (!src) return ''
  return src.includes('/api/images/') && !src.endsWith('/thumb') ? `${src}/thumb` : src
}

export const productMainImage = (src?: string | null) => {
  if (!src) return ''
  return src.endsWith('/thumb') ? src.slice(0, -6) : src
}

export const absoluteProductImageUrl = (src: string | null | undefined, siteUrl: string) => {
  if (!src) return ''
  try {
    // Preserve revision queries and already-encoded filenames while encoding spaces/Unicode.
    const url = new URL(src, `${siteUrl.replace(/\/+$/, '')}/`)
    return /^https?:$/.test(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export const productImageVersion = (product?: VersionedImageSource | null) => {
  const value = product?.imageUpdatedAt || product?.updatedAt
  if (!value) return ''

  const time = new Date(value).getTime()
  return Number.isFinite(time) ? String(time) : ''
}

export const withImageVersion = (src: string, version?: string | null) => {
  if (!src || !version || /^data:/i.test(src)) return src
  return `${src}${src.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`
}

export const safeBrandImage = (src?: string | null) => {
  if (!src) return ''
  
  let domain = ''
  
  if (src.includes('logo.clearbit.com/')) {
    const part = src.split('logo.clearbit.com/')[1]
    domain = part.split('/')[0].split('?')[0]
  } else if (src.includes('google.com/s2/favicons')) {
    const match = src.match(/[?&]domain=([^&]+)/)
    if (match) {
      domain = match[1]
    }
  } else if (src.includes('logos.hunter.io/')) {
    domain = src.split('logos.hunter.io/')[1]
  } else if (!/^https?:\/\//i.test(src) && !src.startsWith('/') && src.includes('.')) {
    domain = src.trim()
  }

  if (domain) {
    return `https://logos.hunter.io/${domain.toLowerCase()}`
  }

  return src
}

export const parseImageList = (raw: any): string[] => {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((s: any) => String(s).trim().replace(/^[\["']+|[\]"']+$/g, '')).filter(Boolean)
  }
  const str = String(raw).trim()
  if (!str) return []
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) {
        return parsed.map((s: any) => String(s).trim().replace(/^[\["']+|[\]"']+$/g, '')).filter(Boolean)
      }
    } catch {
      // fallback to delimiter split
    }
  }
  return str.split(',').map((s: string) => s.trim().replace(/^[\["']+|[\]"']+$/g, '')).filter(Boolean)
}

export const serializeImageList = (list: string[]): string => {
  const cleaned = list.map((s: string) => String(s).trim().replace(/^[\["']+|[\]"']+$/g, '')).filter(Boolean)
  return cleaned.length > 0 ? JSON.stringify(cleaned) : ''
}

type StoredProductImages = VersionedImageSource & {
  id?: string
  image?: string | null
  images?: unknown
}

// Saved images already have a first-party JPEG endpoint. Use it for both the
// storefront and the editor instead of hotlinking sites that reject browsers.
export const productDisplayImages = (product: StoredProductImages): string[] => {
  if (!product.id) return [product.image || '', ...parseImageList(product.images)].filter(Boolean)
  const base = `/api/catalog/image/${encodeURIComponent(product.id)}`
  const version = productImageVersion(product)
  return [
    ...(product.image ? [withImageVersion(`${base}.jpg?format=square-v1`, version)] : []),
    ...parseImageList(product.images).map((_, index) => withImageVersion(`${base}/gallery/${index}.jpg?format=square-v1`, version)),
  ]
}

// An unsaved replacement must preview the new source, never the old cached image.
export const savedProductImagePreview = (product: StoredProductImages | null | undefined, source: string): string => {
  if (!product?.id || !source) return source
  const images = productDisplayImages(product)
  if (source === product.image) return images[0] || source
  const index = parseImageList(product.images).indexOf(source)
  return index < 0 ? source : images[index + (product.image ? 1 : 0)] || source
}
