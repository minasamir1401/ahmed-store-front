export type ExcelImportProgress = {
  totalRows: number
  processedCount: number
  importedCount: number
  updatedCount: number
}

type ExcelImportResult = {
  success: boolean
  message?: string
  totalRows: number
  importedCount: number
  updatedCount: number
}

type ImportRequest = (path: string, init?: RequestInit) => Promise<Response>

const interruptedMessage = 'انقطع اتصال الاستيراد قبل وصول النتيجة النهائية. قد تكون بعض المنتجات قد حُفظت؛ راجع القائمة قبل إعادة الاستيراد.'
const pendingJobMessage = 'تعذر متابعة حالة الاستيراد الآن. قد تستمر العملية على الخادم؛ استخدم زر متابعة الاستيراد بدلاً من رفع الملف مرة أخرى.'
const retryableStatuses = [408, 429, 499, 500, 502, 503, 504, 524]

export function getExcelImportFileError(file: Pick<File, 'name' | 'size'>): string | null {
  if (!/\.(xlsx|xls|xlsm|csv)$/i.test(file.name.trim())) {
    return 'صيغة الملف غير مدعومة. اختر ملف Excel بصيغة .xlsx أو .xls أو .xlsm، أو ملف .csv.'
  }
  if (file.size === 0) return 'الملف فارغ. اختر ملفاً يحتوي على بيانات المنتجات.'
  if (file.size > 200 * 1024 * 1024) {
    const size = (file.size / (1024 * 1024)).toFixed(1)
    return `حجم الملف ${size} ميجابايت ويتجاوز الحد الأقصى للرفع (200 ميجابايت).`
  }
  return null
}

