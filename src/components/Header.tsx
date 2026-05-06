"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, User, Menu, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { X, Heart } from 'lucide-react'

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "shadow-lg" : ""
      )}>
        {/* Top Promo Bar */}
        <div className="bg-primary text-white text-center py-2 text-xs font-bold tracking-wide">
          🚚 شحن مجاني للطلبات فوق 200 ج.م &nbsp;|&nbsp; 🎁 خصم 10% على أول طلب — كود: <span className="bg-white/20 px-2 py-0.5 rounded-full">WELCOME10</span>
        </div>
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4">
            {/* Top bar */}
            <div className="flex items-center justify-between py-3 md:py-4 gap-4">

              {/* Right Side: Menu (Mobile), Logo, Nav Links (Desktop) */}
              <div className="flex items-center gap-4 xl:gap-8">
                {/* Menu (Mobile) */}
                <div className="flex items-center gap-2 lg:hidden">
                  <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors"
                  >
                    <Menu size={24} />
                  </button>
                </div>

                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/logo-v2.png"
                    alt="Mithaly Logo"
                    width={200}
                    height={80}
                    className="h-14 md:h-20 w-auto object-contain"
                    priority
                  />
                </Link>

                {/* Nav Links (Desktop) */}
                <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] font-medium tracking-tight">
                  <Link href="/categories" className="relative group text-primary whitespace-nowrap transition-all duration-300 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    تصفح الأقسام
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/products" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    المنتجات
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/offers" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    العروض
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/brands" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    الماركات
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/health-tips" className="relative group text-foreground/70 hover:text-primary transition-all duration-300 whitespace-nowrap">
                    نصائح صحية
                    <span className="absolute bottom-[-6px] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link href="/bmi-calculator" className="bg-secondary text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                    حاسبة BMI
                  </Link>
                </nav>
              </div>

              {/* Search Bar (Desktop) */}
              <div className="hidden md:flex flex-1 max-w-xs xl:max-w-md relative">
                <input
                  type="text"
                  placeholder="عن ماذا تبحث؟"
                  className="w-full h-11 bg-accent border-none rounded-full px-5 pr-12 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              </div>

              {/* Left Side: Actions */}
              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <div className="hidden xl:flex items-center gap-2 text-sm text-muted border-l pl-4 cursor-pointer hover:text-primary transition-colors">
                  <div className="text-right">
                    <div className="text-[10px] text-muted">التوصيل إلى</div>
                    <div className="font-medium text-foreground">القاهرة، مصر</div>
                  </div>
                  <MapPin size={20} className="text-primary" />
                </div>

                <Link href="/login" className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                  <User size={24} />
                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-[10px] text-muted">مرحباً بك</span>
                    <span className="text-sm font-bold text-foreground">تسجيل الدخول</span>
                  </div>
                </Link>

                <Link href="/wishlist" className="hidden md:flex relative p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                  <Heart size={22} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link href="/cart" className="relative p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-all">
                  <ShoppingCart size={22} />
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                </Link>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="عن ماذا تبحث؟"
                  className="w-full h-10 bg-accent border-none rounded-lg px-4 pr-10 text-sm"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black/50 lg:hidden transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: isMenuOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 flex items-center justify-between border-b">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image src="/logo-v2.png" alt="Logo" width={120} height={40} className="h-10 w-auto object-contain" />
            </Link>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-accent rounded-full text-muted">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-4">
              <Link href="/categories" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 text-primary font-bold">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                تصفح الأقسام
              </Link>
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent transition-colors font-bold text-foreground/80">
                منتجاتنا
              </Link>
              <Link href="/offers" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent transition-colors font-bold text-foreground/80">
                أحدث العروض
              </Link>
              <Link href="/brands" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent transition-colors font-bold text-foreground/80">
                تسوق بالماركة
              </Link>
              <Link href="/health-tips" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent transition-colors font-bold text-foreground/80">
                نصائح صحية
              </Link>
              <Link href="/bmi-calculator" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 text-black font-bold">
                حاسبة مؤشر كتلة الجسم (BMI)
              </Link>
            </div>
          </nav>

          <div className="p-6 border-t bg-accent/30">
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                <User size={20} />
                تسجيل الدخول / إنشاء حساب
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
