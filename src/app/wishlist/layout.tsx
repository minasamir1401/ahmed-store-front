import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('قائمة الأمنيات | The VitaHub')

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return children
}
