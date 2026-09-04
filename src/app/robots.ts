import { MetadataRoute } from 'next'
import { getServerSiteUrl } from '@/lib/seo'

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
          '/api/medical-tips',
          '/api/og/',
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
