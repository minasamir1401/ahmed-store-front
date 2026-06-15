import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('إتمام الطلب | The VitaHub')

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
