import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

const getBackendUrl = () => {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return backendUrl.replace(/\/+$/, '');
};

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/catalog/facebook-feed.xml`, {
      next: { revalidate: 1800 },
      headers: {
        'Accept': 'application/xml, text/xml',
      },
    });

    if (!res.ok) {
      return new NextResponse('Error generating feed from backend', { status: 502 });
    }

    const xml = await res.text();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching facebook-feed.xml:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
