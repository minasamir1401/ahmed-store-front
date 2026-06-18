import React from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import BrandsPageClient from './BrandsPageClient'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string }>
}

// Fetch brands server-side
const getBrands = cache(async () => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return []

  const cleanUrl = baseUrl.replace(/\/+$/, '')
  try {
    const res = await fetch(`${cleanUrl}/api/brands`, { next: { revalidate: 3600 } })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.error('Error fetching brands on server:', e)
  }
  return []
})

// Dynamic metadata for the brands page
export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  const title = isEn
    ? "Original Global Supplement Brands | The VitaHub Egypt"
    : "الماركات العالمية الأصلية | The VitaHub"

  const description = isEn
    ? "Explore original imported supplement and vitamin brands available in Egypt at The VitaHub. 100% authentic products with fast delivery."
    : "تصفح منتجات أفضل الماركات العالمية الأصلية 100% في مصر. بروتينات، فيتامينات، وأقوى الماركات المستوردة مع توصيل سريع."

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/brands`,
      languages: {
        'ar-EG': `${siteUrl}/brands`,
        'en-EG': `${siteUrl}/brands?lang=en`,
        'x-default': `${siteUrl}/brands`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/brands`,
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-header.jpg`,
          width: 800,
          height: 600,
          alt: 'The VitaHub Brands',
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

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <BrandsPageClient initialBrands={brands} />
  )
}
