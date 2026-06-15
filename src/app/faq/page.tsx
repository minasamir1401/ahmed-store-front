import React from 'react'
import type { Metadata } from 'next'
import FAQPageClient from './FAQPageClient'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata: Metadata = publicPageMetadata({
  title: 'الأسئلة الشائعة | The VitaHub',
  description: 'إجابات على الأسئلة الشائعة حول الفيتامينات الأصلية، طرق الشحن والتوصيل، سياسة الإرجاع، وأصالة المكملات الغذائية في متجر The VitaHub.',
  path: '/faq',
  keywords: ['أسئلة المكملات الغذائية', 'أصالة الفيتامينات', 'شحن مكملات مصر', 'The VitaHub FAQ'],
})

import { getServerSiteUrl } from '@/lib/seo'

export default async function FAQPage() {
  const faqs = [
    {
      q: "هل جميع المكملات والفيتامينات لديكم أصلية 100%؟",
      a: "نعم، جميع منتجاتنا مستوردة وأصلية 100% من المصانع والعلامات التجارية مباشرة. نقوم بفحص كل شحنة بدقة شديدة وتوفير باركود التحقق على المنتجات."
    },
    {
      q: "كم يستغرق الشحن والتوصيل داخل محافظات مصر؟",
      a: "توصيل سريع للغاية! يستغرق الشحن عادةً من 24 إلى 48 ساعة فقط للقاهرة والجيزة، ومن 2 إلى 4 أيام عمل لباقي المحافظات والمناطق البعيدة."
    },
    {
      q: "ما هي طرق الدفع المتاحة في المتجر؟",
      a: "نوفر الدفع عبر إنستاباي والمحافظ الإلكترونية كخيارات دفع أساسية لضمان السرعة والأمان التام."
    },
    {
      q: "هل يمكنني إرجاع أو استبدال المنتج بعد الشراء؟",
      a: "نعم بالطبع، نوفر سياسة إرجاع واستبدال مرنة للغاية وسريعة خلال 7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية المغلقة وغير مفتوح."
    },
    {
      q: "هل توفرون استشارات طبية لاختيار المكملات المناسبة؟",
      a: "نعم، فريقنا يضم متخصصين في التغذية الرياضية لمساعدتك مجاناً في اختيار المكملات الغذائية المناسبة لهدفك الصحي أو الرياضي."
    }
  ]

  await getServerSiteUrl()

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQPageClient />
    </>
  )
}
