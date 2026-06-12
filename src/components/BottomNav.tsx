"use client"

import React from 'react'
import Link from 'next/link'
import { Home, Grid, Tag, Heart, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/context/WishlistContext'
import { useLanguage } from '@/context/LanguageContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { wishlist } = useWishlist()
  const { t, dir } = useLanguage()

  if (pathname?.startsWith('/admin')) return null

  const navItems = [
    { label: t('bottom_home'), icon: Home,  href: '/' },
    { label: t('bottom_categories'),  icon: Grid,  href: '/categories' },
    { label: t('bottom_offers'),   icon: Tag,   href: '/offers' },
    { label: t('bottom_wishlist'),  icon: Heart, href: '/wishlist', badge: wishlist.length },
    { label: t('bottom_account'),   icon: User,  href: '/login' },
  ]

  return (
    <nav
      dir={dir}
      className="lg:hidden fixed bottom-0 left-0 right-0 w-full mx-auto z-[90] flex items-stretch justify-around print:hidden"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(46,125,94,0.12)',
        boxShadow: '0 -4px 24px rgba(46,125,94,0.08)',
        height: '60px',
        width: '100%',
        maxWidth: '100vw',
        minWidth: '0',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 transition-all duration-200 select-none active:scale-95 px-0.5 max-[320px]:px-0",
              isActive ? "text-primary" : "text-slate-500"
            )}
          >
            {/* Top active bar */}
            {isActive && (
              <span className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
                <span className="w-5 h-0.5 rounded-full bg-primary" />
              </span>
            )}

            {/* Icon */}
            <span className={cn(
              "relative flex items-center justify-center w-8 h-8 max-[340px]:w-7 max-[340px]:h-7 rounded-xl transition-all duration-200",
              isActive ? "bg-primary/10" : "bg-transparent"
            )}>
              <Icon className={cn(isActive ? "w-[19px] h-[19px] max-[340px]:w-[16px] max-[340px]:h-[16px]" : "w-[18px] h-[18px] max-[340px]:w-[15px] max-[340px]:h-[15px]")} strokeWidth={isActive ? 2.5 : 1.8} />

              {/* Badge */}
              {item.badge != null && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white leading-none">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>

            {/* Label */}
            <span className={cn(
              "text-[8px] max-[340px]:text-[7px] max-[340px]:tracking-tight font-black tracking-wide leading-none truncate w-full text-center px-0.5",
              isActive ? "text-primary" : "text-slate-500"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
