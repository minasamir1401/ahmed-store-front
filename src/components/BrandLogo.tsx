'use client'

import React, { useState } from 'react'
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
  const [hasError, setHasError] = useState(false)

  const resolvedSrc = safeBrandImage(image)

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
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  )
}
