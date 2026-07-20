import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('تتبع الطلب | The VitaHub')

export default function TrackLayout({ children }: { children: ReactNode }) {
  return children
}
