import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'نصائح صحية ومقالات عن الفيتامينات والمكملات | The VitaHub',
  description: 'اقرأ نصائح صحية ومقالات مبسطة عن الفيتامينات، المكملات الغذائية، البروتين، الرشاقة، التغذية والصحة من خبراء The VitaHub.',
  path: '/health-tips',
  keywords: ['نصائح صحية', 'مقالات فيتامينات', 'فوائد المكملات الغذائية', 'التغذية والرشاقة'],
})

export default function HealthTipsLayout({ children }: { children: ReactNode }) {
  return children
}
