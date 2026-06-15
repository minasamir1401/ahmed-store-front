import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'عروض المكملات الغذائية والفيتامينات الأصلية في مصر',
  description: 'اكتشف أفضل عروض The VitaHub على المكملات الغذائية والفيتامينات والبروتينات الأصلية مع خصومات وتوصيل سريع داخل مصر.',
  path: '/offers',
  keywords: ['عروض مكملات غذائية', 'خصومات فيتامينات', 'عروض بروتين مصر', 'The VitaHub offers'],
})

export default function OffersLayout({ children }: { children: ReactNode }) {
  return children
}
