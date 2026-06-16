import type { Metadata } from 'next'

const siteName = 'The VitaHub'
const defaultImage = '/logo-header.jpg'

type PublicPageMetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
  isEn?: boolean
  siteUrl?: string
}

export const publicPageMetadata = ({ 
  title, 
  description, 
  path, 
  keywords, 
  image = defaultImage,
  isEn = false,
  siteUrl = 'https://the-vitahub.com'
}: PublicPageMetadataInput): Metadata => {
  const canonicalUrl = `${siteUrl.replace(/\/+$/, '')}${path}`
  const imageUrl = image.startsWith('http') ? image : `${siteUrl.replace(/\/+$/, '')}${image.startsWith('/') ? '' : '/'}${image}`

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ar-EG': canonicalUrl,
        'en-EG': `${canonicalUrl}?lang=en`,
        'x-default': canonicalUrl
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: isEn ? 'en_US' : 'ar_EG',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export const privatePageMetadata = (title: string): Metadata => ({
  title,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
})
