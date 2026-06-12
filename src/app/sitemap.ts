import { MetadataRoute } from 'next'
import { getServerSiteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getServerSiteUrl()

  const routes = [
    { url: '', changefreq: 'daily', priority: 1.00 },
    { url: '/products', changefreq: 'daily', priority: 0.90 },
    { url: '/categories', changefreq: 'weekly', priority: 0.80 },
    { url: '/offers', changefreq: 'daily', priority: 0.85 },
    { url: '/brands', changefreq: 'weekly', priority: 0.80 },
    { url: '/health-tips', changefreq: 'daily', priority: 0.80 },
    { url: '/bmi-calculator', changefreq: 'monthly', priority: 0.70 },
    { url: '/about', changefreq: 'monthly', priority: 0.60 },
    { url: '/faq', changefreq: 'monthly', priority: 0.50 },
    { url: '/shipping', changefreq: 'monthly', priority: 0.50 },
    { url: '/returns', changefreq: 'monthly', priority: 0.50 },
    { url: '/track', changefreq: 'monthly', priority: 0.50 },
  ]

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq as any,
    priority: route.priority,
  }))

  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) return staticRoutes

  try {
    const [productsRes, brandsRes, tipsRes] = await Promise.all([
      fetch(`${backendUrl.replace(/\/+$/, '')}/api/products?page=1&limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${backendUrl.replace(/\/+$/, '')}/api/brands`, { next: { revalidate: 3600 } }),
      fetch(`${backendUrl.replace(/\/+$/, '')}/api/medical-tips`, { next: { revalidate: 3600 } })
    ])

    const productsData = productsRes.ok ? await productsRes.json() : { items: [] }
    const products = Array.isArray(productsData.items) ? productsData.items : (Array.isArray(productsData) ? productsData : [])
    const brands = brandsRes.ok ? await brandsRes.json() : []
    const tips = tipsRes.ok ? await tipsRes.json() : []

    return [
      ...staticRoutes,
      ...products.map((product: any) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7
      })),
      ...(Array.isArray(brands) ? brands : []).map((brand: any) => ({
        url: `${baseUrl}/brands/${brand.id}`,
        lastModified: brand.createdAt ? new Date(brand.createdAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.65
      })),
      ...(Array.isArray(tips) ? tips : []).map((tip: any) => ({
        url: `${baseUrl}/health-tips/${tip.id}`,
        lastModified: tip.updatedAt ? new Date(tip.updatedAt) : new Date(tip.createdAt || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6
      }))
    ]
  } catch {
    return staticRoutes
  }
}
