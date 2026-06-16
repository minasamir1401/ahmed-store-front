"use client"

import React, { useEffect, useState } from 'react'
import { Calendar, Clock, ChevronRight, Share2, Star, BookOpen, Heart, Leaf, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from './ShareButton'
import { useLanguage } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'

// ─────────────────────────────────────────────
// Smart formatter: plain text → rich HTML blocks
// ─────────────────────────────────────────────
function formatArticleContent(text: string, isRtl: boolean): React.ReactNode[] {
  if (!text) return []

  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '')
  const nodes: React.ReactNode[] = []
  let key = 0

  const isNumberedSection = (line: string) =>
    /^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً|مقدمة|خاتمة|First|Second|Third|Fourth|Fifth|Sixth|Introduction|Conclusion)/.test(line) ||
    /^\d+[\.\-\:]\s/.test(line)

  const isSubPoint = (line: string) => /^[\-\•\*]\s/.test(line) || /^\d+[\.\-]\s/.test(line)

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Section headers (Arabic numbered sections or intro/conclusion)
    if (isNumberedSection(line) && line.length < 120) {
      // Extract label and rest
      const colonIdx = line.indexOf(':')
      const label = colonIdx > -1 ? line.slice(0, colonIdx + 1) : line
      const rest  = colonIdx > -1 ? line.slice(colonIdx + 1).trim() : ''

      nodes.push(
        <div key={key++} className="flex items-start gap-4 mt-10 mb-4 group">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 mt-0.5">
            <Leaf size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl md:text-2xl font-black text-gray-800 leading-snug ${isRtl ? 'text-right' : 'text-left'}`}>
              {label}
            </h2>
            {rest && <p className={`mt-2 text-gray-600 font-medium leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>{rest}</p>}
          </div>
        </div>
      )
      i++
      continue
    }

    // Numbered list items like "1. ..." or "1- ..."
    if (/^\d+[\.\-]\s/.test(line)) {
      const num = line.match(/^(\d+)/)?.[1] ?? ''
      const content = line.replace(/^\d+[\.\-]\s/, '')
      nodes.push(
        <div key={key++} className="flex items-start gap-4 my-3 bg-emerald-50/60 rounded-2xl px-5 py-3.5 border border-emerald-100">
          <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow">
            {num}
          </span>
          <p className={`text-gray-700 font-semibold leading-relaxed flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{content}</p>
        </div>
      )
      i++
      continue
    }

    // Bullet sub-points
    if (isSubPoint(line)) {
      const content = line.replace(/^[\-\•\*]\s/, '')
      nodes.push(
        <div key={key++} className={`flex items-start gap-3 my-2 ${isRtl ? 'pr-6' : 'pl-6'}`}>
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-2" />
          <p className={`text-gray-600 font-medium leading-relaxed flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{content}</p>
        </div>
      )
      i++
      continue
    }

    // Short emphasis lines (likely subheadings inside a section)
    if (line.length < 80 && line.endsWith(':')) {
      nodes.push(
        <h3 key={key++} className={`mt-6 mb-2 text-base font-black text-emerald-700 ${isRtl ? 'text-right' : 'text-left'}`}>
          {line}
        </h3>
      )
      i++
      continue
    }

    // Regular paragraph
    nodes.push(
      <p key={key++} className={`text-gray-700 leading-loose font-medium my-4 text-[15px] md:text-base ${isRtl ? 'text-right' : 'text-left'}`}>
        {line}
      </p>
    )
    i++
  }

  return nodes
}

