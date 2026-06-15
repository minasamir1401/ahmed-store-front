import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'جميع المكملات الغذائية والفيتامينات الأصلية في مصر',
  description: 'تسوق أحدث المكملات الغذائية، الفيتامينات، البروتينات، الكرياتين، أوميجا 3 ومنتجات الصحة الأصلية 100% في مصر من The VitaHub.',
  path: '/products',
  keywords: ['مكملات غذائية مصر', 'فيتامينات أصلية', 'بروتين', 'كرياتين', 'أوميجا 3', 'The VitaHub'],
})

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children
}
