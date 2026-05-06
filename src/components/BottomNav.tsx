"use client"

import React from 'react'
import Link from 'next/link'
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'الرئيسية', icon: Home, href: '/' },
    { label: 'الأقسام', icon: Grid, href: '/categories' },
    { label: 'العروض', icon: ShoppingBag, href: '/offers' },
    { label: 'المفضلة', icon: Heart, href: '/wishlist' },
    { label: 'حسابي', icon: User, href: '/login' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex items-center justify-around h-16 px-2 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
              isActive ? "text-primary" : "text-muted hover:text-primary"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
