import React from 'react'
import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'
import { publicPageMetadata } from '@/lib/site-metadata'
import { getServerSiteUrl } from '@/lib/seo'

interface PageParams {
  searchParams: Promise<{ lang?: string }>
}

export async function generateMetadata({ searchParams }: PageParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const isEn = resolvedSearchParams.lang === 'en'
  const siteUrl = await getServerSiteUrl()

  const title = isEn
    ? "About The VitaHub | Premium Vitamins & Supplements Store in Egypt"
    : "عن The VitaHub | متجر المكملات الغذائية والأصلية الأول في مصر"

  const description = isEn
    ? "Learn about The VitaHub, the leading online store for 100% original imported supplements and vitamins in Egypt. Our vision, values, and quality commitment."
    : "تعرف على قصة The VitaHub، متجر المكملات الغذائية والفيتامينات والبروتينات المستوردة والأصلية 100% في مصر. رؤيتنا، قيمنا، والتزامنا بصحتك ورشاقتك."

  return publicPageMetadata({
    title,
    description,
    path: '/about',
    keywords: isEn 
      ? ['About The VitaHub', 'Vitamins Egypt', 'imported supplements Cairo']
      : ['The VitaHub', 'ذا فيتا هوب', 'عن ذا فيتا هوب', 'مكملات أصلية مصر'],
    isEn,
    siteUrl
  })
}

export default async function AboutPage() {
  const siteUrl = await getServerSiteUrl()

  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/about/#webpage`,
        "url": `${siteUrl}/about`,
        "name": "عن The VitaHub | قصة نجاحنا وقيمنا الصحية",
        "description": "تعرف على The VitaHub، المتجر الرائد للمكملات الغذائية المستوردة الأصلية في مصر."
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "The VitaHub",
        "url": `${siteUrl}/`,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo-header.jpg`
        },
        "description": "المنصة الأولى الموثوقة لبيع المكملات الغذائية والفيتامينات والبروتينات الأصلية 100% في مصر.",
        "foundingDate": "2024",
        "knowsAbout": ["Sports Nutrition", "Vitamins", "Supplements", "Fitness", "Healthy Lifestyle"],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+201001234567",
          "contactType": "customer service",
          "areaServed": "EG",
          "availableLanguage": "Arabic"
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutPageClient />
    </>
  )
}
