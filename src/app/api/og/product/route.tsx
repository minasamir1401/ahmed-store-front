import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const imgUrl = searchParams.get('url')

    if (!imgUrl) {
      return new Response('Missing url parameter', { status: 400 })
    }

    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    const finalImgUrl = imgUrl.startsWith('http') ? imgUrl : `${baseUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: 'white',
          }}
        >
          <img
            src={finalImgUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 1,
            }}
          />
          <img
            src={`${baseUrl}/frame.png`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 2,
            }}
          />
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
