'use client'

import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { useState } from 'react'

type AdminImageProps = {
  src: string
  alt: string
  className?: string
}

export default function AdminImage(props: AdminImageProps) {
  return <ImagePreview key={props.src} {...props} />
}

function ImagePreview({ src, alt, className }: AdminImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || !src.trim() || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-slate-400" role="img" aria-label={`تعذر تحميل ${alt}`}>
        <ImageOff size={24} />
        <span className="text-[10px] text-center">تعذر تحميل الصورة</span>
      </div>
    )
  }

  const normalizedSrc = src.startsWith('//') ? `https:${src}` : src.replace(/^http:\/\//i, 'https://')

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={800}
      height={800}
      className={className}
      unoptimized={true}
      onError={() => setFailed(true)}
    />
  )
}
