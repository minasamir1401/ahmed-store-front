import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleDetailClient from './ArticleDetailClient'
import type { Metadata } from 'next'
import { cache } from 'react'
import { absoluteProductImageUrl } from '@/lib/product-images'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    lang?: string
  }>
}

// Fetch tip on server-side
const getTip = cache(async (id: string) => {
  const BACKEND_API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!BACKEND_API) return null

  const res = await fetch(`${BACKEND_API.replace(/\/+$/, '')}/api/medical-tips/${id}`, { next: { revalidate: 300 } })
  if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null

  const tip = await res.json()
  if (!tip || tip.error) return null
  return tip
})

// Dynamic SEO metadata generation
export async function generateMetadata({ params, searchParams }: PageParams): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()
  const canonicalUrl = `${siteUrl}/health-tips/${resolvedParams.id}`

  try {
    const tip = await getTip(resolvedParams.id)
    
    if (!tip) {
      return {
        title: isEn ? 'Article Not Found | The VitaHub' : 'المقال غير موجود | The VitaHub',
        description: isEn ? 'The article you are looking for is currently unavailable.' : 'المقال الذي تبحث عنه غير متوفر حالياً.',
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

    const tipImage = tip.image ? absoluteProductImageUrl(tip.image, siteUrl) : `${siteUrl}/logo-header.jpg`
    const title = isEn ? (tip.titleEn || tip.title) : tip.title
    const content = isEn ? (tip.contentEn || tip.content) : tip.content
    const excerpt = content ? content.substring(0, 150) + '...' : ''

    return {
      title: `${title} | The VitaHub`,
      description: excerpt,
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
        title: `${title} | The VitaHub`,
        description: excerpt,
        url: canonicalUrl,
        type: 'article',
        locale: isEn ? 'en_US' : 'ar_EG',
        siteName: 'The VitaHub',
        images: [
          {
            url: tipImage,
            secureUrl: tipImage,
            width: 800,
            height: 450,
            alt: title,
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | The VitaHub`,
        description: excerpt,
        images: [tipImage],
      }
    }
  } catch (err) {
    return {
      title: isEn ? 'Article Not Found | The VitaHub' : 'المقال غير موجود | The VitaHub',
      description: isEn ? 'The article you are looking for is currently unavailable.' : 'المقال الذي تبحث عنه غير متوفر حالياً.',
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
}

export default async function ArticleDetailPage({ params, searchParams }: PageParams) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  let post: any = null
  let structuredData: any = null

  try {
    const tip = await getTip(resolvedParams.id)
    if (tip) {
        post = {
          id: tip.id,
          title: tip.title,
          titleEn: tip.titleEn,
          image: tip.image || 'https://placehold.co/800x400/e8f0ed/2e7d5e?text=Health+Tip',
          excerpt: tip.content ? tip.content.substring(0, 120) + '...' : '',
          content: tip.content || '',
          contentEn: tip.contentEn || '',
          rawDate: tip.createdAt
        }

        const title = isEn ? (tip.titleEn || tip.title) : tip.title
        const content = isEn ? (tip.contentEn || tip.content) : tip.content
        const tipImage = tip.image ? absoluteProductImageUrl(tip.image, siteUrl) : `${siteUrl}/logo-header.jpg`

        structuredData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${siteUrl}/health-tips/${tip.id}`
          },
          "headline": title,
          "description": content ? content.substring(0, 150) + '...' : '',
          "image": tipImage,
          "author": {
            "@type": "Organization",
            "name": "The VitaHub Team",
            "url": siteUrl
          },
          "publisher": {
            "@type": "Organization",
            "name": "The VitaHub",
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo-header.jpg`
            }
          },
          "datePublished": tip.createdAt,
          "dateModified": tip.updatedAt || tip.createdAt
        }
    }
  } catch (err) {
    console.error('Error fetching tip:', err)
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <Header />
      <ArticleDetailClient post={post} params={resolvedParams} />
      <Footer />
    </>
  )
}
