"use client"

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar, Clock, ChevronLeft, Star, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function HealthTipsPage() {
  const { t, dir, language, translate } = useLanguage()
  const [posts, setPosts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredPosts = React.useMemo(() => {
    if (!searchQuery.trim()) return posts
    const q = searchQuery.trim().toLowerCase()
    return posts.filter(p => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q))
  }, [posts, searchQuery])

  React.useEffect(() => {
    const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'https://ahmed-api.red-gate.tech'
    fetch(BACKEND_API + '/api/medical-tips')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((tip: any) => ({
          id: tip.id,
          title: language === 'en' ? (tip.titleEn || tip.title) : tip.title,
          image: tip.image || 'https://placehold.co/800x400/e8f0ed/2e7d5e?text=Health+Tip',
          category: language === 'ar' ? 'نصيحة طبية' : 'Health Tip',
          readTime: language === 'ar' ? '3 دقائق' : '3 mins',
          date: new Date(tip.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          excerpt: language === 'en' 
            ? (tip.contentEn ? tip.contentEn.substring(0, 120) + '...' : tip.content ? tip.content.substring(0, 120) + '...' : '') 
            : (tip.content ? tip.content.substring(0, 120) + '...' : '')
        }))
        setPosts(formatted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading articles:', err)
        setLoading(false)
      })
  }, [language])

  const isRtl = language === 'ar'

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0" style={{ background: '#f7fbf9' }}>
        
        {/* Page Header */}
        <section className="bg-white py-12 border-b" style={{ borderColor: '#e8f0ed' }}>
          <div className="max-w-screen-xl mx-auto px-4 text-center">
             <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px w-16 bg-gray-300" />
                <span style={{ color: '#2e7d5e' }}>◆</span>
                <h1 className="text-3xl font-black text-gray-800">{t('tips_badge')}</h1>
                <span style={{ color: '#2e7d5e' }}>◆</span>
                <div className="h-px w-16 bg-gray-300" />
              </div>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نصائح صحية، معلومات عن المنتجات، وكل ما يهم صحتك ونشاطك البدني من خبراء Vitamins HUB' 
                : 'Health tips, product information, and everything about your health and physical fitness from Vitamins HUB experts'}
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-12">
          <div className="max-w-screen-xl mx-auto px-4" dir={dir}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Articles Grid (8 cols) */}
              <div className="lg:col-span-8">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredPosts.length === 0 ? (
                      <div className="col-span-full py-10 text-center text-gray-500 font-bold">
                        {language === 'ar' ? 'لا توجد نتائج مطابقة للبحث.' : 'No matching results found.'}
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#e8f0ed] group hover:shadow-xl transition-all duration-500">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={post.image} alt={translate(post.title)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className={`absolute top-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full ${isRtl ? 'right-4' : 'left-4'}`}>{post.category}</div>
                        </div>
                        <div className={`p-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-4 text-[10px] text-gray-400 font-bold mb-4 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                          </div>
                          <h3 className="text-lg font-black text-gray-800 mb-3 group-hover:text-primary transition-colors leading-tight">
                            {translate(post.title)}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                            {translate(post.excerpt)}
                          </p>
                          <Link href={`/health-tips/${post.id}`} className={`inline-flex items-center gap-2 text-primary text-xs font-black group/link ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span>{language === 'ar' ? 'اقرأ المزيد' : 'Read More'}</span>
                            <ChevronLeft size={16} className={`transition-transform ${isRtl ? 'group-hover/link:-translate-x-1' : 'group-hover/link:translate-x-1 rotate-180'}`} />
                          </Link>
                        </div>
                      </article>
                    )))}
                  </div>
                )}
              </div>

              {/* Sidebar (4 cols) */}
              <aside className="lg:col-span-4 space-y-8">
                {/* Search */}
                <div className="bg-white p-6 rounded-3xl border border-[#e8f0ed]">
                  <h4 className={`text-sm font-black text-gray-800 mb-4 border-primary ${isRtl ? 'border-r-4 pr-3 text-right' : 'border-l-4 pl-3 text-left'}`}>
                    {language === 'ar' ? 'ابحث في المدونة' : 'Search the Blog'}
                  </h4>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('tips_search')} 
                      className={`w-full bg-[#f0f7f4] border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all ${isRtl ? 'text-right' : 'text-left'}`} 
                    />
                  </div>
                </div>

                {/* Popular Posts */}
                <div className="bg-white p-6 rounded-3xl border border-[#e8f0ed]">
                  <h4 className={`text-sm font-black text-gray-800 mb-6 border-primary ${isRtl ? 'border-r-4 pr-3 text-right' : 'border-l-4 pl-3 text-left'}`}>
                    {language === 'ar' ? 'المقالات الشائعة' : 'Popular Articles'}
                  </h4>
                  <div className="space-y-6">
                    {posts.slice(0, 3).map((post, i) => (
                      <div key={i} className={`flex gap-4 group cursor-pointer ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={translate(post.title)} />
                        </div>
                        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <h5 className="text-xs font-black text-gray-800 group-hover:text-primary transition-colors line-clamp-2">{translate(post.title)}</h5>
                          <span className="text-[10px] text-gray-400 font-bold mt-2 block">{post.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
