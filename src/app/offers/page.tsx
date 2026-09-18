import React from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import OffersPageClient from './OffersPageClient'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string }>
}

// Fetch offers and products on server
const getOffersData = cache(async () => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) return { offers: [], products: [] }

  const cleanUrl = baseUrl.replace(/\/+$/, '')
  try {
    const [offersRes, productsRes] = await Promise.all([
      fetch(`${cleanUrl}/api/offers`, { next: { revalidate: 300 } }),
      fetch(`${cleanUrl}/api/products`, { next: { revalidate: 300 } })
    ])

    const offers = offersRes.ok ? await offersRes.json() : []
    const products = productsRes.ok ? await productsRes.json() : []

    return { offers, products }
  } catch (e) {
    console.error('Error fetching offers data on server:', e)
    return { offers: [], products: [] }
  }
})

// Dynamic metadata for the offers page
export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  const title = isEn
    ? "Exclusive Supplement Deals & Offers | The VitaHub Egypt"
    : "عروض حصرية وخصومات المكملات الغذائية | The VitaHub"

  const description = isEn
    ? "Save big with exclusive deals and discounts on top vitamins, dietary supplements, and proteins in Egypt at The VitaHub."
    : "وفر الكثير مع عروض التوفير وخصومات حصرية على الفيتامينات، المكملات الغذائية، البروتينات، وحوارق الدهون الأصلية 100% في مصر من The VitaHub."

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/offers`,
      languages: {
        'ar-EG': `${siteUrl}/offers`,
        'en-EG': `${siteUrl}/offers?lang=en`,
        'x-default': `${siteUrl}/offers`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/offers`,
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-header.jpg`,
          width: 800,
          height: 600,
          alt: 'The VitaHub Exclusive Offers',
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

export default async function OffersPage() {
  const { offers, products } = await getOffersData()

  const lightweightOffersProducts = Array.isArray(products)
    ? products
        .filter((p: any) => {
          const discountPercent = p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
          return (p.oldPrice && p.oldPrice > p.price) || (p.discountType && p.discountValue) || discountPercent > 0
        })
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          titleEn: p.titleEn || null,
          price: p.price,
          oldPrice: p.oldPrice || null,
          image: p.image,
          imageAlt: p.imageAlt || null,
          imageWidth: p.imageWidth || null,
          imageHeight: p.imageHeight || null,
          tag: p.tag || null,
          discountType: p.discountType || null,
          discountValue: p.discountValue || null,
          categoryId: p.categoryId,
          brandId: p.brandId || null,
          createdAt: p.createdAt
        }))
    : []

  return (
    <OffersPageClient initialOffers={offers} initialProducts={lightweightOffersProducts} />
  )
}
