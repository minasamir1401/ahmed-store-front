import type { ReactNode } from 'react'
import { privatePageMetadata } from '@/lib/site-metadata'

export const metadata = privatePageMetadata('حسابي | The VitaHub')

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children
}
