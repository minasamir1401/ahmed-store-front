"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import { Calendar, Clock, ChevronRight, Share2, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [post, setPost] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    import('@/data/articles.json').then(data => {
      const articles = (data.default || data).map((item: any, index: number) => ({
        ...item,
        id: item.id || `article-${index}`
      }))
      
      const found = articles.find((a: any) => a.id === id)
      setPost(found)
      setLoading(false)
    }).catch(err => {
      console.error('Error loading article:', err)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7fbf9] p-4 text-center">
        <h1 className="text-2xl font-black text-gray-800 mb-4">المقال غير موجود</h1>
        <Link href="/health-tips" className="text-primary font-bold flex items-center gap-2">
          <ChevronRight size={20} /> العودة للمدونة
        </Link>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0 bg-[#f7fbf9]" dir="rtl">
        {/* Hero Image Section */}
        <div className="relative h-[40vh] md:h-[60vh] w-full">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7fbf9] via-transparent to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 max-w-screen-xl mx-auto">
            <Link href="/health-tips" className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-white px-4 py-2 rounded-full shadow-sm mb-6 hover:bg-primary hover:text-white transition-all">
              <ChevronRight size={14} /> العودة للمدونة
            </Link>
            <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4">{post.category}</div>
            <h1 className="text-2xl md:text-5xl font-black text-gray-800 leading-tight mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-xs text-gray-500 font-bold">
              <span className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl"><Clock size={14} className="text-primary" /> {post.readTime}</span>
              <span className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl"><Calendar size={14} className="text-primary" /> {post.date}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[40px] p-6 md:p-12 shadow-xl shadow-primary/5 border border-[#e8f0ed]">
              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed mb-10 border-r-4 border-primary/30 pr-6 italic">
                {post.excerpt}
              </p>
              <div className="prose prose-lg max-w-none text-gray-700 leading-loose whitespace-pre-line font-medium">
                {post.content}
              </div>

              {/* Interaction Footer */}
              <div className="mt-12 pt-12 border-t border-[#e8f0ed] flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <button className="flex items-center gap-2 bg-[#f0f7f4] text-primary px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
                     <Share2 size={18} /> مشاركة المقال
                   </button>
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
                  <span className="text-gray-400 text-xs font-bold mr-2">(4.9 تقييم)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