export async function waitForExcelImportJob(jobId: string, request: ImportRequest, onProgress: (progress: ExcelImportProgress) => void, registrationPending = false): Promise<ExcelImportResult> {
  const deadline = Date.now() + 30 * 60 * 1000
  let failures = 0
  let lastProgress = ''
  while (Date.now() < deadline) {
    let job
    try {
      const response = await request(`/status?jobId=${encodeURIComponent(jobId)}`, { cache: 'no-store' })
      if (retryableStatuses.includes(response.status)) throw new Error(pendingJobMessage)
      if (response.status === 404 && registrationPending) throw new Error(pendingJobMessage)
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw Object.assign(new Error(data?.error || interruptedMessage), {
          isExcelImportFinished: response.status === 404,
          isAdminUnauthorized: [401, 403].includes(response.status),
        })
      }
      job = await response.json()
      if (job?.jobId !== jobId || !['running', 'completed', 'failed'].includes(job?.status)) throw new Error(pendingJobMessage)
      registrationPending = false
    } catch (error: any) {
      if (error.isExcelImportFinished || error.isAdminUnauthorized) throw error
      if (++failures >= 5) throw new Error(pendingJobMessage)
      await new Promise(resolve => setTimeout(resolve, 2000))
      continue
    }
    failures = 0
    if (job.status === 'failed') throw Object.assign(new Error(job.error || interruptedMessage), { isExcelImportFinished: true })
    if (job.status === 'completed') {
      if (job.result?.success !== true || ![job.result.totalRows, job.result.importedCount, job.result.updatedCount].every(value => Number.isInteger(value) && value >= 0)) {
        throw new Error(interruptedMessage)
      }
      return job.result
    }
    if (![job.totalRows, job.processedCount, job.importedCount, job.updatedCount].every(value => Number.isInteger(value) && value >= 0)) {
      throw new Error(pendingJobMessage)
    }
    const progress = JSON.stringify([job.totalRows, job.processedCount, job.importedCount, job.updatedCount])
    if (progress !== lastProgress) {
      onProgress(job)
      lastProgress = progress
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  throw new Error(pendingJobMessage)
}

export async function importExcelFile(file: File, jobId: string, request: ImportRequest, onProgress: (progress: ExcelImportProgress) => void, onJobId: (id: string) => void): Promise<ExcelImportResult> {
  const body = new FormData()
  body.append('file', file)
  onJobId(jobId)
  let response
  try {
    response = await request(`?async=1&jobId=${encodeURIComponent(jobId)}`, {
      method: 'POST', body, headers: { Accept: 'application/x-ndjson' },
    })
  } catch (error: any) {
    if (error.isAdminUnauthorized) throw error
    // A lost upload response does not prove the server failed to accept the job. Never re-POST.
    return waitForExcelImportJob(jobId, request, onProgress, true)
  }
  if (retryableStatuses.includes(response.status)) return waitForExcelImportJob(jobId, request, onProgress, true)
  if (response.status === 409) {
    const data = await response.json().catch(() => null)
    const hasActiveJob = typeof data?.jobId === 'string'
    if (hasActiveJob) onJobId(data.jobId)
    throw Object.assign(new Error(data?.error || 'توجد عملية استيراد أخرى. لم يتم استيراد الملف الجديد.'), { isExcelImportFinished: !hasActiveJob })
  }
  if (response.status === 202) {
    const job = await response.json().catch(() => null)
    if (typeof job?.jobId !== 'string') return waitForExcelImportJob(jobId, request, onProgress)
    onJobId(job.jobId)
    return waitForExcelImportJob(job.jobId, request, onProgress)
  }
  try {
    return await readExcelImportResponse(response, onProgress)
  } catch (error) {
    if ([400, 413].includes(response.status)) Object.assign(error as Error, { isExcelImportFinished: true })
    throw error
  }
}

export async function readExcelImportResponse(response: Response, onProgress: (progress: ExcelImportProgress) => void): Promise<ExcelImportResult> {
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    if (typeof data?.error === 'string') throw new Error(data.error)
    if ([408, 499, 502, 503, 504, 524].includes(response.status)) {
      throw new Error(`${interruptedMessage} (HTTP ${response.status})`)
    }
    if (response.status === 413) throw new Error('حجم الملف يتجاوز حد الرفع المسموح. الحد الأقصى لملف Excel هو 200 ميجابايت.')
    throw new Error(`تعذر استيراد الملف. استجاب الخادم بخطأ HTTP ${response.status}.`)
  }

  // Older deployed servers and external clients still use the JSON response.
  if (!response.headers.get('content-type')?.includes('application/x-ndjson')) {
    const result = await response.json().catch(() => null)
    if (typeof result?.error === 'string') throw new Error(result.error)
    if (result?.success !== true) throw new Error('لم يُرجع الخادم نتيجة استيراد صالحة.')
    return result
  }

  if (!response.body) throw new Error(interruptedMessage)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  const parseEvent = (line: string): ExcelImportResult | undefined => {
    if (!line.trim()) return
    let event
    try {
      event = JSON.parse(line)
    } catch {
      throw new Error(interruptedMessage)
    }
    if (!event || typeof event !== 'object') throw new Error(interruptedMessage)
    if (event.type === 'error') throw new Error(event.error || interruptedMessage)
    if (event.type === 'progress') {
      if (![event.totalRows, event.processedCount, event.importedCount, event.updatedCount].every(value => Number.isInteger(value) && value >= 0)) {
        throw new Error(interruptedMessage)
      }
      onProgress(event)
    }
    if (event.type === 'result' && event.success === true) return event
  }

  try {
    while (true) {
      let chunk
      try {
        chunk = await reader.read()
      } catch {
        throw new Error(interruptedMessage)
      }
      pending += decoder.decode(chunk.value, { stream: !chunk.done })
      if (pending.length > 65536) throw new Error(interruptedMessage)
      const lines = pending.split('\n')
      pending = lines.pop() || ''
      for (const line of lines) {
        const result = parseEvent(line)
        if (result) return result
      }
      if (chunk.done) {
        const result = parseEvent(pending)
        if (result) return result
        throw new Error(interruptedMessage)
      }
    }
  } finally {
    reader.releaseLock()
  }
}
