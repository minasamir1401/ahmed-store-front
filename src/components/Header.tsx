"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, User, Menu, X, Heart, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

function HeaderContent() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = React.useState(searchParams?.get('search') || '')
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()
  const { language, toggleLanguage, t } = useLanguage()

  const getLanguageSwitchUrl = () => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (language === 'ar') {
      params.set('lang', 'en')
    } else {
      params.delete('lang')
    }
    const query = params.toString()
    return `${pathname}${query ? `?${query}` : ''}`
  }

  React.useEffect(() => {
    queueMicrotask(() => setSearchQuery(searchParams?.get('search') || ''))
  }, [searchParams])

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsMenuOpen(false)
    }
  }

  const isRtl = language === 'ar'

  return (
    <>
      <header data-nosnippet className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "shadow-lg" : ""
      )}>
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-2 xs:px-4">
            {/* Top bar */}
            <div className="flex items-center justify-between py-3 md:py-4 gap-1.5 xs:gap-4">

              {/* Menu (Mobile), Logo, Nav Links (Desktop) */}
              <div className="flex items-center gap-2 xs:gap-4 xl:gap-8">
                {/* Menu (Mobile) */}
                <div className="flex items-center lg:hidden">
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    aria-label={language === 'ar' ? "فتح القائمة الرئيسية" : "Open Main Menu"}
                    className="w-11 h-11 flex items-center justify-center text-primary hover:bg-primary/5 rounded-full transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>

                {/* Logo */}
                <Link href="/" aria-label="The VitaHub Homepage" className="flex items-center flex-shrink-0 relative select-none">
                  <Image
                    src="/logo-header.jpg"
                    alt="The VitaHub Logo"
                    width={140}
                    height={56}
                    className="h-10 xs:h-12 md:h-14 w-auto object-contain"
                    priority
                  />
                </Link>

                {/* Nav Links (Desktop) */}
                <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] font-medium tracking-tight">
                  <Link href="/categories" className="relative group text-primary whitespace-nowrap transition-all duration-300 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {t('nav_categories')}
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/products" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    {t('nav_products')}
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/offers" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    {t('nav_offers')}
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/brands" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    {t('nav_brands')}
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/health-tips" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    {t('nav_health_tips')}
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/order-status" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    {t('nav_track_order')}
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/bmi-calculator" className="bg-secondary text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                    {t('nav_bmi')}
                  </Link>
                </nav>
              </div>

              {/* Search Bar (Desktop) */}
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs xl:max-w-md relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  aria-label={language === 'ar' ? "ابحث عن المكملات والفيتامينات" : "Search for supplements and vitamins"}
                  className="w-full h-11 bg-accent border-none rounded-full px-5 pr-12 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <button type="submit" aria-label="Search" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer">
                  <Search size={18} />
                </button>
              </form>

              {/* Left Side: Actions */}
              <div className="flex items-center gap-1.5 xs:gap-2 md:gap-4 flex-shrink-0">
                {/* Language Switcher - Link for SEO Crawling */}
                <Link
                  href={getLanguageSwitchUrl()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-[11px] font-black text-slate-700 cursor-pointer"
                  aria-label="Language switcher"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>{language === 'ar' ? 'EN' : 'العربية'}</span>
                </Link>

                {user ? (
                  <Link href="/profile" className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                    <div className="w-7 h-7 xs:w-8 xs:h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-none">
                      <span className="text-[10px] text-slate-450">{t('hello')} {user.name?.split(' ')[0]}</span>
                      <span className="text-sm font-bold text-foreground">{t('my_account')}</span>
                    </div>
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                    <User className="w-5 h-5 xs:w-6 xs:h-6" />
                    <div className="hidden lg:flex flex-col items-start leading-none">
                      <span className="text-[10px] text-muted">{t('welcome')}</span>
                      <span className="text-sm font-bold text-foreground">{t('login_register')}</span>
                    </div>
                  </Link>
                )}

                <Link href="/wishlist" aria-label={t('wishlist')} className="hidden md:flex relative p-2 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                  <Heart size={22} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link href="/cart" aria-label={`${t('cart')} (${cartCount})`} className="relative w-11 h-11 flex items-center justify-center bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-all">
                  <ShoppingCart className="w-5 h-5 xs:w-6 xs:h-6" aria-hidden="true" />
                  {cartCount > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 bg-black text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                      aria-hidden="true"
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  aria-label={language === 'ar' ? "ابحث عن المنتجات" : "Search products"}
                  className="w-full h-10 bg-accent border-none rounded-lg px-4 pr-10 text-sm"
                />
                <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer">
                  <Search size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-sm lg:hidden transition-opacity duration-500"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRtl ? '100%' : '-100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={cn(
                "absolute top-0 bottom-0 w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl border-slate-100 shadow-2xl flex flex-col text-slate-800 overflow-hidden",
                isRtl ? "right-0 border-l" : "left-0 border-r"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative background blobs */}
              <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

              {/* Drawer Header */}
              <div className="p-4 xs:p-6 flex items-center justify-between border-b border-[#e8f0ed] relative z-10">
                <Link href="/" aria-label="Home" onClick={() => setIsMenuOpen(false)} className="flex items-center select-none relative">
                  <Image
                    src="/logo-header.jpg"
                    alt="The VitaHub Logo"
                    width={120}
                    height={48}
                    className="h-10 xs:h-12 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-11 h-11 flex items-center justify-center bg-gray-50 border border-gray-100 text-slate-500 hover:text-slate-900 rounded-full hover:scale-105 hover:bg-gray-100 active:scale-95 transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-6 xs:py-8 px-3 xs:px-5 relative z-10 space-y-4 xs:space-y-6">
                <div className="text-[10px] font-black text-slate-600 tracking-widest uppercase mb-2 px-2">
                  {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      href: "/categories",
                      label: t('nav_categories'),
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
                          <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                        </svg>
                      ),
                      style: "bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10",
                      badge: null
                    },
                    {
                      href: "/products",
                      label: language === 'ar' ? "المنتجات" : "Products",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                          <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                      ),
                      style: "hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900",
                      badge: null
                    },
                    {
                      href: "/offers",
                      label: language === 'ar' ? "العروض والخصومات" : "Offers & Discounts",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
                        </svg>
                      ),
                      style: "hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900",
                      badge: { text: language === 'ar' ? "خصم ناري" : "Hot Discount", color: "bg-red-50 text-red-500 border border-red-100" }
                    },
                    {
                      href: "/brands",
                      label: language === 'ar' ? "الماركات" : "Brands",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      ),
                      style: "hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900",
                      badge: null
                    },
                    {
                      href: "/health-tips",
                      label: language === 'ar' ? "نصائح صحية" : "Health Tips",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                          <path d="M6 6h10M6 10h10"/>
                        </svg>
                      ),
                      style: "hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900",
                      badge: null
                    },
                    {
                      href: "/order-status",
                      label: language === 'ar' ? "تتبع الطلب" : "Track Order",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="16" height="8" x="2" y="6" rx="2"/>
                          <path d="M22 18H2a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z"/>
                          <path d="M17 14h.01"/><path d="M20 18v2a2 2 0 0 1-2-2H6a2 2 0 0 1-2-2v-2"/>
                        </svg>
                      ),
                      style: "hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-900",
                      badge: null
                    },
                    {
                      href: "/bmi-calculator",
                      label: language === 'ar' ? "حاسبة BMI" : "BMI Calculator",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      ),
                      style: "bg-cyan-500/5 text-cyan-600 border border-cyan-500/10 hover:bg-cyan-500/10",
                      badge: { text: language === 'ar' ? "ذكاء اصطناعي" : "AI Powered", color: "bg-cyan-50 text-cyan-600 border border-cyan-100" }
                    }
                  ].map((link, i) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
                    const activeClass = isActive 
                      ? (link.href === '/bmi-calculator' 
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 border border-transparent' 
                          : 'bg-primary text-white shadow-lg shadow-primary/20 border border-transparent')
                      : link.style

                    return (
                      <Link
                        key={i}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-3 xs:p-4 rounded-2xl font-black text-xs xs:text-sm transition-all duration-300 active:scale-[0.98]",
                          activeClass
                        )}
                      >
                        <div className="flex items-center gap-2 xs:gap-3.5">
                          <div className="shrink-0 opacity-90 scale-90 xs:scale-100">{link.icon}</div>
                          <span className="truncate">{link.label}</span>
                        </div>
                        {link.badge && (
                          <span 
                            className={cn(
                              "text-[8px] xs:text-[9px] font-black px-1.5 py-0.5 rounded-full border flex-shrink-0 transition-all duration-300", 
                              isActive 
                                ? "bg-white/20 text-white border-white/10" 
                                : link.badge.color
                            )}
                          >
                            {link.badge.text}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 xs:p-6 border-t border-[#e8f0ed] bg-gray-50/50 relative z-10 flex flex-col gap-3">
                {/* Mobile Drawer Language switcher - Link for SEO Crawling */}
                <Link
                  href={getLanguageSwitchUrl()}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-2xl font-black text-xs xs:text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                >
                  <Globe size={18} className="text-primary" />
                  {language === 'ar' ? 'English' : 'العربية'}
                </Link>

                <div className="flex flex-col gap-3 xs:gap-4">
                  {user ? (
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 xs:py-4 rounded-2xl font-black text-xs xs:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      <div className="w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] xs:text-xs font-black flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{user.name} - {language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 xs:py-4 rounded-2xl font-black text-xs xs:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" x2="3" y1="12" y2="12"/>
                      </svg>
                      {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Header() {
  return (
    <React.Suspense fallback={<div className="h-[76px] bg-white border-b border-border w-full" />}>
      <HeaderContent />
    </React.Suspense>
  )
}
