"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Phone, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login: saveAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        router.push('/profile')
      } else {
        setError(data.error || 'حدث خطأ ما')
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12 flex flex-col justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block p-6 bg-white rounded-[2.5rem] shadow-xl mb-6"
            >
              <div className="text-5xl font-bold text-primary italic leading-none">
                MITHALY
              </div>
            </motion.div>
            <h1 className="text-3xl font-black text-foreground">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-slate-100"
          >
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100">
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">الاسم بالكامل</label>
                    <div className="relative">
                      <input 
                        name="name"
                        type="text" 
                        required
                        placeholder="أدخل اسمك" 
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-xl px-12 focus:border-primary focus:bg-white transition-all outline-none"
                      />
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <input 
                        name="phone"
                        type="tel" 
                        required
                        placeholder="012XXXXXXXX" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-xl px-12 focus:border-primary focus:bg-white transition-all outline-none"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="example@mail.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-xl px-12 focus:border-primary focus:bg-white transition-all outline-none"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-foreground">كلمة المرور</label>
                </div>
                <div className="relative">
                  <input 
                    name="password"
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-xl px-12 focus:border-primary focus:bg-white transition-all outline-none"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 mt-4 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
                {!loading && <ArrowRight size={20} className="mr-2 rotate-180" />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="mr-2 font-black text-primary hover:underline"
                >
                  {isLogin ? 'أنشئ حساباً الآن' : 'سجل دخولك'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
