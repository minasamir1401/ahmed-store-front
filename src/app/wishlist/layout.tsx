import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('قائمة الرغبات | The VitaHub', '/wishlist')

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return children
}
