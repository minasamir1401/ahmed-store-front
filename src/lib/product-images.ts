type ProductImageSource = {
  imageAlt?: string | null
  titleEn?: string | null
  title?: string | null
}

export const productImageAlt = (product: ProductImageSource, fallback = 'Product image') => {
  return product?.imageAlt || product?.titleEn || product?.title || fallback
}

export const productImageThumb = (src?: string | null) => {
  if (!src) return ''
  return src.includes('/api/images/') && !src.endsWith('/thumb') ? `${src}/thumb` : src
}

export const absoluteProductImageUrl = (src: string | null | undefined, siteUrl: string) => {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return `${siteUrl.replace(/\/+$/, '')}${src.startsWith('/') ? src : `/${src}`}`
}

export const safeBrandImage = (src?: string | null) => {
  if (!src) return ''
  // Fix for blocked clearbit images by adblockers
  if (src.includes('logo.clearbit.com/')) {
    const domain = src.split('logo.clearbit.com/')[1]
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  }
  return src
}
