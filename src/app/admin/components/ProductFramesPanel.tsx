'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'

type ReviewEntry = { productId: string; title: string; slot: number; message: string }
type ReviewPage = { page: number; pages: number; recorded: number; total: number; entries: ReviewEntry[] }

type FrameJob = {
  status: 'idle' | 'running' | 'ready' | 'interrupted' | 'retry' | 'complete'
  revision: string | null
  limit: number
  attempted?: number
  merged?: number
  totalMerged?: number
  deleted?: number
  passAttempted?: number
  passFailed?: number
  failures?: ReviewEntry[]
  error?: string
}

const buttonLabels: Record<FrameJob['status'], string> = {
  idle: 'ابدأ أول دفعة',
  running: 'جاري دمج الصور',
  ready: 'كمّل الدفعة التالية',
  interrupted: 'استكمل الدفعة المتوقفة',
  retry: 'أعد محاولة الصور المتبقية',
  complete: 'افحص الصور الجديدة',
}

async function readJob(response: Response): Promise<FrameJob> {
  const result = await response.json().catch(() => null)
  if (!response.ok || !result || !Object.hasOwn(buttonLabels, result.status)) {
    throw new Error(result?.error || 'تعذر جلب حالة دمج الصور.')
  }
  return result
}

type Props = {
  endpoint: string
  request: (url: string, init?: RequestInit) => Promise<Response>
  blocked: boolean
}

export default function ProductFramesPanel({ endpoint, request, blocked }: Props) {
  const requestRef = useRef(request)
  const starting = useRef(false)
  const [job, setJob] = useState<FrameJob | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [reviewPage, setReviewPage] = useState(0)
  const [review, setReview] = useState<ReviewPage | null>(null)
  const [reviewError, setReviewError] = useState('')
  const running = job?.status === 'running'
  const needsStatus = !job || running

  useEffect(() => {
    requestRef.current = request
  }, [request])

  useEffect(() => {
    if (!needsStatus) return
    let timer: ReturnType<typeof setTimeout>
    const controller = new AbortController()
    const poll = async () => {
      try {
        const current = await readJob(await requestRef.current(endpoint, { cache: 'no-store', signal: controller.signal }))
        if (controller.signal.aborted) return
        setJob(current)
        setError('')
        if (current.status === 'running') timer = setTimeout(poll, 2000)
      } catch {
        if (controller.signal.aborted) return
        setError('تعذر قراءة التقدّم. جاري إعادة الاتصال.')
        timer = setTimeout(poll, 5000)
      }
    }
    // Defer the first poll of a running batch so it does not duplicate the POST response.
    timer = setTimeout(poll, running ? 2000 : 0)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [endpoint, needsStatus, refresh, running])

  useEffect(() => {
    if (!reviewPage || !job?.passFailed) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await requestRef.current(`${endpoint}?reviewPage=${reviewPage}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok || !Array.isArray(data.entries)) throw new Error()
        if (controller.signal.aborted) return
        setReview(data)
        setReviewError('')
      } catch {
        if (!controller.signal.aborted) setReviewError('تعذر تحميل قائمة المراجعة كاملة.')
      }
    }, 0)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [endpoint, reviewPage, job?.revision, job?.passFailed, job?.status])

  async function start(all: boolean) {
    if (!job || running || starting.current || blocked) return
    starting.current = true
    setBusy(true)
    setError('')
    try {
      const response = await request(endpoint, { method: 'POST', body: JSON.stringify({ revision: job.revision, all }) })
      setJob(await readJob(response))
      setReview(null)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'تعذر بدء الدفعة.')
      // The server may have received the request before the connection dropped.
      setJob(null)
      setRefresh(value => value + 1)
    } finally {
      starting.current = false
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-[2.5rem] border border-slate-100 bg-white p-6 text-right shadow-sm md:p-10" dir="rtl">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><ImagePlus size={22} /></span>
        <h3 className="text-lg font-black text-slate-800">دمج صور المنتجات بالفريم</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        تقدر تعالج كل الصور الرئيسية وصور المعارض تلقائيًا على دفعات من ٥٠ صورة. الصورة الحالية تفضل مرتبطة بالمنتج لحد ما البديل يتجهّز ويتحفظ.
      </p>
      {job && job.status !== 'idle' && (
        <div aria-live="polite" className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {running && <progress className="w-full accent-emerald-600" value={job.attempted || 0} max={job.limit} aria-label="تقدّم دفعة الصور" />}
          <p>تمت محاولة {job.attempted || 0} صورة في الدفعة ونجح دمج {job.merged || 0} منها.</p>
          {job.passAttempted !== undefined && <p>عدد الصور اللي اتعالجت أو اتراجعت في الجولة الحالية {job.passAttempted}.</p>}
          <p>إجمالي الصور المدمجة {job.totalMerged || 0}. الملفات الأصلية المحذوفة {job.deleted || 0}.</p>
          {job.status === 'complete' && <p className="font-bold text-emerald-700">اكتمل دمج الصور المتاحة.</p>}
          {(job.error || job.status === 'interrupted') && <p className="text-amber-800">{job.error || 'الدفعة متوقفة عند آخر صورة محفوظة.'}</p>}
          {Boolean(job.passFailed) && (
            <details className="text-amber-900" onToggle={event => setReviewPage(event.currentTarget.open ? 1 : 0)}>
              <summary className="cursor-pointer font-bold">صور تحتاج مراجعة في الجولة الحالية ({job.passFailed})</summary>
              {reviewError && <p className="mt-2">{reviewError}</p>}
              {review && review.recorded < review.total && (
                <p className="mt-2">الجولة القديمة حفظت {review.recorded} حالة بالتفصيل. شغّل فحص الكل لإعادة تسجيل الحالات المتبقية.</p>
              )}
              <ul className="mt-2 max-h-48 list-inside list-disc space-y-1 overflow-auto">
                {(review?.entries || job.failures)?.map(failure => (
                  <li key={`${failure.productId}-${failure.slot}`}>
                    {failure.title}، {failure.slot === 0 ? 'الصورة الرئيسية' : `صورة المعرض ${failure.slot}`}. {failure.message}
                  </li>
                ))}
              </ul>
              {review && review.pages > 1 && (
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" disabled={review.page <= 1} onClick={() => setReviewPage(review.page - 1)} className="underline disabled:opacity-40">السابق</button>
                  <span>{review.page} من {review.pages}</span>
                  <button type="button" disabled={review.page >= review.pages} onClick={() => setReviewPage(review.page + 1)} className="underline disabled:opacity-40">التالي</button>
                </div>
              )}
            </details>
          )}
        </div>
      )}
      {error && <p role="status" className="text-sm text-amber-800">{error}</p>}
      <button
        type="button"
        onClick={() => start(true)}
        disabled={!job || running || busy || blocked}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 p-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-default disabled:opacity-60"
      >
        {(running || busy) && <Loader2 className="animate-spin" size={16} />}
        {job ? running ? buttonLabels.running : job.status === 'retry' ? 'افحص كل الصور وأعد محاولة المتبقي' : 'شغّل كل الدفعات تلقائيًا' : 'جاري تحميل حالة الصور'}
      </button>
      {job && !running && (
        <button
          type="button"
          onClick={() => start(false)}
          disabled={busy || blocked}
          className="w-full rounded-xl border border-emerald-200 p-3 text-sm font-bold text-emerald-700 disabled:opacity-60"
        >
          {buttonLabels[job.status]} (دفعة واحدة)
        </button>
      )}
    </section>
  )
}
