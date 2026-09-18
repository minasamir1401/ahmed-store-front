import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('تسجيل الدخول | The VitaHub', '/login')

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
