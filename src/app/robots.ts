import { MetadataRoute } from 'next'
import { getServerSiteUrl } from '@/lib/seo'

// Keep this as the only robots.txt source. A public/robots.txt can mask these
// rules in production and block /api/catalog/image/ through the /api/ deny rule.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getServerSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/product/',
          '/categories',
          '/offers',
          '/brands',
          '/health-tips',
          '/bmi-calculator',
          '/about',
          '/faq',
          '/shipping',
          '/returns',
          '/api/images/',
          '/api/products',
          '/api/catalog/',
          '/api/medical-tips',
          '/api/og/',
          '/facebook-feed.xml',
          '/facebook-feed.csv',
          '/facebook-catalog.xml',
          '/uploads/',
          '/_next/image'
        ],
        disallow: [
          '/admin',
          '/cart',
          '/checkout',
          '/profile',
          '/order-status',
          '/login',
          '/forgot',
          '/wishlist',
          '/frame.png',
          '/api/'
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        disallow: ['/frame.png'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
