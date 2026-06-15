import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata({
  title: 'أقسام المكملات والفيتامينات | The VitaHub',
  description: 'تصفح أقسام The VitaHub: فيتامينات، بروتينات، مكملات رياضية، صحة عامة، رشاقة ومنتجات مستوردة أصلية في مصر.',
  path: '/categories',
  keywords: ['أقسام المكملات', 'فيتامينات', 'مكملات رياضية', 'منتجات صحية مصر'],
})

export default function CategoriesLayout({ children }: { children: ReactNode }) {
  return children
}
