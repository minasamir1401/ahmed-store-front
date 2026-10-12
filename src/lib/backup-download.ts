export async function readBackupFile(response: Response): Promise<Blob> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || `فشل تحميل النسخة الاحتياطية (${response.status})`)
  }

  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (!['application/zip', 'application/x-zip-compressed', 'application/octet-stream'].includes(contentType || '')) {
    throw new Error('الخادم لم يرجع ملف ZIP صالحًا. لم يتم حفظ نسخة احتياطية.')
  }

  const blob = await response.blob()
  const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (blob.size < 22 || signature[0] !== 0x50 || signature[1] !== 0x4b || signature[2] !== 0x03 || signature[3] !== 0x04) {
    throw new Error('ملف النسخة الاحتياطية فارغ أو غير صالح. أعد المحاولة.')
  }
  return blob
}
