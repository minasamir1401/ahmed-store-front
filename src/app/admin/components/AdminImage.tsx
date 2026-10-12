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
  const external = /^(https?:)?\/\//i.test(src)

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-slate-400" role="img" aria-label={`تعذر تحميل ${alt}`}>
        <ImageOff size={24} />
        <span className="text-[10px] text-center">تعذر تحميل الصورة</span>
      </div>
    )
  }

  return (
    <Image
      src={src.startsWith('//') ? `https:${src}` : src}
      alt={alt}
      width={800}
      height={800}
      className={className}
      // External previews use the same-origin optimizer to avoid remote CORP restrictions.
      unoptimized={!external}
      onError={() => setFailed(true)}
    />
  )
}
