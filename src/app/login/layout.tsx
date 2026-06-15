import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('تسجيل الدخول | The VitaHub')

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
