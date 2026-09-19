"use client"

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null
  fallbackSrc?: string
  fallbackComponent?: React.ReactNode
}

export default function SafeImage({
  src,
  alt = '',
  fallbackSrc,
  fallbackComponent,
  className = '',
  fill,
  width,
  height,
  ...rest
}: SafeImageProps) {
  const [errorState, setErrorState] = useState<'none' | 'fallback-native' | 'failed'>('none')

  useEffect(() => {
    setErrorState('none')
  }, [src])

  const isBlockedUrl = (url?: string | null): boolean => {
    if (!url) return true
    const blockedKeywords = ['/publicidad/', 'doubleclick', 'adnxs', 'googlesyndication']
    return blockedKeywords.some(keyword => url.toLowerCase().includes(keyword))
  }

  if (!src || errorState === 'failed' || isBlockedUrl(src)) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }
    return (
      <div 
        className={`bg-slate-100/80 border border-slate-200/50 flex flex-col items-center justify-center text-slate-400 select-none ${fill ? 'absolute inset-0 w-full h-full' : ''} ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="opacity-40"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    )
  }

  if (errorState === 'fallback-native') {
    return (
      <img
        src={fallbackSrc || src}
        alt={alt}
        className={className}
        style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : undefined}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading="lazy"
        onError={() => setErrorState('failed')}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (fallbackSrc) {
          setErrorState('fallback-native')
        } else {
          setErrorState('fallback-native')
        }
      }}
      {...rest}
    />
  )
}
