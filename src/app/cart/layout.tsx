import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('سلة التسوق | The VitaHub')

export default function CartLayout({ children }: { children: ReactNode }) {
  return children
}
