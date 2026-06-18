import BrandDetailPageClient from './BrandDetailPageClient'
import type { Metadata } from 'next'
import { cache } from 'react'
import { getServerSiteUrl } from '@/lib/seo'
import { absoluteProductImageUrl } from '@/lib/product-images'

interface PageParams {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    lang?: string
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
export async function generateMetadata({ params, searchParams }: PageParams): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()
  const canonicalUrl = `${siteUrl}/brands/${resolvedParams.id}`

  const { brand } = await getBrandData(resolvedParams.id)
  
  if (!brand) {
    return {
      title: isEn ? 'Brand Not Found | The VitaHub' : 'الماركة غير موجودة | The VitaHub',
      description: isEn ? 'The brand you are looking for is currently unavailable.' : 'الماركة التي تبحث عنها غير متوفرة حالياً.',
      metadataBase: new URL(siteUrl),
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'ar-EG': canonicalUrl,
          'en-EG': `${canonicalUrl}?lang=en`,
          'x-default': canonicalUrl
        }
      }
    }
  }

  const brandName = isEn ? (brand.nameEn || brand.name) : brand.name
  const brandImage = brand.image ? absoluteProductImageUrl(brand.image, siteUrl) : `${siteUrl}/logo-header.jpg`
  
  const title = isEn
    ? `Original ${brandName} Supplements & Vitamins | The VitaHub Egypt`
    : `مكملات وفيتامينات ${brandName} الأصلية | The VitaHub`

  const description = isEn
    ? `Shop all 100% original ${brandName} supplements and vitamins in Egypt. Proteins, vitamins, and fat burners from ${brandName} with fast delivery.`
    : `تسوق جميع منتجات ${brandName} الأصلية 100% في مصر. بروتينات، فيتامينات، وأقوى حوارق الدهون من ${brandName} مع توصيل سريع.`

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ar-EG': canonicalUrl,
        'en-EG': `${canonicalUrl}?lang=en`,
        'x-default': canonicalUrl
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: isEn ? 'en_US' : 'ar_EG',
      siteName: 'The VitaHub',
      images: [
        {
          url: brandImage,
          secureUrl: brandImage,
          width: 600,
          height: 600,
          alt: brandName,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [brandImage],
    }
  }
}

export default async function BrandDetailPage({ params, searchParams }: PageParams) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const { brand, products } = await getBrandData(resolvedParams.id)
  const siteUrl = await getServerSiteUrl()

  let collectionSchema: any = null
  let breadcrumbSchema: any = null

  if (brand) {
    const brandName = isEn ? (brand.nameEn || brand.name) : brand.name

    collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}/brands/${resolvedParams.id}/#collection`,
      "name": isEn ? `Original ${brandName} Supplements & Vitamins` : `مكملات وفيتامينات ${brandName} الأصلية`,
      "url": `${siteUrl}/brands/${resolvedParams.id}`,
      "description": isEn 
        ? `Collection of ${brandName} supplements and vitamins available in Egypt at The VitaHub.`
        : `مجموعة منتجات ${brandName} المتاحة للشراء في مصر عبر متجر The VitaHub.`,
      "about": {
        "@type": "Brand",
        "name": brandName,
        "image": brand.image ? absoluteProductImageUrl(brand.image, siteUrl) : `${siteUrl}/logo-header.jpg`
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": products.length,
        "itemListElement": products.map((prod: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${siteUrl}/product/${prod.id}${isEn ? '?lang=en' : ''}`,
          "name": isEn ? (prod.titleEn || prod.title) : prod.title,
          "image": prod.image ? absoluteProductImageUrl(prod.image, siteUrl) : `${siteUrl}/logo-header.jpg`
        }))
      }
    }

    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": isEn ? "Home" : "الرئيسية",
          "item": `${siteUrl}/${isEn ? '?lang=en' : ''}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": isEn ? "Brands" : "الماركات",
          "item": `${siteUrl}/brands${isEn ? '?lang=en' : ''}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": brandName,
          "item": `${siteUrl}/brands/${brand.id}${isEn ? '?lang=en' : ''}`
        }
      ]
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
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <BrandDetailPageClient params={resolvedParams} initialBrand={brand} initialProducts={products} />
    </>
  )
}
