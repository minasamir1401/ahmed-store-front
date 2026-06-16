import { MetadataRoute } from 'next'
import { getServerSiteUrl } from '@/lib/seo'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getServerSiteUrl()

  return {
    rules: {
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
        '/uploads/',
        '/_next/image'
      ],
      disallow: [
        '/admin',
        '/cart',
        '/checkout',
        '/profile',
        '/track',
        '/login',
        '/forgot',
        '/wishlist',
        '/api/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
