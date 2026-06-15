import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'الشحن والتوصيل | The VitaHub',
  description: 'تعرف على سياسة الشحن والتوصيل من The VitaHub داخل محافظات مصر، مدة التوصيل، تكلفة الشحن وخطوات استلام الطلب.',
  path: '/shipping',
})

export default function ShippingLayout({ children }: { children: ReactNode }) {
  return children
}
