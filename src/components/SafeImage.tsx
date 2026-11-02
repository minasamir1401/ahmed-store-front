"use client"

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null
  fallbackSrc?: string
  fallbackComponent?: React.ReactNode
}

export default function SafeImage(props: SafeImageProps) {
  return <ImagePreview key={`${props.src || ''}:${props.fallbackSrc || ''}`} {...props} />
}

function ImagePreview({
  src,
  alt = '',
  fallbackSrc,
  fallbackComponent,
  className = '',
  fill,
  width,
  height,
  onError,
  unoptimized,
  ...rest
}: SafeImageProps) {
  const [errorState, setErrorState] = useState<'none' | 'fallback-native' | 'failed'>('none')

  const isBlockedUrl = (url?: string | null): boolean => {
    if (!url) return true
    const blockedKeywords = ['/publicidad/', 'doubleclick', 'adnxs', 'googlesyndication']
    return blockedKeywords.some(keyword => url.toLowerCase().includes(keyword))
  }
  const hasFallback = Boolean(fallbackSrc && fallbackSrc !== src && !isBlockedUrl(fallbackSrc))

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
        src={hasFallback ? fallbackSrc : src}
        alt={alt}
        className={className}
        style={{ ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}), ...rest.style }}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading={rest.loading || 'lazy'}
        onLoad={rest.onLoad}
        onError={event => {
          setErrorState('failed')
          onError?.(event)
        }}
      />
    )
  }

  const isExternal = typeof src === 'string' && /^(https?:)?\/\//i.test(src)
  const isUnoptimized = unoptimized ?? isExternal

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      unoptimized={isUnoptimized}
      onError={event => {
        // Retrying an already-direct external request cannot bypass DNS or CORP failures.
        setErrorState(hasFallback || !isUnoptimized ? 'fallback-native' : 'failed')
        onError?.(event)
      }}
      {...rest}
    />
  )
}
