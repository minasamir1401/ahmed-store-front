import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'سياسة الاستبدال والإرجاع | The VitaHub',
  description: 'تعرف على سياسة الاستبدال والإرجاع في The VitaHub وشروط إرجاع المكملات والفيتامينات الأصلية خلال المدة المحددة.',
  path: '/returns',
})

export default function ReturnsLayout({ children }: { children: ReactNode }) {
  return children
}
