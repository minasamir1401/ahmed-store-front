import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('استعادة كلمة المرور | The VitaHub')

export default function ForgotLayout({ children }: { children: ReactNode }) {
  return children
}
