"use client"

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, RefreshCw, Info, Sparkles, Brain, ArrowRight, CheckCircle2, ChevronLeft, Target, Activity, Heart, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function BMICalculator() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [result, setResult] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const [aiAdvice, setAiAdvice] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const calculateBMI = async () => {
    if (weight && height) {
      const h = parseFloat(height) / 100
      const w = parseFloat(weight)
      const bmi = w / (h * h)
      const finalBmi = parseFloat(bmi.toFixed(1))
      setResult(finalBmi)
      
      let currentStatus = ''
      if (bmi < 18.5) currentStatus = 'نقص في الوزن'
      else if (bmi < 25) currentStatus = 'وزن مثالي'
      else if (bmi < 30) currentStatus = 'زيادة في الوزن'
      else currentStatus = 'سمنة'
      
      setStatus(currentStatus)
      getAIAdvice(finalBmi, currentStatus)
    }
  }

  const getAIAdvice = async (bmi: number, status: string) => {
    setIsLoadingAI(true)
    setAiAdvice('')
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [
            {
              role: "system",
              content: "أنت خبير تغذية ورياضة مصري صريح وموجز جداً. قدم نصيحة احترافية ومختصرة بناءً على مؤشر كتلة الجسم. ممنوع الكلام الكتير أو الجداول. ردك لازم يكون في 5 أسطر فقط كحد أقصى، يشمل: تقييم سريع للحالة، حل للمشكلة إن وجدت، واقتراح لمكمل غذائي واحد مفيد."
            },
            {
              role: "user",
              content: `بياناتي: طول ${height}، وزن ${weight}، عمر ${age}، جنس ${gender}. مؤشر BMI هو ${bmi} وحالتي هي ${status}. قولي المختصر المفيد في 5 سطور بالظبط.`
            }
          ]
        })
      })
      const data = await response.json()
      if (data.choices && data.choices[0]) {
        setAiAdvice(data.choices[0].message.content)
      } else {
        throw new Error(data.error?.message || "Invalid response from AI")
      }
    } catch (error) {
      console.error("AI Error:", error)
      setAiAdvice("عذراً، الخبير الذكي غير متاح حالياً. يرجى التأكد من اتصالك بالإنترنت أو المحاولة لاحقاً.")
    } finally {
      setIsLoadingAI(false)
    }
  }

  const reset = () => {
    setWeight('')
    setHeight('')
    setAge('')
    setResult(null)
    setStatus('')
    setAiAdvice('')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-32">
        
        {/* Hero Section */}
        <div className="relative bg-white pt-16 pb-24 overflow-hidden border-b border-[#e8f0ed]">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2e7d5e 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                <Sparkles size={14} /> مدعوم بالذكاء الاصطناعي
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 leading-tight">
                حاسبة الوزن <span className="text-primary">الذكية</span>
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                ليس مجرد رقم، بل رحلة صحية متكاملة. احصل على تحليلك الخاص ونصائح مخصصة لك من خبيرنا الذكي.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input Side */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[3rem] shadow-xl p-8 border border-[#e8f0ed] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] -mr-16 -mt-16" />
                
                <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <Calculator className="text-primary" size={24} />
                  بياناتك الصحية
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setGender('male')}
                      className={`h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${gender === 'male' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                    >
                      ذكر
                    </button>
                    <button 
                      onClick={() => setGender('female')}
                      className={`h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${gender === 'female' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                    >
                      أنثى
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase mr-1">العمر</label>
                    <input 
                      type="number" 
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="مثال: 25"
                      className="w-full h-14 bg-gray-50 rounded-2xl px-6 text-lg font-bold border border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase mr-1">الوزن (كجم)</label>
                      <input 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="70"
                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 text-lg font-bold border border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase mr-1">الطول (سم)</label>
                      <input 
                        type="number" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 text-lg font-bold border border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={calculateBMI}
                      disabled={!weight || !height}
                      className="flex-1 bg-gray-900 text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      تحليل النتائج 
                      <ArrowRight size={20} className="group-hover:translate-x-[-5px] transition-transform rotate-180" />
                    </button>
                    <button 
                      onClick={reset}
                      className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-[#2e7d5e] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                 <Activity className="absolute bottom-[-20px] left-[-20px] w-40 h-40 opacity-10" />
                 <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                   <Shield size={20} /> لماذا تهتم بالـ BMI؟
                 </h4>
                 <p className="text-white/80 text-sm leading-relaxed">
                   يعد مؤشر كتلة الجسم أداة قياس عالمية لتقييم تناسب الوزن مع الطول، وهو الخطوة الأولى في الكشف عن المخاطر الصحية المرتبطة بالوزن الزائد أو الناقص.
                 </p>
              </div>
            </div>

            {/* Result Side */}
            <div className="lg:col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div 
                    key="result-display"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Main Score */}
                    <div className="bg-white rounded-[3rem] p-10 border border-[#e8f0ed] shadow-sm text-center space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                      <div className="space-y-1">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">مؤشر كتلة جسمك</span>
                        <div className="text-8xl font-black text-gray-900 tracking-tighter">{result}</div>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-sm ${
                        status === 'وزن مثالي' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <CheckCircle2 size={16} />
                        {status}
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-8">
                        <div className={`h-2 rounded-full ${result < 18.5 ? 'bg-blue-500' : 'bg-gray-100'}`} />
                        <div className={`h-2 rounded-full ${result >= 18.5 && result < 25 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-100'}`} />
                        <div className={`h-2 rounded-full ${result >= 25 && result < 30 ? 'bg-amber-500' : 'bg-gray-100'}`} />
                        <div className={`h-2 rounded-full ${result >= 30 ? 'bg-red-500' : 'bg-gray-100'}`} />
                      </div>
                    </div>

                    {/* AI Advice Section */}
                    <div className="bg-white rounded-[3rem] p-10 border border-primary/20 shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4">
                          <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center">
                             <Brain size={24} />
                          </div>
                       </div>
                       
                       <h3 className="text-xl font-black text-gray-800 mb-6">توصيات الخبير الذكي</h3>
                       
                       {isLoadingAI ? (
                         <div className="space-y-4 py-8">
                            <div className="flex items-center gap-3 text-primary font-bold">
                               <Loader2 className="animate-spin" size={20} />
                               جاري تحليل بياناتك...
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
                            <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse" />
                         </div>
                       ) : (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="space-y-6"
                         >
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-gray-700 leading-relaxed whitespace-pre-line font-medium italic">
                               "{aiAdvice}"
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                  <div className="flex items-center gap-2 font-black text-xs text-gray-400">
                                     <Target size={14} className="text-primary" /> الهدف المقترح
                                  </div>
                                  <p className="font-bold text-sm text-gray-800">
                                    {status === 'وزن مثالي' ? 'الحفاظ على الكتلة العضلية وتطوير اللياقة' : 'الوصول تدريجياً لوزن صحي مستدام'}
                                  </p>
                               </div>
                               <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                  <div className="flex items-center gap-2 font-black text-xs text-gray-400">
                                     <Heart size={14} className="text-red-500" /> نصيحة الصحة العامة
                                  </div>
                                  <p className="font-bold text-sm text-gray-800">شرب 3 لتر ماء يومياً ونوم 8 ساعات</p>
                               </div>
                            </div>

                            <Link href="/shop">
                               <button className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                                  تسوق مكملات تدعم هدفك
                                  <ChevronLeft size={20} />
                               </button>
                            </Link>
                         </motion.div>
                       )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 text-gray-400 space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                       <Calculator size={40} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-800">بانتظار بياناتك</h3>
                      <p className="text-sm">أدخل طولك ووزنك لنقوم بالتحليل الذكي فوراً</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
