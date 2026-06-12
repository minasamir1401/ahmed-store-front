"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Loader2, Sparkles, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useModal } from '@/context/ModalContext'
import { useLanguage } from '@/context/LanguageContext'

export default function ForgotPasswordPage() {
  const { showAlert } = useModal()
  const { t, dir, language } = useLanguage()
  const [step, setStep] = useState(1) // 1: Enter Phone, 2: Enter OTP + New PW, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cleanPhone = formData.phone.trim()
    if (!cleanPhone) {
      setError(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })

      const data = await res.json()

      if (res.ok) {
        setStep(2)
      } else {
        setError(data.error || (language === 'ar' ? 'حدث خطأ ما أثناء إرسال الرمز' : 'An error occurred while sending the code'))
      }
    } catch (err) {
      setError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { phone, code, newPassword, confirmPassword } = formData

    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError(language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(language === 'ar' ? 'يجب ألا تقل كلمة المرور عن 6 أحرف' : 'Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
          newPassword: newPassword.trim()
        })
      })

      const data = await res.json()

      if (res.ok) {
        setStep(3)
      } else {
        setError(data.error || (language === 'ar' ? 'حدث خطأ أثناء إعادة تعيين كلمة المرور' : 'Error resetting password'))
      }
    } catch (err) {
      setError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const isRtl = language === 'ar'

  const features = [
    { 
      title: language === 'ar' ? 'تحقق فوري عبر واتساب' : 'Instant OTP via WhatsApp', 
      desc: language === 'ar' ? 'استلم رمز الـ OTP في ثوانٍ معدودة على رقمك الشخصي.' : 'Receive OTP in seconds on your personal number.' 
    },
    { 
      title: language === 'ar' ? 'حماية كاملة مشفرة' : 'Encrypted Protection', 
      desc: language === 'ar' ? 'تحديث كلمة المرور يتم عبر بروتوكولات آمنة بالكامل.' : 'Password reset executed via fully secure protocols.' 
    },
    { 
      title: language === 'ar' ? 'دعم فني متواصل' : 'Continuous Tech Support', 
      desc: language === 'ar' ? 'إذا واجهت أي مشكلة، يمكنك التواصل مع الدعم الفني فوراً.' : 'Reach out to our customer support if you face any issues.' 
    },
    { 
      title: language === 'ar' ? 'العودة للتسوق سريعاً' : 'Quick Return to Shop', 
      desc: language === 'ar' ? 'بمجرد تعيين كلمة المرور الجديدة، ستتمكن من إكمال طلباتك.' : 'Once complete, you can return to your shopping cart.' 
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8faf9] py-16 flex flex-col justify-center px-4 relative overflow-hidden" dir={dir}>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef2f0_1px,transparent_1px),linear-gradient(to_bottom,#eef2f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

        {/* Ambient glowing lights */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-[1100px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 items-center">
          
          {/* Left Column: Premium Branding & Value Propositions */}
          <div className={`lg:col-span-6 hidden lg:flex flex-col text-slate-800 space-y-8 ${isRtl ? 'pr-4 text-right' : 'pl-4 text-left'}`}>
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className={`inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-[#0f5c3e] ${isRtl ? '' : 'flex-row-reverse'}`}>
                <Sparkles size={14} className="text-primary" />
                <span>{language === 'ar' ? 'نظام الحماية والأمان الذكي' : 'Smart Security System'}</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-black leading-tight text-slate-900">
                {language === 'ar' ? (
                  <>استعادة الوصول إلى <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">حسابك بأمان</span></>
                ) : (
                  <>Recover Access to Your <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Account Safely</span></>
                )}
              </h2>
              <p className="text-slate-500 font-medium text-base leading-relaxed">
                {language === 'ar' 
                  ? 'نحن نهتم بأمان بياناتك. نقوم بإرسال رموز التحقق المؤقتة (OTP) مباشرة إلى هاتفك عبر الواتساب لضمان أنك أنت فقط من يمكنه تعديل كلمة المرور الخاصة به.'
                  : 'We care about your privacy and security. We send temporary One Time Passwords (OTP) via WhatsApp to ensure only you can manage your credentials.'}
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
                  <div className="bg-primary/10 text-primary p-2 rounded-xl">
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

          {/* Right Column: Premium Form Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-2xl font-black text-foreground">
                {t('forgot_heading')}
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

              {/* Title & Description */}
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
                  {step === 1 && t('forgot_heading')}
                  {step === 2 && (language === 'ar' ? 'أدخل الرمز المستلم' : 'Verify OTP')}
                  {step === 3 && (language === 'ar' ? 'تم التغيير بنجاح!' : 'Changed Successfully!')}
                </h2>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  {step === 1 && t('forgot_desc')}
                  {step === 2 && (language === 'ar' ? 'يرجى كتابة رمز OTP المستلم ثم تعيين كلمة المرور الجديدة' : 'Please enter the OTP code you received, then set your new password')}
                  {step === 3 && (language === 'ar' ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة والتمتع بخدماتنا' : 'You can now log in using your new credentials')}
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

              {/* Steps forms */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step-1-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSendOTP}
                    className="space-y-5"
                  >
                    {/* Phone Input */}
                    <div className="space-y-2">
                      <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'رقم الهاتف المسجل' : 'Registered Phone Number'}</label>
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
                    </div>

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
                          <span>{language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}</span>
                          <ArrowRight size={16} className={`flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form
                    key="step-2-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleResetPassword}
                    className="space-y-5"
                  >
                    {/* OTP Code Input */}
                    <div className="space-y-2">
                      <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'رمز التحقق المستلم (OTP)' : 'Verification Code (OTP)'}</label>
                      <div className="relative group">
                        <input
                          name="code"
                          type="text"
                          required
                          maxLength={6}
                          placeholder="******"
                          value={formData.code}
                          onChange={handleInputChange}
                          className="w-full h-12 bg-white/40 border border-slate-200/60 rounded-2xl px-11 pr-5 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center text-sm font-black tracking-widest group-hover:border-slate-300"
                        />
                        <KeyRound className={`absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                      </div>
                    </div>

                    {/* New Password Input */}
                    <div className="space-y-2">
                      <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                      <div className="relative group">
                        <input
                          name="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={formData.newPassword}
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
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                      <label className={`block text-[11px] font-black text-slate-500 uppercase tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                      <div className="relative group">
                        <input
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full h-12 bg-white/40 border border-slate-200/60 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm font-semibold group-hover:border-slate-300 ${isRtl ? 'px-11 pr-11 text-right' : 'px-11 pl-11 text-left'}`}
                        />
                        <Lock className={`absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                      </div>
                    </div>

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
                          <span>{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</span>
                          <ArrowRight size={16} className={`flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-xs font-bold text-[#0f5c3e] leading-relaxed">
                      {language === 'ar' 
                        ? 'تم تعديل كلمة المرور بنجاح تام! يمكنك الآن استخدام البيانات الجديدة لتسجيل الدخول إلى حسابك.'
                        : 'Your password was changed successfully! You can now use your new password to sign into your account.'}
                    </div>

                    <Link href="/login" className="block w-full">
                      <button className="w-full h-12 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer">
                        <span>{language === 'ar' ? 'تسجيل الدخول الآن' : 'Log In Now'}</span>
                        <ArrowRight size={16} className={`flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom return to login link */}
              <div className="text-center mt-6">
                <Link href="/login" className="text-xs font-black text-slate-400 hover:text-primary transition-colors">
                  {t('forgot_back')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
