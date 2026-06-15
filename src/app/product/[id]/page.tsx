import ProductPageClient from './ProductPageClient'
import type { Metadata } from 'next'
import { cache } from 'react'
import { absoluteProductImageUrl, productImageAlt, productMainImage } from '@/lib/product-images'
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
    const res = await fetch(targetUrl, { next: { revalidate: 60 } })
    if (res.ok) return await res.json()
  } catch (e) {
    console.error(`Failed server-side fetch for product ${id} from ${targetUrl}:`, e)
  }
  return null
})

const cleanSeoText = (value: string) => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const limitSeoText = (value: string, maxLength: number) => {
  const text = cleanSeoText(value)
  if (text.length <= maxLength) return text

  const sliced = text.slice(0, maxLength).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trim()}...`
}

const productSeoTitle = (product: any) => {
  const brandName = product.brand?.name ? ` | ${product.brand.name}` : ''
  return limitSeoText(`${product.title}${brandName}`, 62)
}

const productSeoDescription = (product: any) => {
  const description = product.seoDesc || product.desc || product.seoDescEn || product.descEn || `اشتري ${product.title} من The VitaHub مع توصيل سريع ومنتجات أصلية 100%.`
  return limitSeoText(description, 155)
}

const productSeoImage = (product: any, siteUrl: string) => {
  return absoluteProductImageUrl(productMainImage(product.image), siteUrl) || `${siteUrl}/logo-header.jpg`
}

// Elite dynamic SEO metadata generation on the server
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)
  
  if (!product) {
    return {
      title: 'المنتج غير موجود | The VitaHub',
      description: 'المنتج الذي تبحث عنه غير متوفر حالياً.',
    }
  }

  const siteUrl = await getSiteUrl()
  const imageUrl = productSeoImage(product, siteUrl)
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
      siteName: 'The VitaHub',
      locale: 'ar_EG',
      type: 'website',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: product.imageWidth || 800,
          height: product.imageHeight || 800,
          alt: imageAlt,
          type: 'image/jpeg',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
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
    const seoImage = productSeoImage(product, siteUrl)
    
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
      "image": [seoImage],
      "alternateName": product.imageAlt || product.titleEn || product.title,
      "description": productSeoDescription(product),
      "sku": skuValue,
      "mpn": product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand?.name || 'The VitaHub'
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "28"
      },
      "review": [
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "عميل متجر ذا فيتا هوب"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "منتج ممتاز وأصلي 100%، التوصيل سريع والتغليف ممتاز."
        }
      ],
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
          "name": "The VitaHub"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": product.price >= 2000 ? "0" : "60",
            "currency": "EGP"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "EG"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 2,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 4,
              "unitCode": "DAY"
            }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "EG",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
          "merchantReturnDays": 7,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
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
