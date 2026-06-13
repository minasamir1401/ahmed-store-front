import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleDetailClient from './ArticleDetailClient'
import type { Metadata } from 'next'
import { cache } from 'react'

interface PageParams {
  params: Promise<{
    id: string
  }>
}

// Dynamic server-side SEO generation
const getTip = cache(async (id: string) => {
  const BACKEND_API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (!BACKEND_API) return null

  const res = await fetch(`${BACKEND_API.replace(/\/+$/, '')}/api/medical-tips/${id}`, { next: { revalidate: 300 } })
  if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null

  const tip = await res.json()
  if (!tip || tip.error) return null
  return tip
})

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    const { id } = await params
    const tip = await getTip(id)
    
    if (!tip) {
      return {
        title: 'المقال غير موجود | Vitamins HUB',
        description: 'المقال الذي تبحث عنه غير متوفر حالياً.',
      }
    }

    const post = {
      title: tip.title,
      excerpt: tip.content ? tip.content.substring(0, 120) + '...' : '',
      image: tip.image || 'https://placehold.co/800x400/e8f0ed/2e7d5e?text=Health+Tip',
    }

    return {
      title: `${post.title} | Vitamins HUB`,
      description: post.excerpt,
      alternates: {
        canonical: `/health-tips/${id}`,
      },
      openGraph: {
        title: `${post.title} | Vitamins HUB`,
        description: post.excerpt,
        type: 'article',
        images: [{ url: post.image }]
      }
    }
  } catch (err) {
    return {
      title: 'المقال غير موجود | Vitamins HUB',
      description: 'المقال الذي تبحث عنه غير متوفر حالياً.',
    }
  }
}

export default async function ArticleDetailPage({ params }: PageParams) {
  const { id } = await params
  let post = null

  try {
    const tip = await getTip(id)
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
    }
  } catch (err) {
    console.error('Error fetching tip:', err)
  }

  return (
    <>
      <Header />
      <ArticleDetailClient post={post} params={{ id }} />
      <Footer />
    </>
  )
}
