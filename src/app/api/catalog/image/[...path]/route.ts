import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBaseUrls() {
  const raw = [process.env.BACKEND_URL, process.env.NEXT_PUBLIC_API_URL, 'http://localhost:5000'];
  const cleaned = raw
    .filter((v): v is string => Boolean(v && v.trim()))
    .map((v) => v.replace(/\/+$/, ''));
  return Array.from(new Set(cleaned));
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const backendBaseUrls = getBackendBaseUrls();
  const subPath = params.path.join('/');

  for (const baseUrl of backendBaseUrls) {
    try {
      const targetUrl = `${baseUrl}/api/catalog/image/${subPath}`;
      const response = await fetch(targetUrl, {
        headers: {
          'Accept': 'image/jpeg,image/*,*/*',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        continue;
      }

      const body = await response.arrayBuffer();
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        },
      });
    } catch (e) {
      console.error('Error proxying catalog image:', e);
    }
  }

  return new NextResponse('Image not found', { status: 404 });
}
