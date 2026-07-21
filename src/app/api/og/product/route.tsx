import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

// Use Node.js runtime instead of Edge because sharp relies on native Node.js addons
export const runtime = 'nodejs'

async function fetchWithFallbacks(urlPath: string, req: NextRequest): Promise<Buffer> {
  // 1. Try local file system (only if it's not a remote upload)
  if (!urlPath.startsWith('/uploads/') && !urlPath.startsWith('uploads/')) {
    try {
      const localPath = path.join(process.cwd(), 'public', urlPath.split('?')[0])
      return await fs.readFile(localPath)
    } catch (err) {
      // Silent catch
    }
  }

  // 2. Try localhost fetch
  try {
    const port = process.env.PORT || 3000
    const localUrl = `http://127.0.0.1:${port}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`
    const res = await fetch(localUrl)
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer())
    }
  } catch (err) {
    console.warn(`Localhost fetch failed for ${urlPath}, trying absolute url...`)
  }

  // 3. Try absolute url based on request host
  try {
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const absoluteUrl = `${protocol}://${host}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`
    const res = await fetch(absoluteUrl)
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer())
    }
  } catch (err) {
    console.warn(`Host-based fetch failed for ${urlPath}`)
  }

  // 4. Try public/production API URL as fallback (vital for local development)
  try {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.the-vitahub.com'
    const absoluteUrl = `${publicApiUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`
    const res = await fetch(absoluteUrl)
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer())
    }
  } catch (err) {
    console.warn(`Public API fallback fetch failed for ${urlPath}`)
  }

  throw new Error(`Failed to fetch image from all fallbacks for path: ${urlPath}`)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUrl = searchParams.get('url')

    if (!rawUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Strip version query param if exists to simplify fetching/reading
    let imgUrl = rawUrl
    try {
      const parsedUrl = new URL(rawUrl, 'http://localhost')
      imgUrl = parsedUrl.pathname
    } catch (e) {
      // Ignore
    }

    let productBuffer: Buffer
    try {
      if (imgUrl.startsWith('http')) {
        const res = await fetch(imgUrl)
        if (!res.ok) throw new Error('External fetch failed')
        productBuffer = Buffer.from(await res.arrayBuffer())
      } else {
        productBuffer = await fetchWithFallbacks(imgUrl, req)
      }
    } catch (e: any) {
      return new NextResponse(`Product image not found: ${e.message}`, { 
        status: 500, 
        headers: { 'X-Error-Context': 'product-fetch', 'X-Error-Message': e.message || 'Unknown' } 
      })
    }

    let frameBuffer: Buffer;
    try {
      frameBuffer = await fetchWithFallbacks('/frame.png', req)
    } catch (e: any) {
      return new NextResponse(`Frame image not found: ${e.message}`, { 
        status: 500,
        headers: { 'X-Error-Context': 'frame-fetch', 'X-Error-Message': e.message || 'Unknown' }
      })
    }
    
    // Process image with Sharp: Composite product ON TOP of frame
    let finalImage: Buffer
    try {
      // 1. Resize base frame to 1080x1080
      const baseFrame = await sharp(frameBuffer)
        .resize(1080, 1080, {
          fit: 'fill',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toBuffer()

      // 2. Resize product to 750x750 (with transparent background) to sit inside the frame
      const resizedProduct = await sharp(productBuffer)
        .resize(750, 750, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer()

      // 3. Composite product image on top of the frame
      finalImage = await sharp(baseFrame)
        .composite([{ input: resizedProduct, gravity: 'center' }])
        .jpeg({ quality: 90 }) // Convert output to JPEG for maximum compatibility
        .toBuffer()
    } catch (e: any) {
      return new NextResponse(`Sharp processing failed: ${e.message}`, {
        status: 500,
        headers: { 'X-Error-Context': 'sharp-processing', 'X-Error-Message': e.message || 'Unknown' }
      })
    }

    // Create an unshared ArrayBuffer copy to avoid 'SharedArrayBuffer is not allowed' errors in Next.js
    const safeBuffer = finalImage.buffer.slice(finalImage.byteOffset, finalImage.byteOffset + finalImage.byteLength)

    return new NextResponse(safeBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e: any) {
    console.error('OG Image Generation Error:', e)
    return new NextResponse(`Critical Error: ${e.message}`, { 
      status: 500,
      headers: { 'X-Error-Context': 'global', 'X-Error-Message': e.message || 'Unknown' }
    })
  }
}
