import React from 'react'
import BMICalculatorClient from './BMICalculatorClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'حاسبة مؤشر كتلة الجسم الذكية BMI | Vitamins HUB',
  description: 'احسب مؤشر كتلة الجسم (BMI) بدقة متناهية مع حاسبتنا الذكية المدعومة بالذكاء الاصطناعي. احصل على نصائح غذائية وتوصيات مخصصة لمكملاتك الغذائية مجاناً.',
  keywords: ['حاسبة BMI', 'حساب مؤشر كتلة الجسم', 'الوزن المثالي', 'حاسبة الوزن الذكية', 'حساب كتلة الجسم مصر', 'تخسيس ورشاقة'],
  alternates: {
    canonical: '/bmi-calculator',
  }
}

import { getServerSiteUrl } from '@/lib/seo'

export default async function BMICalculatorPage() {
  const siteUrl = await getServerSiteUrl()

  // Dynamic WebApplication Schema for Google Rich Snippets
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "حاسبة مؤشر كتلة الجسم الذكية BMI - Vitamins HUB",
    "url": `${siteUrl}/bmi-calculator`,
    "description": "أداة ذكية لحساب مؤشر كتلة الجسم وتقديم توصيات مخصصة للرشاقة والصحة والمكملات الغذائية.",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5, CSS3, JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "EGP"
    },
    "author": {
      "@type": "Organization",
      "name": "Vitamins HUB"
    }
  }

  return (
    <>
      {/* WebApplication Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <BMICalculatorClient />
    </>
  )
}
