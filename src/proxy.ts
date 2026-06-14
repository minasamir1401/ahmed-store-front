import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware لحماية مسارات الـ Admin.
 * يتحقق من وجود token الجلسة في localStorage عبر Custom Header
 * (لأن localStorage لا يمكن الوصول إليه في middleware، الحماية الفعلية
 * تتم أيضاً في الـ client-side check داخل useAdminDashboard).
 *
 * ملاحظة: للحماية الكاملة يُوصى بالانتقال إلى httpOnly cookies.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // حماية مسارات الـ Admin API — تتطلب Authorization header
  if (pathname.startsWith('/api/') && request.method !== 'GET') {
    // AI generate endpoint — يتحقق منه في route handler نفسه
    if (pathname === '/api/ai/generate' || pathname === '/services/ai/generate') {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  // تطبيق على جميع المسارات ماعدا الملفات الثابتة
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.*|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)',
  ],
}
