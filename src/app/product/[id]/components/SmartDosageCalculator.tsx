"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplet, Sun, Moon, Dumbbell, Sparkles, Flame, CheckCircle2, Info } from 'lucide-react';

export default function SmartDosageCalculator({ product, language }: { product: any, language: 'ar' | 'en' }) {
  const [magnesiumGender, setMagnesiumGender] = useState<'male' | 'female'>('male');
  const [magnesiumGoal, setMagnesiumGoal] = useState<'sleep' | 'muscle' | 'general'>('sleep');
  const [vitDAge, setVitDAge] = useState<'under70' | 'over70'>('under70');
  const [vitDSun, setVitDSun] = useState<'none' | 'moderate'>('none');
  const [omegaGoal, setOmegaGoal] = useState<'heart' | 'joint' | 'general'>('heart');
  const [generalWeight, setGeneralWeight] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [generalActivity, setGeneralActivity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  let dbCalculator: any = null;
  try {
    if (product?.dosageCalculator) {
      dbCalculator = typeof product.dosageCalculator === 'string' ? JSON.parse(product.dosageCalculator) : product.dosageCalculator;
    }
  } catch (err) {
    console.error('Failed to parse dosageCalculator:', err);
  }

  useEffect(() => {
    if (dbCalculator && dbCalculator.enabled) {
      setSelectedGender(dbCalculator.genderTarget === 'female' ? 'female' : 'male');
      if (dbCalculator.rules && dbCalculator.rules.length > 0) {
        setSelectedGoal(dbCalculator.rules[0].value);
      }
    }
  }, [product?.dosageCalculator]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return <Activity size={14} />;
      case 'Sun': return <Sun size={14} />;
      case 'Droplet': return <Droplet size={14} />;
      case 'Moon': return <Moon size={14} />;
      case 'Dumbbell': return <Dumbbell size={14} />;
      case 'Sparkles': return <Sparkles size={14} />;
      case 'Flame': return <Flame size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const getLargeIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return <Activity size={20} />;
      case 'Sun': return <Sun size={20} />;
      case 'Droplet': return <Droplet size={20} />;
      case 'Moon': return <Moon size={20} />;
      case 'Dumbbell': return <Dumbbell size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      case 'Flame': return <Flame size={20} />;
      default: return <Activity size={20} />;
    }
  };

  let activeRule = dbCalculator?.rules?.find((r: any) => r.value === selectedGoal) || dbCalculator?.rules?.[0];
  let dbRecommendedValue = '';
  let dbCapsuleRecommendation = '';
  let dbHealthTip = '';

  if (activeRule) {
    if (selectedGender === 'male') {
      dbRecommendedValue = language === 'en' ? (activeRule.maleDose_en || activeRule.maleDose || '') : (activeRule.maleDose_ar || activeRule.maleDose || '');
      dbCapsuleRecommendation = language === 'en' ? (activeRule.maleCapsules_en || activeRule.maleCapsules || '') : (activeRule.maleCapsules_ar || activeRule.maleCapsules || '');
      dbHealthTip = language === 'en' ? (activeRule.maleTip_en || activeRule.maleTip || '') : (activeRule.maleTip_ar || activeRule.maleTip || '');
    } else {
      dbRecommendedValue = language === 'en' ? (activeRule.femaleDose_en || activeRule.femaleDose || '') : (activeRule.femaleDose_ar || activeRule.femaleDose || '');
      dbCapsuleRecommendation = language === 'en' ? (activeRule.femaleCapsules_en || activeRule.femaleCapsules || '') : (activeRule.femaleCapsules_ar || activeRule.femaleCapsules || '');
      dbHealthTip = language === 'en' ? (activeRule.femaleTip_en || activeRule.femaleTip || '') : (activeRule.femaleTip_ar || activeRule.femaleTip || '');
    }
  }

  const productTitleLower = (product?.title || '').toLowerCase();
  const isMagnesium = productTitleLower.includes('magnesium') || productTitleLower.includes('مغنيسيوم');
  const isVitaminD = productTitleLower.includes('vitamin d') || productTitleLower.includes('فيتامين د') || productTitleLower.includes('د٣') || productTitleLower.includes('d3');
  const isOmega3 = productTitleLower.includes('omega') || productTitleLower.includes('أوميجا') || productTitleLower.includes('زيت سمك') || productTitleLower.includes('fish oil');

  let calculatorTitle = 'دليل الترطيب والنشاط الصحي';
  let recommendedValue = '';
  let capsuleRecommendation = '';
  let healthTip = '';

  if (isMagnesium) {
    calculatorTitle = language === 'ar' ? '💡 حاسبة جرعة المغنيسيوم الذكية' : '💡 Smart Magnesium Dosage Calculator';
    let targetMg = 300;
    if (magnesiumGender === 'male') {
      targetMg = magnesiumGoal === 'muscle' ? 420 : 400;
    } else {
      targetMg = magnesiumGoal === 'muscle' ? 350 : 320;
    }
    recommendedValue = language === 'ar' ? `${targetMg} ملجم من المغنيسيوم العنصري` : `${targetMg} mg of elemental Magnesium`;
    
    const capVal = Math.round((targetMg / 200) * 10) / 10;
    capsuleRecommendation = language === 'ar'
      ? `جرعتك المقترحة هي حوالي ${capVal === 1 ? 'كبسولة واحدة' : capVal === 2 ? 'كبسولتين' : `${capVal} كبسولة`} يومياً.`
      : `Your recommended dosage is about ${capVal} capsule(s) daily.`;

    if (magnesiumGoal === 'sleep') {
      healthTip = language === 'ar'
        ? 'يفضل تناول الجرعة قبل النوم بـ 30-60 دقيقة. المغنيسيوم جليسينات ممتاز للمساعدة على الاسترخاء وتحسين جودة النوم وعلاج الأرق.'
        : 'It is preferred to take the dose 30-60 minutes before bedtime. Magnesium Glycinate is excellent for relaxation, sleep quality, and insomnia.';
    } else if (magnesiumGoal === 'muscle') {
      healthTip = language === 'ar'
        ? 'يفضل تناول الجرعة بعد التمرين الرياضي أو مع وجبة الغذاء. يساعد المغنيسيوم في تقليل التشنجات العضلية وتسريع استشفاء الألياف العضلية.'
        : 'It is preferred to take the dose after exercise or with lunch. Magnesium helps reduce muscle cramps and accelerate muscle recovery.';
    } else {
      healthTip = language === 'ar'
        ? 'يمكنك تقسيم الجرعة على مدار اليوم (مثلاً كبسولة صباحاً وأخرى مساءً) مع الوجبات لامتصاص مثالي ودعم مستمر للطاقة والصحة العامة.'
        : 'You can divide the dose throughout the day (e.g., morning/evening) with meals for optimal absorption and support for energy and health.';
    }
  } else if (isVitaminD) {
    calculatorTitle = language === 'ar' ? '☀️ حاسبة جرعة فيتامين د3 الذكية' : '☀️ Smart Vitamin D3 Dosage Calculator';
    let targetIU = 600;
    if (vitDAge === 'over70') {
      targetIU = vitDSun === 'none' ? 1000 : 800;
    } else {
      targetIU = vitDSun === 'none' ? 800 : 600;
    }
    recommendedValue = language === 'ar' ? `${targetIU} وحدة دولية (IU) يومياً كحد أدنى وقائي` : `${targetIU} IU daily as a minimum preventative dose`;
    
    let capStrength = 1000;
    if (productTitleLower.includes('5000') || productTitleLower.includes('٥٠٠٠')) capStrength = 5000;
    else if (productTitleLower.includes('10000') || productTitleLower.includes('١٠٠٠٠')) capStrength = 10000;
    else if (productTitleLower.includes('2000') || productTitleLower.includes('٢٠٠٠')) capStrength = 2000;
    
    if (capStrength >= 5000) {
      capsuleRecommendation = language === 'ar'
        ? `كبسولة واحدة كل ${Math.round(capStrength / targetIU)} أيام (نظراً لأن الكبسولة ذات تركيز عالٍ ${capStrength} وحدة).`
        : `One capsule every ${Math.round(capStrength / targetIU)} days (due to high concentration of ${capStrength} IU per capsule).`;
    } else {
      const capVal = Math.round((targetIU / capStrength) * 10) / 10;
      capsuleRecommendation = language === 'ar'
        ? `جرعتك المقترحة هي حوالي ${capVal} كبسولة يومياً (تركيز الكبسولة ${capStrength} وحدة).`
        : `Your recommended dosage is about ${capVal} capsule(s) daily (capsule strength: ${capStrength} IU).`;
    }

    if (vitDSun === 'none') {
      healthTip = language === 'ar'
        ? 'نظراً لقلة التعرض لأشعة الشمس، يُنصح بتناول فيتامين د3 مع وجبة تحتوي على دهون صحية (مثل زيت الزيتون، المكسرات، أو البيض) لأن فيتامين د يذوب في الدهون.'
        : 'Due to low sun exposure, it is recommended to take Vitamin D3 with a meal containing healthy fats (such as olive oil, nuts, or eggs) as Vitamin D is fat-soluble.';
    } else {
      healthTip = language === 'ar'
        ? 'رغم التعرض للشمس، يساعد المكمل في الحفاظ على المستويات المثالية. تناوله صباحاً مع وجبة الإفطار لتجنب تأثيره الطفيف المحتمل على جودة النوم ليلاً.'
        : 'Despite sun exposure, the supplement helps maintain optimal levels. Take it in the morning with breakfast to avoid its potential slight impact on sleep quality.';
    }
  } else if (isOmega3) {
    calculatorTitle = language === 'ar' ? '🐟 حاسبة جرعة أوميجا 3 الذكية' : '🐟 Smart Omega 3 Dosage Calculator';
    let targetMg = 1000;
    if (omegaGoal === 'joint') {
      targetMg = 2000;
    } else if (omegaGoal === 'heart') {
      targetMg = 1500;
    }
    recommendedValue = language === 'ar' ? `${targetMg} ملجم من الأحماض الدهنية النشطة (EPA/DHA)` : `${targetMg} mg of active fatty acids (EPA/DHA)`;
    capsuleRecommendation = language === 'ar'
      ? `يُنصح بتناول كبسولة إلى كبسولتين يومياً مع الوجبات الرئيسية.`
      : `It is recommended to take 1 to 2 capsules daily with main meals.`;
    
    if (omegaGoal === 'joint') {
      healthTip = language === 'ar'
        ? 'الجرعات الأعلى من أوميجا 3 تدعم مرونة المفاصل وتقليل الالتهابات. يُنصح بالاستمرار لمدة 4-6 أسابيع لملاحظة تحسن مرونة المفاصل.'
        : 'Higher doses of Omega 3 support joint flexibility and reduce inflammation. It is recommended to continue for 4-6 weeks to notice improvements.';
    } else if (omegaGoal === 'heart') {
      healthTip = language === 'ar'
        ? 'أوميجا 3 تعزز صحة القلب والأوعية الدموية وتساعد في ضبط مستويات الكوليسترول النافع. تناولها وسط الغداء هو الخيار المثالي.'
        : 'Omega 3 promotes cardiovascular health and helps balance cholesterol levels. Taking it with lunch is ideal.';
    } else {
      healthTip = language === 'ar'
        ? 'جرعة الصيانة اليومية ممتازة للتركيز، صحة الدماغ، ونضارة البشرة. احرص على تناولها بانتظام مع الدهون لامتصاص ممتاز.'
        : 'Daily maintenance dose is excellent for focus, brain health, and skin freshness. Take it regularly with fats for excellent absorption.';
    }
  } else {
    calculatorTitle = language === 'ar' ? '💧 حاسبة الترطيب والصحة اليومية' : '💧 Daily Hydration & Health Calculator';
    let targetWater = 2.5;
    if (generalWeight === 'light') {
      targetWater = generalActivity === 'high' ? 3.0 : 2.2;
    } else if (generalWeight === 'medium') {
      targetWater = generalActivity === 'high' ? 3.7 : 2.8;
    } else {
      targetWater = generalActivity === 'high' ? 4.5 : 3.5;
    }
    recommendedValue = language === 'ar' ? `${targetWater} لتر من الماء يومياً` : `${targetWater} liters of water daily`;
    capsuleRecommendation = language === 'ar'
      ? `احرص على شرب كوب ماء كامل (250 مل) مع كل كبسولة مكمل غذائي تتناولها لضمان ذوبانها وامتصاصها السليم.`
      : `Make sure to drink a full glass of water (250 ml) with every supplement capsule you take to ensure proper dissolution and absorption.`;
    healthTip = language === 'ar'
      ? `حالتك النشطة (${generalActivity === 'high' ? 'رياضي' : generalActivity === 'moderate' ? 'نشاط متوسط' : 'نشاط قليل'}) تتطلب ترطيباً مستمراً.`
      : `Your active state requires constant hydration. Take your supplements regularly.`;
  }

  if (dbCalculator && dbCalculator.enabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 p-5 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
      >
        {/* Title and Icon */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            {getLargeIconComponent(dbCalculator.icon)}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800">
              {language === 'en' 
                ? (dbCalculator.title_en || dbCalculator.title || 'Smart Dosage Calculator') 
                : (dbCalculator.title_ar || dbCalculator.title || 'حاسبة الجرعة الذكية')}
            </h3>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400">{language === 'ar' ? 'حاسبة تفاعلية مصممة خصيصاً لمساعدتك' : 'Interactive calculator designed to help you'}</p>
          </div>
        </div>

        {/* Calculator Inputs */}
        <div className="space-y-4">
          {/* Gender Selection */}
          {dbCalculator.genderTarget && (
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'الجنس:' : 'Gender:'}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male', show: dbCalculator.genderTarget !== 'female' },
                  { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female', show: dbCalculator.genderTarget !== 'male' }
                ].filter(opt => opt.show).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedGender(opt.value as any)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${selectedGender === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'} ${dbCalculator.genderTarget !== 'both' ? 'col-span-2' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goal Selection */}
          {dbCalculator.rules && dbCalculator.rules.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">
                {language === 'en' 
                  ? (dbCalculator.optionsLabel_en || dbCalculator.optionsLabel || 'Main Goal:') 
                  : (dbCalculator.optionsLabel_ar || dbCalculator.optionsLabel || 'الهدف الأساسي:')}
              </span>
              <div className={`grid gap-1.5 ${dbCalculator.rules.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {dbCalculator.rules.map((opt: any) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedGoal(opt.value)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${selectedGoal === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                  >
                    {getIconComponent(opt.icon)}
                    <span>{language === 'en' ? (opt.label_en || opt.label || '') : (opt.label_ar || opt.label || '')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Results Output Panel */}
        <div className="bg-[#f0f7f4] rounded-2xl p-4 sm:p-6 border border-[#e8f0ed] space-y-4">
          {dbRecommendedValue && (
            <div>
              <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest block mb-1">{language === 'ar' ? 'الاحتياج اليومي المقترح لك:' : 'Suggested Daily Requirement:'}</span>
              <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">{dbRecommendedValue}</p>
            </div>
          )}

          {dbCapsuleRecommendation && (
            <div className="border-t border-[#e8f0ed] pt-3 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs font-bold text-slate-600 leading-relaxed">{dbCapsuleRecommendation}</p>
            </div>
          )}

          {dbHealthTip && (
            <div className="bg-white/60 rounded-xl p-3 border border-white flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 leading-relaxed">{dbHealthTip}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 p-5 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
          {isMagnesium ? <Activity size={20} /> : isVitaminD ? <Sun size={20} /> : isOmega3 ? <Activity size={20} /> : <Droplet size={20} />}
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-800">{calculatorTitle}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400">{language === 'ar' ? 'حاسبة تفاعلية مصممة خصيصاً لمساعدتك' : 'Interactive calculator designed to help you'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {isMagnesium && (
          <>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'الجنس:' : 'Gender:'}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
                  { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMagnesiumGender(opt.value as any)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${magnesiumGender === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'الهدف الأساسي:' : 'Main Goal:'}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'sleep', label: language === 'ar' ? 'النوم والاسترخاء' : 'Sleep & Relaxation', icon: Moon },
                  { value: 'muscle', label: language === 'ar' ? 'دعم العضلات' : 'Muscle Support', icon: Dumbbell },
                  { value: 'general', label: language === 'ar' ? 'الصحة العامة' : 'General Health', icon: Activity }
                ].map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMagnesiumGoal(opt.value as any)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${magnesiumGoal === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                    >
                      <IconComp size={14} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {isVitaminD && (
          <>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'العمر:' : 'Age:'}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'under70', label: language === 'ar' ? 'أقل من 70 سنة' : 'Under 70 years' },
                  { value: 'over70', label: language === 'ar' ? '70 سنة أو أكثر' : '70+ years' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVitDAge(opt.value as any)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${vitDAge === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'التعرض اليومي لأشعة الشمس المباشرة:' : 'Daily Direct Sun Exposure:'}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'none', label: language === 'ar' ? 'قليل جداً / غرف مغلقة' : 'Very low / Indoors' },
                  { value: 'moderate', label: language === 'ar' ? 'معتدل (15+ دقيقة)' : 'Moderate (15+ mins)' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVitDSun(opt.value as any)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border-2 transition-all cursor-pointer ${vitDSun === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {isOmega3 && (
          <>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'الهدف من استخدام أوميجا 3:' : 'Omega 3 Goal:'}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'heart', label: language === 'ar' ? 'القلب والتركيز' : 'Heart & Focus', icon: Activity },
                  { value: 'joint', label: language === 'ar' ? 'المفاصل والالتهاب' : 'Joints & Inflammation', icon: Dumbbell },
                  { value: 'general', label: language === 'ar' ? 'الصحة العامة' : 'General Health', icon: Sparkles }
                ].map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOmegaGoal(opt.value as any)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${omegaGoal === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                    >
                      <IconComp size={14} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!isMagnesium && !isVitaminD && !isOmega3 && (
          <>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'الوزن التقريبي:' : 'Approximate Weight:'}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'light', label: language === 'ar' ? '50 - 70 كجم' : '50 - 70 kg' },
                  { value: 'medium', label: language === 'ar' ? '70 - 90 كجم' : '70 - 90 kg' },
                  { value: 'heavy', label: language === 'ar' ? '90+ كجم' : '90+ kg' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGeneralWeight(opt.value as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${generalWeight === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 block">{language === 'ar' ? 'مستوى النشاط البدني اليومي:' : 'Daily Activity Level:'}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'low', label: language === 'ar' ? 'قليل / مكتبي' : 'Low / Desk Job', icon: Moon },
                  { value: 'moderate', label: language === 'ar' ? 'متوسط / حركي' : 'Moderate / Active', icon: Activity },
                  { value: 'high', label: language === 'ar' ? 'رياضي / شاق' : 'Athletic / Demanding', icon: Flame }
                ].map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGeneralActivity(opt.value as any)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${generalActivity === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                    >
                      <IconComp size={14} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-[#f0f7f4] rounded-2xl p-4 sm:p-6 border border-[#e8f0ed] space-y-4">
        <div>
          <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest block mb-1">{language === 'ar' ? 'الاحتياج اليومي المقترح لك:' : 'Suggested Daily Requirement:'}</span>
          <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">{recommendedValue}</p>
        </div>
        <div className="border-t border-[#e8f0ed] pt-3 flex items-start gap-2">
          <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[11px] sm:text-xs font-bold text-slate-600 leading-relaxed">{capsuleRecommendation}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-3 border border-white flex items-start gap-2">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 leading-relaxed">{healthTip}</p>
        </div>
      </div>
    </motion.div>
  );
}
