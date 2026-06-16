"use client"

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, RefreshCw, Info, Sparkles, Brain, ArrowRight, CheckCircle2, ChevronLeft, Target, Activity, Heart, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function BMICalculatorClient() {
  const { t, dir, language } = useLanguage()
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
      if (bmi < 18.5) currentStatus = t('bmi_underweight')
      else if (bmi < 25) currentStatus = t('bmi_normal')
      else if (bmi < 30) currentStatus = t('bmi_overweight')
      else currentStatus = t('bmi_obese')
      
      setStatus(currentStatus)
      getAIAdvice(finalBmi, currentStatus)
    }
  }

  const getAIAdvice = async (bmi: number, statusText: string) => {
    setIsLoadingAI(true)
    setAiAdvice('')
    try {
      const response = await fetch("/api/ai/bmi-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bmi,
          statusText,
          height,
          weight,
          age,
          gender,
          language
        })
      })
      const data = await response.json()
      if (response.ok && data.advice) {
        setAiAdvice(data.advice)
      } else {
        throw new Error(data.error || "Invalid response from AI")
      }
    } catch (error) {
      console.error("AI Error:", error)
      setAiAdvice(language === 'ar' 
        ? "عذراً، الخبير الذكي غير متاح حالياً. يرجى التأكد من اتصالك بالإنترنت أو المحاولة لاحقاً." 
        : "Sorry, the smart AI advisor is currently unavailable. Please verify your connection or try again later.")
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

  const isRtl = language === 'ar'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7fbf9] pb-32" dir={dir}>
        
        {/* Hero Section */}
        <div className="relative bg-white pt-16 pb-24 overflow-hidden border-b border-[#e8f0ed]">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2e7d5e 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                <Sparkles size={14} /> {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered'}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 leading-tight">
                {t('bmi_heading').split(' (BMI)')[0]} <span className="text-primary">{language === 'ar' ? 'الذكية' : 'Calculator'}</span>
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto text-sm xs:text-base md:text-lg">
                {language === 'ar'
                  ? 'ليس مجرد رقم، بل رحلة صحية متكاملة. احصل على تحليلك الخاص ونصائح مخصصة لك من خبيرنا الذكي.'
                  : 'Not just a number, but a complete health journey. Get your custom analysis and personalized tips from our smart expert.'}
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
                
                <h3 className={`text-xl font-black text-gray-800 mb-8 flex items-center gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <Calculator className="text-primary" size={24} />
                  {language === 'ar' ? 'بياناتك الصحية' : 'Your Health Details'}
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setGender('male')}
                      className={`h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all cursor-pointer ${gender === 'male' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                    >
                      {t('bmi_male')}
                    </button>
                    <button 
                      onClick={() => setGender('female')}
                      className={`h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all cursor-pointer ${gender === 'female' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}
                    >
                      {t('bmi_female')}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className={`block text-[10px] font-black text-gray-400 uppercase ${isRtl ? 'text-right mr-1' : 'text-left ml-1'}`}>{t('bmi_age')}</label>
                    <input 
                      type="number" 
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={language === 'ar' ? "مثال: 25" : "e.g. 25"}
                      className={`w-full h-14 bg-gray-50 rounded-2xl px-6 text-lg font-bold border border-transparent focus:border-primary focus:bg-white transition-all outline-none ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-black text-gray-400 uppercase ${isRtl ? 'text-right mr-1' : 'text-left ml-1'}`}>{t('bmi_weight')}</label>
                      <input 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="70"
                        className={`w-full h-14 bg-gray-50 rounded-2xl px-6 text-lg font-bold border border-transparent focus:border-primary focus:bg-white transition-all outline-none ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-black text-gray-400 uppercase ${isRtl ? 'text-right mr-1' : 'text-left ml-1'}`}>{t('bmi_height')}</label>
                      <input 
                        type="number" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                        className={`w-full h-14 bg-gray-50 rounded-2xl px-6 text-lg font-bold border border-transparent focus:border-primary focus:bg-white transition-all outline-none ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={calculateBMI}
                      disabled={!weight || !height}
                      className="flex-1 bg-gray-900 text-white h-16 rounded-2xl font-black text-sm xs:text-lg flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      {t('bmi_calculate')}
                      <ArrowRight size={20} className={`transition-transform ${isRtl ? 'group-hover:translate-x-[-5px] rotate-180' : 'group-hover:translate-x-[5px]'}`} />
                    </button>
                    <button 
                      onClick={reset}
                      className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-[#2e7d5e] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                 <Activity className="absolute bottom-[-20px] left-[-20px] w-40 h-40 opacity-10" />
                 <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isRtl ? 'justify-start' : 'flex-row-reverse justify-end'}`}>
                   <Shield size={20} /> {language === 'ar' ? 'لماذا تهتم بالـ BMI؟' : 'Why care about BMI?'}
                 </h4>
                 <p className={`text-white/80 text-sm leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                   {language === 'ar'
                     ? 'يعد مؤشر كتلة الجسم أداة قياس عالمية لتقييم تناسب الوزن مع الطول، وهو الخطوة الأولى في الكشف عن المخاطر الصحية المرتبطة بالوزن الزائد أو الناقص.'
                     : 'Body Mass Index (BMI) is a universal measurement tool to assess weight relative to height, serving as the first step in identifying health risks related to underweight or overweight.'}
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
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('bmi_score_label')}</span>
                        <div className="text-8xl font-black text-gray-900 tracking-tighter">{result}</div>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-sm ${
                        status === t('bmi_normal') ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
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
                       <div className={`absolute top-0 p-4 ${isRtl ? 'right-0' : 'left-0'}`}>
                          <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center">
                             <Brain size={24} />
                          </div>
                       </div>
                       
                       <h3 className={`text-xl font-black text-gray-800 mb-6 mt-8 lg:mt-0 ${isRtl ? 'text-right' : 'text-left'}`}>{t('bmi_tips_heading')}</h3>
                       
                       {isLoadingAI ? (
                          <div className="space-y-4 py-8">
                             <div className={`flex items-center gap-3 text-primary font-bold ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                <Loader2 className="animate-spin" size={20} />
                                {t('bmi_calculating')}
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
                             <div className={`bg-primary/5 p-6 rounded-3xl border border-primary/10 text-gray-700 leading-relaxed whitespace-pre-line font-medium italic ${isRtl ? 'text-right' : 'text-left'}`}>
                                &quot;{aiAdvice}&quot;
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                   <div className={`flex items-center gap-2 font-black text-xs text-gray-400 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                      <Target size={14} className="text-primary" /> {language === 'ar' ? 'الهدف المقترح' : 'Suggested Goal'}
                                   </div>
                                   <p className={`font-bold text-sm text-gray-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                                    {status === t('bmi_normal') 
                                      ? (language === 'ar' ? 'الحفاظ على الكتلة العضلية وتطوير اللياقة' : 'Maintain muscle mass and improve fitness') 
                                      : (language === 'ar' ? 'الوصول تدريجياً لوزن صحي مستدام' : 'Gradually reach a healthy, sustainable weight')}
                                   </p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                   <div className={`flex items-center gap-2 font-black text-xs text-gray-400 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                      <Heart size={14} className="text-red-500" /> {language === 'ar' ? 'نصيحة الصحة العامة' : 'General Health Tip'}
                                   </div>
                                   <p className={`font-bold text-sm text-gray-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                                     {language === 'ar' ? 'شرب 3 لتر ماء يومياً ونوم 8 ساعات' : 'Drink 3L of water daily and sleep 8 hours'}
                                   </p>
                                </div>
                             </div>

                             <Link href="/products">
                                <button className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer">
                                   {language === 'ar' ? 'تسوق مكملات تدعم هدفك' : 'Shop Supplements Supporting Your Goal'}
                                   <ChevronLeft size={20} className={isRtl ? '' : 'rotate-180'} />
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
                      <h3 className="text-lg font-black text-gray-800">{language === 'ar' ? 'بانتظار بياناتك' : 'Awaiting Your Data'}</h3>
                      <p className="text-sm">{language === 'ar' ? 'أدخل طولك ووزنك لنقوم بالتحليل الذكي فوراً' : 'Enter your height and weight to get the smart analysis instantly'}</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
