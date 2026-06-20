"use client"

import React, { useCallback, useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Loader2, Sparkles, ShieldCheck, User } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void; locale?: string }) => void
          renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void
        }
      }
    }
  }
}

function LoginContent() {
  const router = useRouter()
  const { t, dir, language } = useLanguage()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/profile'
  const { login: saveAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [runtimeGoogleClientId, setRuntimeGoogleClientId] = useState('')
  const [error, setError] = useState('')
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || runtimeGoogleClientId

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        saveAuth(data.token, data.user)
        router.push(redirectUrl)
      } else {
        setError(data.error || (language === 'ar' ? 'حدث خطأ ما' : 'Something went wrong'))
      }
    } catch {
      setError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleCredential = useCallback(async (credential?: string) => {
    if (!credential) {
      setError(language === 'ar' ? 'تعذر قراءة بيانات حساب جوجل' : 'Could not read Google account details')
      return
    }

    setGoogleLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })

      const data = await res.json()

      if (res.ok) {
        saveAuth(data.token, data.user)
        router.push(redirectUrl)
      } else {
        setError(data.error || (language === 'ar' ? 'فشل التسجيل باستخدام جوجل' : 'Google sign-in failed'))
      }
    } catch {
      setError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server')
    } finally {
      setGoogleLoading(false)
    }
  }, [language, redirectUrl, router, saveAuth])

  const googleButtonText = isLogin
    ? (language === 'ar' ? 'الدخول باستخدام جوجل' : 'Sign in with Google')
    : (language === 'ar' ? 'التسجيل باستخدام جوجل' : 'Sign up with Google')

  const renderGoogleButton = useCallback(() => {
    if (!googleClientId || !window.google?.accounts?.id) return

    const container = document.getElementById('google-signin-button')
    if (!container) return

    container.innerHTML = ''
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: ({ credential }) => handleGoogleCredential(credential),
      locale: language
    })
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: isLogin ? 'signin_with' : 'signup_with',
      logo_alignment: 'center',
      width: Math.min(container.getBoundingClientRect().width || 320, 320)
    })
  }, [googleClientId, handleGoogleCredential, isLogin, language])

  useEffect(() => {
    renderGoogleButton()
  }, [renderGoogleButton])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return

    let cancelled = false
    fetch('/api/auth/google-config')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled && typeof data?.clientId === 'string') {
          setRuntimeGoogleClientId(data.clientId)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const isRtl = language === 'ar'

  const features = [
    { 
      title: language === 'ar' ? 'ضمان أصالة المنتجات 100%' : '100% Authentic Guarantee', 
      desc: language === 'ar' ? 'جميع منتجاتنا مستوردة ومرخصة مباشرة.' : 'All our supplements are imported and certified.' 
    },
    { 
      title: language === 'ar' ? 'شحن سريع وموثوق' : 'Fast & Reliable Shipping', 
      desc: language === 'ar' ? 'توصيل لباب منزلك مع خيارات دفع مرنة.' : 'Doorstep delivery with flexible payments.' 
    },
    { 
      title: language === 'ar' ? 'استشارات مجانية مخصصة' : 'Free Expert Consultation', 
      desc: language === 'ar' ? 'فريق طبي ورياضي متكامل لمساعدتك.' : 'Specialized medical and fitness team support.' 
    },
    { 
      title: language === 'ar' ? 'نقاط مكافآت حصرية' : 'Exclusive Reward Points', 
      desc: language === 'ar' ? 'اجمع نقاطاً مع كل عملية شراء واستبدلها.' : 'Earn reward points and save on checkout.' 
    }
  ]

  return (
    <>
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={renderGoogleButton}
        />
      )}
      <Header />
      <main className="min-h-screen bg-[#f8faf9] py-16 flex flex-col justify-center px-4 relative overflow-hidden" dir={dir}>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef2f0_1px,transparent_1px),linear-gradient(to_bottom,#eef2f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

        {/* Ambient premium glowing lights */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />

        <div className="max-w-[1100px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 items-center">
          
          {/* Left Column: Premium Branding & Value Propositions (visible on large screens) */}
          <div className={`lg:col-span-6 hidden lg:flex flex-col text-slate-800 space-y-8 ${isRtl ? 'pr-4 text-right' : 'pl-4 text-left'}`}>
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className={`inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-primary ${isRtl ? '' : 'flex-row-reverse'}`}>
                <Sparkles size={14} className="animate-spin-slow" />
                <span>{language === 'ar' ? 'عالم الصحة والتميز الرياضي' : 'World of Health & Athletic Excellence'}</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-black leading-tight text-slate-900">
                {language === 'ar' ? (
                  <>شريكك الأقوى في رحلتك نحو <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">الرشاقة والصحة</span></>
                ) : (
                  <>Your Strongest Partner for <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Health & Fitness</span></>
                )}
              </h2>
              <p className="text-slate-500 font-medium text-base leading-relaxed">
                {language === 'ar' 
                  ? 'انضم إلى أكثر من 50,000 عميل يثقون في مكملاتنا الغذائية الأصلية 100%. سجل دخولك الآن لمتابعة طلباتك، وإدارة سلتك، والحصول على عروض مخصصة لأهدافك.'
                  : 'Join over 50,000 customers trusting our 100% original dietary supplements. Login now to track your orders, manage your cart, and get customized offers.'}
              </p>
            </motion.div>

            {/* Features lists */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {features.map((feat, idx) => (
                <div key={idx} className={`bg-white/60 border border-[#e8f0ed]/60 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm shadow-sm transition-all hover:border-primary/20 hover:bg-white/80 group ${isRtl ? '' : 'flex-row-reverse'}`}>
                  <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <ShieldCheck size={18} />
                  </div>
                  <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h4 className="font-black text-slate-900 text-xs xl:text-sm">{feat.title}</h4>
                    <p className="text-[11px] xl:text-xs text-slate-500 font-medium">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Premium Login Form Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="text-center mb-8 lg:hidden">
              <div className="text-2xl font-black text-primary leading-none uppercase tracking-wider font-[Outfit] mb-2 flex justify-center items-center gap-1" dir="ltr">
                <span>VITAMINS</span> <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent px-0.5 rounded-md border border-emerald-500/10 shadow-sm shadow-emerald-500/5">HUB</span>
              </div>
              <h1 className="text-2xl font-black text-foreground">
                {isLogin ? t('login_heading') : t('register_heading')}
              </h1>
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(46,125,94,0.08)] p-6 sm:p-10 border border-white/60 relative overflow-hidden"
            >
              {/* Premium Gradient Top Border Accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              {/* Segmented Controller Tab Switcher */}
              <div className={`bg-slate-100/70 p-1.5 rounded-2xl flex items-center mb-8 relative border border-slate-200/30 ${isRtl ? '' : 'flex-row-reverse'}`}>
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-colors duration-300 relative z-10 ${
                    isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isLogin && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md shadow-primary/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {t('login_heading')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-colors duration-300 relative z-10 ${
                    !isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {!isLogin && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md shadow-primary/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {language === 'ar' ? 'حساب جديد' : 'Register'}
                </button>
              </div>

              {/* Card Title & Description inside card */}
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
                  {isLogin ? (language === 'ar' ? 'مرحباً بك مجدداً' : 'Welcome Back') : (language === 'ar' ? 'انضم لعائلتنا اليوم' : 'Join Our Family Today')}
                </h2>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  {isLogin ? (language === 'ar' ? 'أدخل تفاصيل حسابك للبدء فوراً' : 'Enter your account details to start instantly') : (language === 'ar' ? 'سجل حسابك بخطوات بسيطة وتابع تسوقك' : 'Register your account in simple steps and start shopping')}
                </p>
              </div>

              {/* Error Alert Panel */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100/60 flex items-center gap-2.5 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Form */}
              <div className="space-y-4 mb-6">
                {googleClientId ? (
                  <div className="relative min-h-12 flex items-center justify-center" aria-label={googleButtonText}>
                    <div id="google-signin-button" className={googleLoading ? 'pointer-events-none opacity-50' : ''} />
                    {googleLoading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-500 text-xs font-black">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="mx-2">{language === 'ar' ? 'جاري الدخول...' : 'Signing in...'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center text-[11px] font-bold text-amber-700">
                    {language === 'ar' ? 'أضف NEXT_PUBLIC_GOOGLE_CLIENT_ID لتفعيل التسجيل السريع بجوجل.' : 'Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable quick Google sign-up.'}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {language === 'ar' ? 'أو' : 'or'}
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      key="register-name"
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5"
                    >
                      {/* Name input */}
                      <div className="space-y-2">
                        <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{t('register_name')}</label>
                        <div className="relative group">
                          <input
                            name="name"
                            type="text"
                            required
                            placeholder={language === 'ar' ? "أحمد محمد..." : "John Doe..."}
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full h-12 bg-white/40 border border-slate-200/60 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm font-semibold group-hover:border-slate-300 ${isRtl ? 'px-11 pr-5 text-right' : 'px-11 pl-5 text-left'}`}
                          />
                          <User className={`absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Phone input - ALWAYS SHOWN */}
                  <motion.div key="phone-field" className="space-y-2" layout>
                    <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{t('track_phone_label')}</label>
                    <div className="relative group">
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="012XXXXXXXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full h-12 bg-white/40 border border-slate-200/60 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm font-semibold group-hover:border-slate-300 ${isRtl ? 'px-11 pr-5 text-right' : 'px-11 pl-5 text-left'}`}
                      />
                      <Phone className={`absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                    </div>
                  </motion.div>

                  {/* Email Input - ONLY ON REGISTER */}
                  {!isLogin && (
                    <motion.div
                      key="register-email"
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2"
                      layout
                    >
                      <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{t('login_email')}</label>
                      <div className="relative group">
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="example@mail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full h-12 bg-white/40 border border-slate-200/60 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm font-semibold group-hover:border-slate-300 ${isRtl ? 'px-11 pr-5 text-right' : 'px-11 pl-5 text-left'}`}
                        />
                        <Mail className={`absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                      </div>
                    </motion.div>
                  )}

                  {/* Password Input */}
                  <motion.div key="password-field" className="space-y-2" layout>
                    <div className={`flex items-center justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">{t('login_password')}</label>
                      {isLogin && (
                        <Link href="/forgot" className="text-[10px] font-black text-primary hover:underline transition-all">
                          {language === 'ar' ? 'نسيت كلمة السر؟' : 'Forgot Password?'}
                        </Link>
                      )}
                    </div>
                    <div className="relative group">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full h-12 bg-white/40 border border-slate-200/60 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm font-semibold group-hover:border-slate-300 ${isRtl ? 'px-11 pr-11 text-right' : 'px-11 pl-11 text-left'}`}
                      />
                      <Lock className={`absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors ${isRtl ? 'right-4' : 'left-4'}`}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Submit Action */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01, translateY: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full h-12 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 mt-6 disabled:opacity-50 cursor-pointer ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>{isLogin ? t('login_btn') : t('register_btn')}</span>
                      <ArrowRight size={16} className={`flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Bottom agreement disclaimer on register */}
              {!isLogin && (
                <p className="text-[10px] text-center text-slate-400 leading-relaxed mt-6">
                  {language === 'ar' ? (
                    <>بالتسجيل، أنت توافق على <Link href="/shipping" className="underline hover:text-slate-600">شروط الخدمة</Link> و <Link href="/returns" className="underline hover:text-slate-600">سياسة الخصوصية</Link> لـ The VitaHub.</>
                  ) : (
                    <>By registering, you agree to The VitaHub&apos;s <Link href="/shipping" className="underline hover:text-slate-600">Terms of Service</Link> & <Link href="/returns" className="underline hover:text-slate-600">Privacy Policy</Link>.</>
                  )}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function LoginPage() {
  const { language } = useLanguage()

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted font-bold text-sm">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
