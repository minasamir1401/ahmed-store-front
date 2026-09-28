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
    const res = await fetch(`${backendUrl}/api/catalog/facebook-feed.csv`, {
      next: { revalidate: 1800 },
      headers: {
        'Accept': 'text/csv',
      },
    });

    if (!res.ok) {
      return new NextResponse('Error generating CSV feed from backend', { status: 502 });
    }

    const csv = await res.text();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'inline; filename="the-vitahub-facebook-catalog.csv"',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching facebook-feed.csv:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
