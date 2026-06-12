"use client"

import React, { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: Copy link
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
        copied
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-[#f0f7f4] text-primary hover:bg-primary hover:text-white'
      }`}
    >
      <Share2 size={18} />
      {copied ? 'تم نسخ الرابط!' : 'مشاركة المقال'}
    </button>
  )
}
