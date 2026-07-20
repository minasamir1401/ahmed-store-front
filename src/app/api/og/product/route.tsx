import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

// Use Node.js runtime instead of Edge because sharp relies on native Node.js addons
export const runtime = 'nodejs'

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

    let productBuffer: Buffer | null = null

    // If it's a local upload, read it directly from public folder to avoid fetch issues
    if (imgUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', imgUrl)
      try {
        productBuffer = await fs.readFile(filePath)
      } catch (err) {
        console.warn(`Local file not found: ${filePath}, falling back to fetch.`)
      }
    }

    // Fallback to fetch if not found locally or if it's an external URL
    if (!productBuffer) {
      const host = req.headers.get('host') || 'localhost:3000'
      const protocol = host.includes('localhost') ? 'http' : 'https'
      const baseUrl = `${protocol}://${host}`
      
      const finalImgUrl = imgUrl.startsWith('http') ? imgUrl : `${baseUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`

      const imgRes = await fetch(finalImgUrl)
      if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.statusText}`)
      const arrayBuffer = await imgRes.arrayBuffer()
      productBuffer = Buffer.from(arrayBuffer)
    }

    // Load frame from public folder
    const framePath = path.join(process.cwd(), 'public', 'frame.png')
    let frameBuffer: Buffer;
    try {
      frameBuffer = await fs.readFile(framePath)
    } catch (err) {
      console.error('Frame image not found at public/frame.png')
      return new NextResponse('Frame image not found', { status: 500 })
    }
    
    // Process image with Sharp
    // 1. Resize product image to fit inside 1080x1080 canvas with white background
    const resizedProduct = await sharp(productBuffer)
      .resize(1080, 1080, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toBuffer()

    // 2. Composite the frame over the resized product image
    const finalImage = await sharp(resizedProduct)
      .composite([{ input: frameBuffer, gravity: 'center' }])
      .jpeg({ quality: 90 }) // Convert output to JPEG for maximum compatibility
      .toBuffer()

    return new NextResponse(finalImage, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e: any) {
    console.error('OG Image Generation Error:', e)
    return new NextResponse('Failed to generate image', { status: 500 })
  }
}
