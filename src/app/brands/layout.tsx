import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'ماركات المكملات الغذائية الأصلية | The VitaHub',
  description: 'تسوق منتجات أفضل ماركات المكملات الغذائية والفيتامينات العالمية الأصلية من The VitaHub مع ضمان الأصالة والتوصيل داخل مصر.',
  path: '/brands',
  keywords: ['ماركات مكملات غذائية', 'ماركات فيتامينات', 'مكملات أصلية', 'أفضل ماركات البروتين'],
})

export default function BrandsLayout({ children }: { children: ReactNode }) {
  return children
}
