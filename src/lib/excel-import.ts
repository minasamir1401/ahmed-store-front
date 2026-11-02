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

const interruptedMessage = 'انقطع اتصال الاستيراد قبل وصول النتيجة النهائية. قد تكون بعض المنتجات قد حُفظت؛ راجع القائمة قبل إعادة الاستيراد.'

export async function readExcelImportResponse(response: Response, onProgress: (progress: ExcelImportProgress) => void): Promise<ExcelImportResult> {
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    if (typeof data?.error === 'string') throw new Error(data.error)
    if ([408, 499, 502, 503, 504, 524].includes(response.status)) {
      throw new Error(`${interruptedMessage} (HTTP ${response.status})`)
    }
    if (response.status === 413) throw new Error('حجم الملف يتجاوز حد الرفع المسموح. الحد الأقصى لملف Excel هو 50 ميجابايت.')
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
