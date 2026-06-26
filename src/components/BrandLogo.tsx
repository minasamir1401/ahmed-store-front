'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { safeBrandImage } from '@/lib/product-images'

interface BrandLogoProps {
  image?: string | null
  name: string
  className?: string
  size?: number
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  image,
  name,
  className = '',
  size = 40
}) => {
  const [retryCount, setRetryCount] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Reset states when the image source changes
  useEffect(() => {
    setRetryCount(0)
    setHasError(false)
  }, [image])

  const getResolvedSrc = () => {
    const rawSrc = safeBrandImage(image)
    if (!rawSrc) return ''

    // If it's a relative path (e.g. /uploads/...) or not a favicon/domain URL, don't retry fallbacks
    const isDomainBased = rawSrc.includes('logos.hunter.io/') || 
                          rawSrc.includes('logo.clearbit.com/') || 
                          rawSrc.includes('google.com/s2/favicons') ||
                          rawSrc.includes('gstatic.com/faviconV2')

    if (!isDomainBased) return rawSrc

    // Extract clean domain name
    let domain = ''
    if (rawSrc.includes('logos.hunter.io/')) {
      domain = rawSrc.split('logos.hunter.io/')[1]
    } else if (rawSrc.includes('logo.clearbit.com/')) {
      domain = rawSrc.split('logo.clearbit.com/')[1]
    } else if (rawSrc.includes('google.com/s2/favicons')) {
      const match = rawSrc.match(/[?&]domain=([^&]+)/)
      if (match) domain = match[1]
    } else if (rawSrc.includes('gstatic.com/faviconV2')) {
      const match = rawSrc.match(/[?&]url=([^&]+)/)
      if (match) {
        domain = decodeURIComponent(match[1]).replace(/^https?:\/\//i, '')
      }
    }

    if (!domain) return rawSrc

    // Fallback sequence:
    // 0: Hunter.io Logo API (High quality, adblock-friendly)
    // 1: Google Favicon V2 (via t1.gstatic.com, adblock-friendly, but can 404)
    // 2: DuckDuckGo favicon service (low resolution, but always works / returns 200)
    if (retryCount === 0) {
      return `https://logos.hunter.io/${domain}`
    } else if (retryCount === 1) {
      return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
    } else if (retryCount === 2) {
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`
    }

    return rawSrc
  }

  const resolvedSrc = getResolvedSrc()

  const handleError = () => {
    // If it's a domain-based logo, try the next fallback
    const isDomainBased = resolvedSrc.includes('logos.hunter.io/') || 
                          resolvedSrc.includes('logo.clearbit.com/') || 
                          resolvedSrc.includes('google.com/s2/favicons') ||
                          resolvedSrc.includes('gstatic.com/faviconV2')

    if (isDomainBased && retryCount < 2) {
      setRetryCount(prev => prev + 1)
    } else {
      setHasError(true)
    }
  }

  if (hasError || !resolvedSrc) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={name}
      >
        <Building2 size={size * 0.5} />
      </div>
    )
  }

  return (
    <div 
      className={`relative rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={resolvedSrc}
        alt={name}
        fill
        className="object-contain p-1"
        onError={handleError}
        unoptimized
      />
    </div>
  )
}
