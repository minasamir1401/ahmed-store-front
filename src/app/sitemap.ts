import { MetadataRoute } from 'next'
import { getServerSiteUrl } from '@/lib/seo'
import { absoluteProductImageUrl, productImageVersion, productMainImage, withImageVersion } from '@/lib/product-images'

type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

type ProductSitemapItem = {
  id: string
  updatedAt?: string
  createdAt?: string
  image?: string | null
  imageAlt?: string | null
  title?: string | null
  titleEn?: string | null
  imageUpdatedAt?: string | null
}

type BrandSitemapItem = {
  id: string
  updatedAt?: string
  createdAt?: string
}

type TipSitemapItem = {
  id: string
  updatedAt?: string
  createdAt?: string
}

const absoluteUrl = (baseUrl: string, path: string) => `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`

const changedAt = (item: { updatedAt?: string; createdAt?: string }) => {
  return item.updatedAt ? new Date(item.updatedAt) : new Date(item.createdAt || Date.now())
}

const sitemapEntry = (url: string, changeFrequency: SitemapChangeFrequency, priority: number, lastModified = new Date()) => ({
  url,
  lastModified,
  changeFrequency,
  priority,
  alternates: {
    languages: {
      'ar-EG': url,
      'en-EG': `${url}${url.includes('?') ? '&' : '?'}lang=en`
    }
  }
})

const fetchProductPage = async (backendUrl: string, page: number): Promise<ProductSitemapItem[]> => {
  const res = await fetch(`${backendUrl}/api/products?page=${page}&limit=100`, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data.items) ? data.items : []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getServerSiteUrl()

  const routes = [
    sitemapEntry(absoluteUrl(baseUrl, ''), 'daily', 1.00),
    sitemapEntry(absoluteUrl(baseUrl, '/products'), 'daily', 0.95),
    sitemapEntry(absoluteUrl(baseUrl, '/categories'), 'weekly', 0.80),
    sitemapEntry(absoluteUrl(baseUrl, '/offers'), 'daily', 0.90),
    sitemapEntry(absoluteUrl(baseUrl, '/brands'), 'weekly', 0.80),
    sitemapEntry(absoluteUrl(baseUrl, '/health-tips'), 'daily', 0.80),
    sitemapEntry(absoluteUrl(baseUrl, '/bmi-calculator'), 'monthly', 0.70),
    sitemapEntry(absoluteUrl(baseUrl, '/about'), 'monthly', 0.60),
    sitemapEntry(absoluteUrl(baseUrl, '/faq'), 'monthly', 0.50),
    sitemapEntry(absoluteUrl(baseUrl, '/shipping'), 'monthly', 0.50),
    sitemapEntry(absoluteUrl(baseUrl, '/returns'), 'monthly', 0.50),
  ]

  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) return routes

  const cleanBackendUrl = backendUrl.replace(/\/+$/, '')

  try {
    let products: ProductSitemapItem[] = []

    // Fetch page 1 first to check total
    const p1Res = await fetch(`${cleanBackendUrl}/api/products?page=1&limit=100`, { next: { revalidate: 3600 } })
    if (p1Res.ok) {
      const p1Data = await p1Res.json()
      const items = Array.isArray(p1Data.items) ? p1Data.items : []
      products = products.concat(items)
      
      const total = typeof p1Data.total === 'number' ? p1Data.total : 0
      const totalPages = Math.ceil(total / 100)

      if (totalPages > 1) {
        const maxPages = Math.min(totalPages, 500)
        const batchSize = 5
        for (let page = 2; page <= maxPages; page += batchSize) {
          const pages = Array.from({ length: Math.min(batchSize, maxPages - page + 1) }, (_, index) => page + index)
          const batchItems = await Promise.all(pages.map((pageNumber) => fetchProductPage(cleanBackendUrl, pageNumber).catch(() => [])))
          batchItems.forEach(items => {
            products = products.concat(items)
          })
        }
      }
    }

    // Fetch brands & medical-tips (they are not paginated)
    const [brandsRes, tipsRes] = await Promise.all([
      fetch(`${cleanBackendUrl}/api/brands`, { next: { revalidate: 3600 } }),
      fetch(`${cleanBackendUrl}/api/medical-tips`, { next: { revalidate: 3600 } })
    ])

    const brandsData = brandsRes.ok ? await brandsRes.json() : []
    const tipsData = tipsRes.ok ? await tipsRes.json() : []
    const brands: BrandSitemapItem[] = Array.isArray(brandsData) ? brandsData : []
    const tips: TipSitemapItem[] = Array.isArray(tipsData) ? tipsData : []

    return [
      ...routes,
      ...products.map((product) => {
        const entry = sitemapEntry(
          absoluteUrl(baseUrl, `/product/${product.id}`),
          'daily',
          0.90,
          changedAt(product)
        )
        const imageUrl = absoluteProductImageUrl(productMainImage(product.image), baseUrl)
        return imageUrl ? {
          ...entry,
          images: [withImageVersion(imageUrl, productImageVersion(product))]
        } : entry
      }),
      ...brands.map((brand) => sitemapEntry(
        absoluteUrl(baseUrl, `/brands/${brand.id}`),
        'weekly',
        0.70,
        changedAt(brand)
      )),
      ...tips.map((tip) => sitemapEntry(
        absoluteUrl(baseUrl, `/health-tips/${tip.id}`),
        'weekly',
        0.70,
        changedAt(tip)
      ))
    ]
  } catch (err) {
    console.error('Sitemap generation error:', err)
    return routes
  }
}
