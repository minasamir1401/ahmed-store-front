import React from 'react'
import type { Metadata } from 'next'
import ProductsPageClient from './ProductsPageClient'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string; q?: string; category?: string }>
}

// Server-side generateMetadata for SEO
export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  const title = isEn
    ? "All Supplements & Vitamins Shop | The VitaHub Egypt"
    : "كل المكملات الغذائية والفيتامينات | متجر The VitaHub"

  const description = isEn
    ? "Browse our full collection of 100% original imported health supplements, vitamins, proteins, and weight loss products in Egypt."
    : "تصفح تشكيلة متكاملة من المكملات الغذائية الأصلية 100% في مصر. بروتينات جيم، فيتامينات ومعادن، وحوارق دهون مستوردة بأفضل الأسعار مع توصيل سريع."

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/products`,
      languages: {
        'ar-EG': `${siteUrl}/products`,
        'en-EG': `${siteUrl}/products?lang=en`,
        'x-default': `${siteUrl}/products`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products`,
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-header.jpg`,
          width: 800,
          height: 600,
          alt: 'The VitaHub Products Shop',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/logo-header.jpg`],
    }
  }
}

export default async function ProductsPage() {
  return (
    <ProductsPageClient />
  )
}
