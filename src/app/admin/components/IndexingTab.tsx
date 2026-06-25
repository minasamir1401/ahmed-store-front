"use client"

import React, { useState, useEffect } from 'react'
import { Search, Loader2, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface IndexingLog {
  id: string
  url: string
  action: string
  status: string
  response?: string | null
  createdAt: string
}

interface IndexingTabProps {
  BACKEND_API: string
  fetchWithAdminAuth: (url: string, init?: any, contentType?: any) => Promise<Response>
  addLog: (msg: string) => void
}

export default function IndexingTab({ BACKEND_API, fetchWithAdminAuth, addLog }: IndexingTabProps) {
  const [urlInput, setUrlInput] = useState('')
  const [actionType, setActionType] = useState('URL_UPDATED')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [logs, setLogs] = useState<IndexingLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/indexing/logs`)
      if (res.ok) {
        const data = await res.json()
        setLogs(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch indexing logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return

    setSubmitLoading(true)
    setMessage(null)
    addLog(`جاري إرسال طلب أرشفة للرابط: ${urlInput}`)

    try {
      const res = await fetchWithAdminAuth(`${BACKEND_API}/api/admin/indexing/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim(), type: actionType })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({ text: 'تم إرسال طلب الأرشفة الفورية بنجاح وجاري معالجته من قبل جوجل! ✅', type: 'success' })
        setUrlInput('')
        fetchLogs()
      } else {
        setMessage({ text: `فشل إرسال الطلب: ${data.error || 'خطأ غير معروف'}`, type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: `حدث خطأ في الاتصال بالخادم: ${err.message}`, type: 'error' })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Description Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-[#0f172a] text-white p-8 rounded-[2rem] shadow-md border border-slate-700/30">
        <h2 className="text-lg font-black flex items-center gap-3">
          <Search size={22} className="text-emerald-400" />
          مركز الأرشفة الفورية وتحديثات Google
        </h2>
        <p className="text-xs text-slate-300 font-bold mt-2 leading-relaxed max-w-3xl">
          هذا القسم يتصل مباشرة بـ **Google Indexing API** ويسرع أرشفة وتحديث صفحات منتجاتك وموقعك لتظهر فوراً على جوجل خلال دقائق بدلاً من أيام أو أسابيع.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Form Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 lg:col-span-1 h-fit">
          <h3 className="text-xs font-black text-slate-800 border-b border-slate-50 pb-3">إرسال رابط للأرشفة اليدوية</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 block mr-1">رابط الصفحة المراد أرشفتها</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://the-vitahub.com/product/..."
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-500/20 rounded-2xl py-3 px-4 font-bold text-xs outline-none transition-all text-slate-750 dir-ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 block mr-1">نوع العملية</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-black text-xs outline-none text-slate-700 cursor-pointer"
              >
                <option value="URL_UPDATED">تحديث أو إضافة صفحة جديدة (URL_UPDATED)</option>
                <option value="URL_DELETED">إزالة صفحة محذوفة من جوجل (URL_DELETED)</option>
              </select>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs font-bold ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading || !urlInput.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all cursor-pointer"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>طلب أرشفة الآن</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Indexing Logs list */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-xs font-black text-slate-800">سجل الأرشفة (آخر 50 عملية)</h3>
            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100 shadow-sm cursor-pointer"
              title="تحديث السجلات"
            >
              <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {logsLoading && logs.length === 0 ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" size={24} /></div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-bold text-xs">لا توجد سجلات أرشفة بعد. سيتم تسجيل جميع محاولات الأرشفة التلقائية واليدوية هنا.</div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[500px] text-xs">
                <thead className="bg-slate-50/50 text-slate-400 font-black border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">الرابط</th>
                    <th className="px-4 py-3">العملية</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">التوقيت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 max-w-[220px] truncate dir-ltr text-left font-bold text-slate-600" title={log.url}>
                        {log.url}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-700">
                        {log.action === 'URL_UPDATED' ? (
                          <span className="text-blue-600">تحديث/إضافة</span>
                        ) : (
                          <span className="text-red-500">إزالة</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md font-black border ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 'bg-red-50 text-red-500 border-red-200/50'
                        }`} title={log.response || undefined}>
                          {log.status === 'success' ? 'نجح' : 'فشل'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-400 font-bold">
                        {new Date(log.createdAt).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
