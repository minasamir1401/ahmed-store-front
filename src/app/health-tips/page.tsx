import React from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import HealthTipsPageClient from './HealthTipsPageClient'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string }>
}

// Fetch health tips server-side
const getTips = cache(async () => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return []

  const cleanUrl = baseUrl.replace(/\/+$/, '')
  try {
    const res = await fetch(`${cleanUrl}/api/medical-tips`, { next: { revalidate: 300 } })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.error('Error fetching tips on server:', e)
  }
  return []
})

// Dynamic metadata for the health tips page
export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  const title = isEn
    ? "Health Tips & Medical Articles | The VitaHub Egypt"
    : "نصائح طبية ومقالات صحية تهمك | The VitaHub"

  const description = isEn
    ? "Read expert health advice, diet tips, and exercise information from medical specialists at The VitaHub Egypt."
    : "اقرأ نصائح طبية موثوقة ومقالات صحية ومعلومات مفصلة عن الفيتامينات والمكملات الغذائية من خبراء وأطباء The VitaHub."

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/health-tips`,
      languages: {
        'ar-EG': `${siteUrl}/health-tips`,
        'en-EG': `${siteUrl}/health-tips?lang=en`,
        'x-default': `${siteUrl}/health-tips`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/health-tips`,
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-header.jpg`,
          width: 800,
          height: 600,
          alt: 'The VitaHub Health Tips',
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

export default async function HealthTipsPage() {
  const tips = await getTips()

  return (
    <HealthTipsPageClient initialTips={tips} />
  )
}
