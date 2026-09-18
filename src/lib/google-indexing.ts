type IndexingType = 'URL_UPDATED' | 'URL_DELETED'

/**
 * Publishes Google/Bing indexing notification by delegating to the secure Backend API.
 * The frontend never stores or handles Google Service Account private keys directly.
 */
export const publishGoogleIndexingNotification = async (
  url: string,
  type: IndexingType = 'URL_UPDATED',
  authToken?: string
) => {
  const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (authToken) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
  }

  const res = await fetch(`${backendUrl}/api/admin/indexing/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, type })
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = typeof data?.error === 'string' ? data.error : `Google Indexing backend request failed with ${res.status}`
    throw new Error(error)
  }

  return data
}
