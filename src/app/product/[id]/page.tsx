import ProductPageClient from './ProductPageClient'
import type { Metadata } from 'next'
import { cache } from 'react'
import { absoluteProductImageUrl, productImageAlt, productImageVersion, productMainImage, withImageVersion } from '@/lib/product-images'
import { getServerSiteUrl as getSiteUrl } from '@/lib/seo'

interface PageParams {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    lang?: string
  }>
}

type ProductSpec = {
  label?: string
  value?: unknown
}

type ProductData = {
  id: string
  title: string
  titleEn?: string | null
  desc?: string | null
  descEn?: string | null
  seoDesc?: string | null
  seoDescEn?: string | null
  seoKeywords?: string | null
  seoKeywordsEn?: string | null
  image?: string | null
  imageAlt?: string | null
  imageWidth?: number | null
  imageHeight?: number | null
  updatedAt?: string | null
  imageUpdatedAt?: string | null
  price: number
  productSpecs?: string | null
  specifications?: string | null
  categoryId?: string | null
  category?: { name?: string | null; nameEn?: string | null } | null
  brand?: { name?: string | null } | null
}

type JsonLd = Record<string, unknown>

// Server-side fetching with cache
const getProduct = cache(async (id: string): Promise<ProductData | null> => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return null

  const targetUrl = `${baseUrl.replace(/\/+$/, '')}/api/products/${id}`
  try {
    const res = await fetch(targetUrl, { cache: 'no-store' })
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

const productSeoTitle = (product: ProductData, isEn: boolean) => {
  let title = isEn ? (product.titleEn || product.title) : product.title
  if (!title) return ''

  // Clean up any existing "| The VitaHub" or "| ذا فيتا هوب" from the title
  title = title
    .replace(/\s*\|\s*The\s*VitaHub/gi, '')
    .replace(/\s*\|\s*ذا\s*فيتا\s*هوب/g, '')
    .trim()

  const brandName = product.brand?.name || ''
  if (brandName) {
    const lowerTitle = title.toLowerCase()
    const lowerBrand = brandName.toLowerCase()
    if (!lowerTitle.includes(lowerBrand)) {
      title = `${title} | ${brandName}`
    }
  }

  return limitSeoText(title, 62)
}

const productSeoDescription = (product: ProductData, isEn: boolean) => {
  if (isEn) {
    const description = product.seoDescEn || product.descEn || `Buy ${product.titleEn || product.title} from The VitaHub Egypt with fast delivery and 100% original products.`
    return limitSeoText(description, 155)
  }
  const description = product.seoDesc || product.desc || `اشتري ${product.title} من The VitaHub مع توصيل سريع ومنتجات أصلية 100%.`
  return limitSeoText(description, 155)
}

const productSeoImage = (product: ProductData, siteUrl: string) => {
  const imageUrl = absoluteProductImageUrl(productMainImage(product.image), siteUrl) || `${siteUrl}/logo-header.jpg`
  return withImageVersion(imageUrl, productImageVersion(product))
}

// dynamic SEO metadata generation on the server
export async function generateMetadata({ params, searchParams }: PageParams): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getSiteUrl()
  const canonicalUrl = `${siteUrl}/product/${resolvedParams.id}`
  
  const product = await getProduct(resolvedParams.id)
  
  if (!product) {
    return {
      title: isEn ? 'Product Not Found | The VitaHub' : 'المنتج غير موجود | The VitaHub',
      description: isEn ? 'The product you are looking for is currently unavailable.' : 'المنتج الذي تبحث عنه غير متوفر حالياً.',
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

  const imageUrl = productSeoImage(product, siteUrl)
  const imageAlt = productImageAlt(product, product.title)
  const title = productSeoTitle(product, isEn)
  const description = productSeoDescription(product, isEn)

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
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
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

export default async function ProductPage({ params, searchParams }: PageParams) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const product = await getProduct(resolvedParams.id)
  const siteUrl = await getSiteUrl()

  let structuredData: JsonLd | null = null
  let breadcrumbData: JsonLd | null = null

  if (product) {
    const seoImage = productSeoImage(product, siteUrl)
    
    let specs: ProductSpec[] = []
    try {
      const raw = product.productSpecs ? JSON.parse(product.productSpecs) : (product.specifications ? JSON.parse(product.specifications) : null)
      if (Array.isArray(raw)) {
        specs = raw
      } else if (raw && typeof raw === 'object') {
        specs = Object.entries(raw).map(([label, value]) => ({ label, value }))
      }
    } catch {}
    
    const specLabel = (spec: ProductSpec) => typeof spec.label === 'string' ? spec.label.toUpperCase() : ''
    const specText = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
    const skuValue = specText(specs.find((s) => specLabel(s).includes('SKU'))?.value) || product.id
    const gtinValue = specText(specs.find((s) => specLabel(s).includes('GTIN') || specLabel(s).includes('BARCODE') || (s.label || '').includes('باركود'))?.value)
    const mpnValue = specText(specs.find((s) => specLabel(s).includes('MPN') || specLabel(s).includes('MODEL') || (s.label || '').includes('موديل'))?.value) || product.id

    structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": isEn ? (product.titleEn || product.title) : product.title,
      "image": [seoImage],
      "alternateName": product.imageAlt || product.titleEn || product.title,
      "description": productSeoDescription(product, isEn),
      "sku": skuValue,
      "mpn": mpnValue,
      ...(gtinValue ? { "gtin": gtinValue } : {}),
      "brand": {
        "@type": "Brand",
        "name": product.brand?.name || 'The VitaHub'
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
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      }
    }

    const catName = isEn ? (product.category?.nameEn || product.category?.name || "Supplements") : (product.category?.name || "المكملات الغذائية")

    breadcrumbData = {
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
          "name": isEn ? "Products" : "المنتجات",
          "item": `${siteUrl}/products${isEn ? '?lang=en' : ''}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": catName,
          "item": `${siteUrl}/categories${isEn ? '?lang=en' : ''}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": isEn ? (product.titleEn || product.title) : product.title,
          "item": `${siteUrl}/product/${product.id}${isEn ? '?lang=en' : ''}`
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
