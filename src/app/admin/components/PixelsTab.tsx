"use client"

import React, { useEffect, useState } from 'react'
import { Eye, Loader2, Search, RotateCcw, Clock, ChevronLeft, ChevronRight, Activity, TrendingUp, ShoppingCart, User, Package } from 'lucide-react'

interface PixelsTabProps {
  BACKEND_API: string
  fetchWithAdminAuth: (url: string, init?: RequestInit) => Promise<Response>
}

export default function PixelsTab({ BACKEND_API, fetchWithAdminAuth }: PixelsTabProps) {
  const [stats, setStats] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  const limit = 20

  const getStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/pixel-stats`)
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (err) {
      console.error('Error fetching pixel stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const getEvents = async (currentPage = page, search = searchQuery) => {
    setEventsLoading(true)
    try {
      const offset = (currentPage - 1) * limit
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/pixel-events?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const json = await res.json()
        setEvents(json.events || [])
        setTotalEvents(json.total || 0)
      }
    } catch (err) {
      console.error('Error fetching pixel events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    getStats()
  }, [])

  useEffect(() => {
    getEvents(page, searchQuery)
  }, [page, searchQuery])

  const handleRefresh = () => {
    getStats()
    getEvents(1, searchQuery)
    setPage(1)
  }

  const totalPages = Math.ceil(totalEvents / limit)

  // Color mappings for event names
  const getEventBadge = (name: string) => {
    switch (name) {
      case 'PageView':
        return 'bg-blue-50 text-blue-600 border border-blue-200'
      case 'ViewContent':
        return 'bg-purple-50 text-purple-600 border border-purple-200'
      case 'AddToCart':
        return 'bg-amber-50 text-amber-600 border border-amber-200'
      case 'AddToWishlist':
        return 'bg-pink-50 text-pink-600 border border-pink-200'
      case 'InitiateCheckout':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-200'
      case 'Purchase':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200'
    }
  }

  const getEventLabel = (name: string) => {
    switch (name) {
      case 'PageView': return 'زيارة صفحة'
      case 'ViewContent': return 'مشاهدة منتج'
      case 'AddToCart': return 'إضافة للسلة'
      case 'AddToWishlist': return 'إضافة للمفضلة'
      case 'InitiateCheckout': return 'بدء الدفع'
      case 'Purchase': return 'شراء ناجح 💰'
      default: return name
    }
  }

  const getEventCount = (name: string) => {
    if (!stats || !stats.eventCounts) return 0
    const found = stats.eventCounts.find((e: any) => e.eventName === name)
    return found ? found.count : 0
  }

  // Parse user agent to get a simple browser/OS string
  const parseUA = (ua: string) => {
    if (!ua) return 'غير معروف'
    let browser = 'متصفح غير معروف'
    let os = 'نظام غير معروف'

    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('Macintosh')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'

    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Edg')) browser = 'Edge'
    else if (ua.includes('FBAN') || ua.includes('FBAV')) browser = 'Facebook App'
    else if (ua.includes('Instagram')) browser = 'Instagram App'

    return `${browser} (${os})`
  }

  return (
    <div className="space-y-6">
      {/* Upper Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'PageView', label: 'زيارات الصفحات', color: 'border-blue-100 bg-blue-50/20 text-blue-600', icon: <Eye size={18} /> },
          { key: 'ViewContent', label: 'مشاهدات المنتجات', color: 'border-purple-100 bg-purple-50/20 text-purple-600', icon: <Package size={18} /> },
          { key: 'AddToCart', label: 'إضافات للسلة', color: 'border-amber-100 bg-amber-50/20 text-amber-600', icon: <ShoppingCart size={18} /> },
          { key: 'InitiateCheckout', label: 'بدء الدفع', color: 'border-indigo-100 bg-indigo-50/20 text-indigo-600', icon: <Activity size={18} /> },
          { key: 'Purchase', label: 'عمليات الشراء', color: 'border-emerald-100 bg-emerald-50/20 text-emerald-600', icon: <TrendingUp size={18} /> },
          { key: 'UniqueVisitors', label: 'زوار فريدين (IP)', color: 'border-slate-100 bg-slate-50/20 text-slate-700', icon: <User size={18} />, value: stats?.uniqueVisitors || 0 }
        ].map((item, index) => {
          const val = item.value !== undefined ? item.value : getEventCount(item.key)
          return (
            <div key={index} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-[100px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">{item.label}</span>
                <div className={`p-1.5 rounded-xl border ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              {statsLoading ? (
                <div className="h-6 w-12 bg-slate-100 animate-pulse rounded-md" />
              ) : (
                <span className="text-xl font-black text-slate-800 leading-none">{val.toLocaleString('ar-EG')}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Chart Panel */}
      {stats && stats.chartData && stats.chartData.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black text-slate-800">نشاط العملاء في آخر 30 يوم</h3>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">عدد الحركات والزيارات اليومية المسجلة</p>
            </div>
            <button onClick={handleRefresh} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100 bg-white cursor-pointer">
              <RotateCcw size={14} className={statsLoading || eventsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="h-[200px] w-full flex items-end justify-between gap-1 pt-4 border-b border-slate-100 px-2">
            {stats.chartData.slice(-15).map((day: any, idx: number) => {
              const maxVal = Math.max(...stats.chartData.map((d: any) => d.total), 1)
              const heightPct = (day.total / maxVal) * 100
              const formattedDate = new Date(day.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-[calc(100%-10px)] bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-md">
                    <div className="font-black text-emerald-400">{formattedDate}</div>
                    <div>إجمالي الأحداث: {day.total}</div>
                    <div className="text-blue-300 font-bold">صفحات: {day.PageView || 0}</div>
                    <div className="text-purple-300 font-bold">مشاهدة منتج: {day.ViewContent || 0}</div>
                    <div className="text-amber-300 font-bold">سلة: {day.AddToCart || 0}</div>
                    <div className="text-emerald-300 font-bold">شراء: {day.Purchase || 0}</div>
                  </div>

                  {/* Multi-layered bar stack */}
                  <div className="w-full max-w-[24px] bg-slate-50 hover:bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end transition-all cursor-pointer h-full border border-transparent hover:border-slate-200">
                    <div style={{ height: `${heightPct}%` }} className="w-full flex flex-col justify-end">
                      {/* PageViews (blue) */}
                      <div style={{ height: `${day.total ? ((day.PageView || 0) / day.total) * 100 : 0}%` }} className="bg-blue-500 w-full" />
                      {/* ViewContents (purple) */}
                      <div style={{ height: `${day.total ? ((day.ViewContent || 0) / day.total) * 100 : 0}%` }} className="bg-purple-500 w-full" />
                      {/* AddToCarts (amber) */}
                      <div style={{ height: `${day.total ? ((day.AddToCart || 0) / day.total) * 100 : 0}%` }} className="bg-amber-500 w-full" />
                      {/* Purchases (emerald) */}
                      <div style={{ height: `${day.total ? ((day.Purchase || 0) / day.total) * 100 : 0}%` }} className="bg-emerald-500 w-full" />
                    </div>
                  </div>
                  <span className="text-[7px] font-bold text-slate-400 mt-2 truncate max-w-[40px] text-center">{day.date.substring(8, 10)}</span>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-4 text-[9px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>زيارة صفحة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-purple-500" />
              <span>مشاهدة منتج</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>إضافة للسلة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>شراء ناجح</span>
            </div>
          </div>
        </div>
      )}

      {/* Main List Panel */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Sub-header actions bar */}
        <div className="p-4 md:p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-100 flex items-center gap-2 shadow-sm w-full md:min-w-[280px]">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث بالـ IP، الحدث أو محتوى البيانات..." 
                className="bg-transparent text-xs font-bold w-full outline-none text-slate-600 font-sans" 
                value={searchQuery} 
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }} 
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all bg-white border border-slate-100 shadow-sm cursor-pointer">
              <RotateCcw size={16} className={eventsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[750px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase border-b border-slate-100 tracking-wider">
              <tr>
                <th className="px-6 md:px-8 py-5">نوع الحدث</th>
                <th className="px-6 md:px-8 py-5">الصفحة / الرابط</th>
                <th className="px-6 md:px-8 py-5">العميل (IP والجهاز)</th>
                <th className="px-6 md:px-8 py-5">الوقت</th>
                <th className="px-6 md:px-8 py-5 text-center">البيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {eventsLoading && events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-emerald-600" size={32} />
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-xs">
                    لا توجد أحداث مسجلة حالياً
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 md:px-8 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-block ${getEventBadge(event.eventName)}`}>
                        {getEventLabel(event.eventName)}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 max-w-[200px] truncate">
                      <span className="text-[11px] text-slate-600 font-medium dir-ltr block text-right select-all">
                        {event.url ? (event.url.replace(/^https?:\/\/[^/]+/, '') || '/') : '/'}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-slate-700 block select-all font-sans">{event.customerIp || '0.0.0.0'}</span>
                        <span className="text-[9px] text-slate-400 font-bold block truncate max-w-[180px]" title={event.userAgent}>
                          {parseUA(event.userAgent)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-4">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <Clock size={12} />
                        <span className="font-sans">{new Date(event.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-slate-200">•</span>
                        <span className="font-sans">{new Date(event.createdAt).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-4 text-center">
                      {event.metadata ? (
                        <button 
                          onClick={() => setSelectedEvent(event)} 
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-black"
                        >
                          <Eye size={14} />
                          <span>عرض البيانات</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">لا يوجد بيانات</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 md:p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <span className="text-[10px] text-slate-400 font-bold">
              عرض الصفحة {page} من أصل {totalPages} (إجمالي {totalEvents} حدث)
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="p-2 border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="p-2 border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Dialog Overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-xs font-black text-slate-800">بيانات الحدث #{selectedEvent.id.substring(0, 8)}</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${getEventBadge(selectedEvent.eventName)}`}>
                  {getEventLabel(selectedEvent.eventName)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Metadata Detail Section */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                try {
                  const meta = JSON.parse(selectedEvent.metadata)
                  if (!meta || typeof meta !== 'object') return <pre className="text-[10px] bg-slate-50 p-4 rounded-2xl text-left dir-ltr whitespace-pre-wrap">{selectedEvent.metadata}</pre>

                  // Format beautifully if it's a product, order or cart
                  if (selectedEvent.eventName === 'ViewContent' || selectedEvent.eventName === 'AddToCart' || selectedEvent.eventName === 'AddToWishlist') {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {meta.image && (
                            <img src={meta.image} className="w-12 h-12 rounded-xl object-cover border bg-white" alt="product" />
                          )}
                          <div>
                            <span className="text-xs font-black text-slate-800 block">{meta.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">المعرف: {meta.id}</span>
                            <span className="text-xs font-black text-emerald-600 block mt-1 font-sans">{meta.price} ج.م</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (selectedEvent.eventName === 'InitiateCheckout') {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-indigo-50/30 border border-indigo-100 p-4 rounded-2xl">
                          <span className="text-xs font-black text-slate-700">إجمالي قيمة السلة:</span>
                          <span className="text-sm font-black text-indigo-600 font-sans">{meta.total} ج.م</span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">المنتجات في السلة:</h4>
                        <div className="space-y-2">
                          {(meta.cart || []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                              <span className="font-black text-slate-700 truncate max-w-[200px]">{item.title}</span>
                              <span className="text-slate-500 font-bold font-sans">الكمية: {item.quantity} × {item.price} ج.م</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (selectedEvent.eventName === 'Purchase') {
                    return (
                      <div className="space-y-4">
                        <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-700">رقم الطلب:</span>
                            <span className="font-black text-emerald-600 font-sans">#{meta.orderNumber}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-700">القيمة الإجمالية:</span>
                            <span className="font-black text-emerald-600 font-sans">{meta.total} ج.م</span>
                          </div>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">المنتجات المشتراة:</h4>
                        <div className="space-y-2">
                          {(meta.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                              <span className="font-black text-slate-700 truncate max-w-[200px]">{item.title}</span>
                              <span className="text-slate-500 font-bold font-sans">{item.quantity} × {item.price} ج.م</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  // Default formatted JSON viewer
                  return (
                    <pre className="text-[10px] bg-slate-50 p-4 rounded-2xl text-left dir-ltr whitespace-pre-wrap max-h-[220px] overflow-y-auto border border-slate-100 text-slate-650 font-sans">
                      {JSON.stringify(meta, null, 2)}
                    </pre>
                  )
                } catch {
                  return <pre className="text-[10px] bg-slate-50 p-4 rounded-2xl text-left dir-ltr whitespace-pre-wrap font-sans">{selectedEvent.metadata}</pre>
                }
              })()}
            </div>

            {/* Bottom details card */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-400">عنوان الرابط الكامل:</span>
                <span className="font-medium text-slate-650 truncate max-w-[220px] dir-ltr inline-block select-all font-sans" title={selectedEvent.url}>{selectedEvent.url || '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-400">جهاز العميل:</span>
                <span className="font-medium text-slate-650 truncate max-w-[220px] dir-ltr inline-block select-all font-sans" title={selectedEvent.userAgent}>{selectedEvent.userAgent || '---'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
