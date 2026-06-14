import React from 'react'

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden p-3 space-y-3" style={{ border: '1px solid #e8f0ed' }}>
      <div className="aspect-square bg-slate-100 animate-pulse rounded-xl" />
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-100 animate-pulse rounded-md w-full" />
        <div className="h-3 bg-slate-100 animate-pulse rounded-md w-2/3" />
        <div className="h-3.5 bg-slate-100 animate-pulse rounded-md w-1/3" />
      </div>
      <div className="h-9 bg-slate-100 animate-pulse rounded-xl w-full" />
    </div>
  )
}
