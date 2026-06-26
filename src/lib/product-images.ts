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
  if (/^https?:\/\//i.test(src)) return src
  
  // URL Encode the path to prevent SEO crawlers (like Google/Facebook) from rejecting URLs with spaces or Arabic characters
  const encodedPath = src.split('/').map(segment => encodeURIComponent(segment)).join('/')
  
  return `${siteUrl.replace(/\/+$/, '')}${encodedPath.startsWith('/') ? encodedPath : `/${encodedPath}`}`
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
