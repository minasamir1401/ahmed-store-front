import BrandDetailPageClient from './BrandDetailPageClient'
import type { Metadata } from 'next'
import { cache } from 'react'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  params: Promise<{
    id: string
  }>
}

// Fetch brand details and related products server-side
const getBrandData = cache(async (brandId: string) => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return { brand: null, products: [] }

  const cleanUrl = baseUrl.replace(/\/+$/, '')
  try {
    const brandRes = await fetch(`${cleanUrl}/api/brands/${brandId}?page=1&limit=100`, { next: { revalidate: 3600 } })
    if (!brandRes.ok) return { brand: null, products: [] }
    const brandData = await brandRes.json()
    const { products = [], ...brand } = brandData
    return { brand, products }
  } catch (e) {
    console.error(`Failed server-side fetch for brand ${brandId} from ${cleanUrl}:`, e)
    return { brand: null, products: [] }
  }
})

// Dynamic brand page SEO generation on the server
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = await params
  const { brand } = await getBrandData(resolvedParams.id)
  
  if (!brand) {
    return {
      title: 'الشركة غير موجودة | Vitamins HUB',
      description: 'الشركة التي تبحث عنها غير متوفرة حالياً.',
    }
  }

  const siteUrl = await getServerSiteUrl()

  return {
    title: `مكملات وفيتامينات شركة ${brand.name} الأصلية | Vitamins HUB`,
    description: `تسوق جميع منتجات ومكملات شركة ${brand.name} الأصلية 100% في مصر. بروتينات، فيتامينات، وأقوى حوارق الدهون من ${brand.name} مع توصيل سريع.`,
    alternates: {
      canonical: `/brands/${resolvedParams.id}`,
    },
    openGraph: {
      title: `مكملات وفيتامينات شركة ${brand.name} الأصلية | Vitamins HUB`,
      description: `تسوق جميع منتجات ومكملات شركة ${brand.name} الأصلية 100% في مصر.`,
      url: `${siteUrl}/brands/${resolvedParams.id}`,
      type: 'website',
      images: [
        {
          url: brand.image || '/logo-v2.png',
          alt: brand.name,
        }
      ]
    },
    twitter: {
      card: 'summary',
      title: `مكملات وفيتامينات شركة ${brand.name} الأصلية | Vitamins HUB`,
      description: `تسوق جميع منتجات ومكملات شركة ${brand.name} الأصلية 100% في مصر.`,
      images: [brand.image || '/logo-v2.png'],
    }
  }
}

export default async function BrandDetailPage({ params }: PageParams) {
  const resolvedParams = await params
  const { brand, products } = await getBrandData(resolvedParams.id)
  const siteUrl = await getServerSiteUrl()

  // Construct structured data (CollectionPage JSON-LD) on server-side
  let collectionSchema: any = null
  if (brand) {
    collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}/brands/${resolvedParams.id}/#collection`,
      "name": `مكملات وفيتامينات شركة ${brand.name} الأصلية`,
      "url": `${siteUrl}/brands/${resolvedParams.id}`,
      "description": `مجموعة منتجات ومكملات شركة ${brand.name} المتاحة للشراء في مصر عبر متجر Vitamins HUB.`,
      "about": {
        "@type": "Brand",
        "name": brand.name,
        "image": brand.image
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": products.length,
        "itemListElement": products.map((prod: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${siteUrl}/product/${prod.id}`,
          "name": prod.title,
          "image": prod.image
        }))
      }
    }
  }

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      <BrandDetailPageClient params={resolvedParams} initialBrand={brand} initialProducts={products} />
    </>
  )
}
