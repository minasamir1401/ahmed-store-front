import type { Metadata } from 'next'

const siteName = 'The VitaHub'
const defaultImage = '/logo-header.jpg'

type PublicPageMetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
}

export const publicPageMetadata = ({ title, description, path, keywords, image = defaultImage }: PublicPageMetadataInput): Metadata => ({
  title,
  description,
  keywords,
  alternates: {
    canonical: path,
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
    url: path,
    siteName,
    locale: 'ar_EG',
    type: 'website',
    images: [
      {
        url: image,
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
    images: [image],
  },
})

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
