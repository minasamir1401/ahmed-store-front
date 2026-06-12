import ProductPageClient from './ProductPageClient'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { cache } from 'react'
import { absoluteProductImageUrl, productImageAlt } from '@/lib/product-images'
import { getServerSiteUrl as getSiteUrl } from '@/lib/seo'

interface PageParams {
  params: Promise<{
    id: string
  }>
}

// Robust server-side proxy fetching
const getProduct = cache(async (id: string) => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return null

  const targetUrl = `${baseUrl.replace(/\/+$/, '')}/api/products/${id}`
  try {
    const res = await fetch(targetUrl, { next: { revalidate: 3600 } })
    if (res.ok) return await res.json()
  } catch (e) {
    console.error(`Failed server-side fetch for product ${id} from ${targetUrl}:`, e)
  }
  return null
})

const productSeoTitle = (product: any) => {
  return product.titleEn ? `${product.title} | ${product.titleEn}` : product.title
}

const productSeoDescription = (product: any) => {
  return product.seoDesc || product.seoDescEn || product.desc || product.descEn || `اشتري ${product.title} من Vitamins HUB مع توصيل سريع ومنتجات أصلية.`
}

// Elite dynamic SEO metadata generation on the server
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)
  
  if (!product) {
    return {
      title: 'المنتج غير موجود | Vitamins HUB',
      description: 'المنتج الذي تبحث عنه غير متوفر حالياً.',
    }
  }

  const siteUrl = await getSiteUrl()
  const imageUrl = absoluteProductImageUrl(product.image, siteUrl)
  const imageAlt = productImageAlt(product, product.title)
  const title = productSeoTitle(product)
  const description = productSeoDescription(product)
  const canonicalUrl = `${siteUrl}/product/${resolvedParams.id}`

  return {
    title,
    description,
    keywords: [
      ...(product.seoKeywords ? product.seoKeywords.split(',').map((k: string) => k.trim()) : []),
      ...(product.seoKeywordsEn ? product.seoKeywordsEn.split(',').map((k: string) => k.trim()) : [])
    ].filter(Boolean) || undefined,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Vitamins HUB',
      locale: 'ar_EG',
      type: 'website',
      images: [
        {
          url: imageUrl || product.image,
          width: product.imageWidth || 800,
          height: product.imageHeight || 800,
          alt: imageAlt,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl || product.image],
    }
  }
}

export default async function ProductPage({ params }: PageParams) {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)
  const siteUrl = await getSiteUrl()

  // Construct structured data (Product JSON-LD) on server-side
  let structuredData: any = null
  let breadcrumbData: any = null

  if (product) {
    const additionalImages = product.images ? product.images.split(',').map((img: string) => img.trim()).filter((i: string) => i) : []
    const allImages = [product.image, ...additionalImages].filter(Boolean).map((img: string) => absoluteProductImageUrl(img, siteUrl))
    
    let specs: any[] = []
    try {
      const raw = product.productSpecs ? JSON.parse(product.productSpecs) : (product.specifications ? JSON.parse(product.specifications) : null)
      if (Array.isArray(raw)) { specs = raw }
    } catch {}
    
    const skuValue = specs.find((s: any) => s.label?.includes('SKU'))?.value || product.id

    structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": allImages,
      "alternateName": product.imageAlt || product.titleEn || product.title,
      "description": product.seoDescEn || product.seoDesc || product.descEn || product.desc || '',
      "sku": skuValue,
      "mpn": product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand?.name || 'Vitamins HUB'
      },
      "offers": {
        "@type": "Offer",
        "url": `${siteUrl}/product/${product.id}`,
        "priceCurrency": "EGP",
        "price": product.price,
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Vitamins HUB"
        }
      }
    }

    breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": `${siteUrl}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "المنتجات",
          "item": `${siteUrl}/products`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.category?.name || "المكملات الغذائية",
          "item": `${siteUrl}/products?category=${product.categoryId || ''}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": product.title,
          "item": `${siteUrl}/product/${product.id}`
        }
      ]
    }
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
      <ProductPageClient params={resolvedParams} initialProduct={product} />
    </>
  )
}
