const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_INDEXING_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing'

type IndexingType = 'URL_UPDATED' | 'URL_DELETED'

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

const base64UrlEncode = (input: string | Buffer) => {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const getPrivateKey = () => {
  const key = process.env.GOOGLE_INDEXING_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY
  return key?.replace(/\\n/g, '\n')
}

const createJwtAssertion = async (clientEmail: string, privateKey: string) => {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64UrlEncode(JSON.stringify({
    iss: clientEmail,
    scope: INDEXING_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }))

  const unsignedToken = `${header}.${claims}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    Buffer.from(privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, ''), 'base64'),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, Buffer.from(unsignedToken))

  return `${unsignedToken}.${base64UrlEncode(Buffer.from(signature))}`
}

const getAccessToken = async () => {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = getPrivateKey()

  if (!clientEmail || !privateKey) {
    throw new Error('Google Indexing API credentials are not configured')
  }

  const assertion = await createJwtAssertion(clientEmail, privateKey)
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const data = await res.json() as GoogleTokenResponse

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `Google token request failed with ${res.status}`)
  }

  return data.access_token
}

export const publishGoogleIndexingNotification = async (url: string, type: IndexingType = 'URL_UPDATED') => {
  const accessToken = await getAccessToken()
  const res = await fetch(GOOGLE_INDEXING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type }),
  })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = typeof data?.error?.message === 'string' ? data.error.message : `Google Indexing request failed with ${res.status}`
    throw new Error(error)
  }

  return data
}