// ─────────────────────────────────────────────
export default function ArticleDetailClient({ post, params }: { post: any, params: any }) {
  const { t, language, dir, translate } = useLanguage()
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])

  const formattedPost = React.useMemo(() => {
    if (!post) return null
    return {
      ...post,
      title:   language === 'en' ? (post.titleEn   || post.title)   : post.title,
      content: language === 'en' ? (post.contentEn || post.content) : post.content,
      excerpt: language === 'en'
        ? (post.contentEn ? post.contentEn.substring(0, 160) + '…' : post.content ? post.content.substring(0, 160) + '…' : '')
        : (post.content   ? post.content.substring(0, 160)   + '…' : ''),
      category: language === 'ar' ? 'نصيحة طبية' : 'Health Tip',
      readTime: (() => {
        const words = (post.content || '').split(' ').length
        const mins  = Math.max(1, Math.round(words / 200))
        return language === 'ar' ? `${mins} دقيقة قراءة` : `${mins} min read`
      })(),
      date: new Date(post.rawDate || post.createdAt).toLocaleDateString(
        language === 'ar' ? 'ar-EG' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      ),
    }
  }, [post, language])

  useEffect(() => {
    if (post) document.title = `${translate(post.title)} | The VitaHub`
    else       document.title = language === 'ar' ? 'المقال غير موجود | The VitaHub' : 'Article Not Found | The VitaHub'
  }, [language, translate, post])

  useEffect(() => {
    async function fetchRecommendations() {
      if (!post) return;
      try {
        const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || ''
        const res = await fetch(`${BACKEND_API}/api/products`)
        if (!res.ok) return
        const allProducts = await res.json()
        
        // Simple scoring based on matching words
        const articleText = (post.title + ' ' + post.content + ' ' + (post.titleEn||'') + ' ' + (post.contentEn||'')).toLowerCase()
        
        const scored = allProducts.map((p: any) => {
          let score = 0
          const targetText = (p.title + ' ' + (p.titleEn||'') + ' ' + (p.seoKeywords||'') + ' ' + (p.seoKeywordsEn||'') + ' ' + (p.category?.name||'')).toLowerCase()
          
          const targetWords = targetText.split(/[\s,،-]+/).filter(w => w.length > 3)
          targetWords.forEach(w => {
            if (articleText.includes(w)) score += 1
          })
          
          // Add random tiny score to break ties so it's not always the same if score is 0
          return { ...p, recScore: score + Math.random() * 0.1 }
        })
        
        // Sort by score, keep top 3
        scored.sort((a: any, b: any) => b.recScore - a.recScore)
        setRecommendedProducts(scored.slice(0, 3))
      } catch (err) {
        console.error("Failed to fetch recommended products", err)
      }
    }
    fetchRecommendations()
  }, [post])

  if (!post || !formattedPost) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7fbf9] p-4 text-center" dir={dir}>
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={28} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-3">
          {language === 'ar' ? 'المقال غير موجود' : 'Article not found'}
        </h1>
        <p className="text-gray-400 font-medium mb-6">
          {language === 'ar' ? 'ربما تم حذف هذا المقال أو تغيير رابطه.' : 'This article may have been removed or its link changed.'}
        </p>
        <Link href="/health-tips" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-emerald-600 transition-all">
          <ChevronRight size={16} className={language === 'en' ? 'rotate-180' : ''} />
          {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
        </Link>
      </main>
    )
  }

  const isRtl     = language === 'ar'
  const contentNodes = formatArticleContent(formattedPost.content, isRtl)

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-gradient-to-b from-emerald-50/40 via-white to-white" dir={dir}>

      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '52vh' }}>
        {/* Background image with overlay */}
        {formattedPost.image
          ? <Image src={formattedPost.image} alt={translate(formattedPost.title)} fill priority className="absolute inset-0 w-full h-full object-cover" sizes="100vw" />
          : <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 flex flex-col justify-end h-full pb-10 pt-24">
          {/* Back + badge */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/health-tips" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all">
              <ChevronRight size={14} className={language === 'en' ? 'rotate-180' : ''} />
              {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
            </Link>
            <span className="text-[10px] font-black bg-emerald-400 text-white px-3 py-1.5 rounded-full uppercase tracking-wider">
              {formattedPost.category}
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 max-w-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
            {translate(formattedPost.title)}
          </h1>

          {/* Meta row */}
          <div className={`flex flex-wrap items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
            <span className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
              <Calendar size={13} className="text-emerald-300" />
              {formattedPost.date}
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
              <Clock size={13} className="text-emerald-300" />
              {formattedPost.readTime}
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
              <Star size={13} className="text-yellow-300" fill="currentColor" />
              4.9
            </span>
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Lead / excerpt card */}
          <div className={`relative bg-gradient-to-r ${isRtl ? 'from-emerald-50 to-teal-50 border-r-4' : 'from-teal-50 to-emerald-50 border-l-4'} border-emerald-400 rounded-3xl px-6 md:px-10 py-6 mb-8 shadow-sm`}>
            <div className={`absolute top-5 ${isRtl ? 'right-5' : 'left-5'} text-emerald-200 select-none text-7xl font-serif leading-none`}>&ldquo;</div>
            <p className={`relative text-gray-700 text-lg md:text-xl font-semibold leading-relaxed italic ${isRtl ? 'text-right pr-6' : 'text-left pl-6'}`}>
              {translate(formattedPost.excerpt)}
            </p>
          </div>

          {/* Main content card */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-emerald-100/60 border border-emerald-50 px-6 md:px-14 py-10 md:py-14 mb-12">

            {/* Formatted content */}
            <article className="article-body">
              {contentNodes.length > 0
                ? contentNodes
                : <p className={`text-gray-700 leading-loose font-medium ${isRtl ? 'text-right' : 'text-left'}`}>{translate(formattedPost.content)}</p>
              }
            </article>

            {/* Divider + Share / Rating */}
            <div className="mt-14 pt-8 border-t border-emerald-50">
              <div className={`flex flex-wrap items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-3">
                  <ShareButton title={translate(formattedPost.title)} />
                  <button className="flex items-center gap-2 text-gray-300 hover:text-rose-400 transition-all">
                    <Heart size={22} />
                  </button>
                </div>
                <div className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={16} className="text-yellow-400" fill="currentColor" />
                  ))}
                  <span className={`text-gray-400 text-xs font-bold ${isRtl ? 'ml-2' : 'mr-2'}`}>
                    {language === 'ar' ? '(4.9 تقييم)' : '(4.9 rating)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* ── Recommended Products ── */}
          {recommendedProducts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800">
                  {language === 'ar' ? 'منتجات مقترحة لك' : 'Recommended for you'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          )}

          {/* Back link bottom */}
          <div className="text-center">
            <Link href="/health-tips" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-sm">
              <ChevronRight size={16} className={language === 'en' ? 'rotate-180' : ''} />
              {language === 'ar' ? 'استكشف المزيد من المقالات الصحية' : 'Explore more health articles'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
