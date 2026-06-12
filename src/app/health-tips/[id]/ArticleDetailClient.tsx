"use client"

import React, { useEffect } from 'react'
import { Calendar, Clock, ChevronRight, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'
import ShareButton from './ShareButton'
import { useLanguage } from '@/context/LanguageContext'

export default function ArticleDetailClient({ post, params }: { post: any, params: any }) {
  const { t, language, dir, translate } = useLanguage()

  const formattedPost = React.useMemo(() => {
    if (!post) return null
    return {
      ...post,
      title: language === 'en' ? (post.titleEn || post.title) : post.title,
      content: language === 'en' ? (post.contentEn || post.content) : post.content,
      excerpt: language === 'en' 
        ? (post.contentEn ? post.contentEn.substring(0, 120) + '...' : post.content ? post.content.substring(0, 120) + '...' : '') 
        : (post.content ? post.content.substring(0, 120) + '...' : ''),
      category: language === 'ar' ? 'نصيحة طبية' : 'Health Tip',
      readTime: language === 'ar' ? '3 دقائق' : '3 mins',
      date: new Date(post.rawDate || post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }
  }, [post, language])

  useEffect(() => {
    if (post) {
      document.title = `${translate(post.title)} | Vitamins HUB`
    } else {
      document.title = language === 'ar' ? 'المقال غير موجود | Vitamins HUB' : 'Article Not Found | Vitamins HUB'
    }
  }, [language, translate, post])

  if (!post || !formattedPost) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7fbf9] p-4 text-center" dir={dir}>
        <h1 className="text-2xl font-black text-gray-800 mb-4">
          {language === 'ar' ? 'المقال غير موجود' : 'Article not found'}
        </h1>
        <Link href="/health-tips" className="text-primary font-bold flex items-center gap-2">
          <ChevronRight size={20} className={language === 'en' ? 'rotate-180' : ''} /> 
          {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
        </Link>
      </main>
    )
  }

  const isRtl = language === 'ar'

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-[#f7fbf9]" dir={dir}>
      {/* Hero Image Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <img src={formattedPost.image} alt={translate(formattedPost.title)} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7fbf9] via-transparent to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 max-w-screen-xl mx-auto">
          <Link href="/health-tips" className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-white px-4 py-2 rounded-full shadow-sm mb-6 hover:bg-primary hover:text-white transition-all">
            <ChevronRight size={14} className={language === 'en' ? 'rotate-180' : ''} /> {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </Link>
          <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4">{formattedPost.category}</div>
          <h1 className="text-2xl md:text-5xl font-black text-gray-800 leading-tight mb-6">{translate(formattedPost.title)}</h1>
          <div className="flex items-center gap-6 text-xs text-gray-500 font-bold">
            <span className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl"><Clock size={14} className="text-primary" /> {formattedPost.readTime}</span>
            <span className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl"><Calendar size={14} className="text-primary" /> {formattedPost.date}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[40px] p-6 md:p-12 shadow-xl shadow-primary/5 border border-[#e8f0ed]">
            <p className={`text-lg md:text-xl text-gray-600 font-medium leading-relaxed mb-10 border-primary/30 italic ${
              language === 'ar' ? 'border-r-4 pr-6' : 'border-l-4 pl-6'
            }`}>
              {translate(formattedPost.excerpt)}
            </p>
            <div className={`prose prose-lg max-w-none text-gray-700 leading-loose whitespace-pre-line font-medium ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {translate(formattedPost.content)}
            </div>

            {/* Interaction Footer */}
            <div className="mt-12 pt-12 border-t border-[#e8f0ed] flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <ShareButton title={translate(formattedPost.title)} />
                <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all">
                  <MessageCircle size={22} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <span className="text-gray-400 text-xs font-bold mr-2">
                  {language === 'ar' ? '(4.9 تقييم)' : '(4.9 rating)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
