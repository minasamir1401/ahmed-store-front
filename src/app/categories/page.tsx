import React from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import CategoriesPageClient from './CategoriesPageClient'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string }>
}

// Fetch categories server-side
const getCategories = cache(async () => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return []

  const cleanUrl = baseUrl.replace(/\/+$/, '')
  try {
    const res = await fetch(`${cleanUrl}/api/categories`, { next: { revalidate: 3600 } })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.error('Error fetching categories on server:', e)
  }
  return []
})

// Dynamic metadata for the categories page
export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  const title = isEn
    ? "Browse Supplement Categories | The VitaHub Egypt"
    : "تصفح أقسام المكملات الغذائية والفيتامينات | The VitaHub"

  const description = isEn
    ? "Explore our wide range of premium health supplements, vitamins, sport nutrition, and weight management categories at The VitaHub Egypt."
    : "تصفح كافة تصنيفات وأقسام المكملات الغذائية الأصلية 100% في مصر. فيتامينات، بروتينات جيم، حوارق دهون، وصحة عامة مع توصيل سريع."

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/categories`,
      languages: {
        'ar-EG': `${siteUrl}/categories`,
        'en-EG': `${siteUrl}/categories?lang=en`,
        'x-default': `${siteUrl}/categories`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/categories`,
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-header.jpg`,
          width: 800,
          height: 600,
          alt: 'The VitaHub Categories',
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

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <CategoriesPageClient initialCategories={categories} />
  )
}
