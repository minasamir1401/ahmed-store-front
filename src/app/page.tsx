import React from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string }>
}

// Fetch home data server-side
const getHomeData = cache(async () => {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    return { products: [], hero: null, categories: [], articles: [] }
  }

  const cleanUrl = baseUrl.replace(/\/+$/, '')
  try {
    const [productsRes, heroRes, categoriesRes, articlesRes] = await Promise.all([
      fetch(`${cleanUrl}/api/products`, { next: { revalidate: 300 } }),
      fetch(`${cleanUrl}/api/hero`, { next: { revalidate: 300 } }),
      fetch(`${cleanUrl}/api/categories`, { next: { revalidate: 300 } }),
      fetch(`${cleanUrl}/api/medical-tips`, { next: { revalidate: 300 } }).catch(() => null)
    ])

    const products = productsRes && productsRes.ok ? await productsRes.json() : []
    const hero = heroRes && heroRes.ok ? await heroRes.json() : null
    const categories = categoriesRes && categoriesRes.ok ? await categoriesRes.json() : []
    const articles = articlesRes && articlesRes.ok ? await articlesRes.json() : []

    return { products, hero, categories, articles }
  } catch (e) {
    console.error('Error fetching home page data on server:', e)
    return { products: [], hero: null, categories: [], articles: [] }
  }
})

// Dynamic localized metadata for the homepage
export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()
  
  const title = isEn
    ? "The VitaHub | Original Vitamins & Dietary Supplements Store in Egypt"
    : "The VitaHub | ذا فيتا هوب | متجر المكملات الغذائية والفيتامينات الأصلي في مصر"
    
  const description = isEn
    ? "Shop the best 100% original imported vitamins, dietary supplements, proteins, fat burners, and fitness products in Egypt with The VitaHub. Fast delivery and expert medical support."
    : "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع The VitaHub (ذا فيتا هوب). توصيل سريع ودعم طبي متخصص."

  const keywords = isEn
    ? ["vitamins", "dietary supplements", "proteins Egypt", "gym supplements", "Vitamins Egypt", "omega 3", "vitamin d", "The VitaHub"]
    : ["فيتامينات", "مكملات غذائية", "بروتينات مصر", "مكملات جيم", "Vitamins Egypt", "The VitaHub", "ذا فيتا هوب", "أوميجا 3"]

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/`,
      languages: {
        'ar-EG': `${siteUrl}/`,
        'en-EG': `${siteUrl}/?lang=en`,
        'x-default': `${siteUrl}/`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/`,
      siteName: 'The VitaHub',
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-header.jpg`,
          width: 800,
          height: 600,
          alt: 'The VitaHub Premium Supplements',
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

export default async function Home() {
  const { products, hero, categories, articles } = await getHomeData()

  // Clean products array on the server side to reduce HTML size dramatically
  const lightweightProducts = Array.isArray(products)
    ? products.map((p: any) => ({
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
    <HomeClient
      initialProducts={lightweightProducts}
      initialHero={hero}
      initialCategories={categories}
      initialArticles={articles}
    />
  )
}
