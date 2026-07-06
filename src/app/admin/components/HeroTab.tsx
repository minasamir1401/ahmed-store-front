import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Trash2 } from 'lucide-react';

const getLocalizedValue = (value: string) => {
  if (!value) return { ar: '', en: '' };
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        ar: parsed.ar || '',
        en: parsed.en || ''
      };
    } catch (e) {}
  }
  return { ar: value, en: '' };
};

const makeLocalizedValue = (ar: string, en: string) => {
  return JSON.stringify({ ar: ar.trim(), en: en.trim() });
};

export default function HeroTab(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload
  } = props;

  const [slides, setSlides] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [slideUploading, setSlideUploading] = useState<string | null>(null);
  const [localUploading, setLocalUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProductsList(data.products || data))
      .catch(console.error);
  }, []); // Run once on mount

  // Sync from formData to local slides
  useEffect(() => {
    if (formData.slides && typeof formData.slides === 'string') {
      try {
        const parsed = JSON.parse(formData.slides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (JSON.stringify(parsed) !== JSON.stringify(slides)) {
            queueMicrotask(() => setSlides(parsed));
          }
          return;
        }
      } catch (e) {
        console.error("Failed to parse existing slides:", e);
      }
    }
    
    // Fallback: migrate old static hero to slides if slides are empty
    if (!formData.slides && (formData.title || formData.image) && slides.length === 0) {
      queueMicrotask(() => setSlides([{
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        image: formData.image || '',
        buttonText: formData.buttonText || '',
        buttonLink: formData.buttonLink || ''
      }]));
    } else if (!formData.slides && slides.length === 0) {
      queueMicrotask(() => setSlides([{ title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' }]));
    }
  }, [formData.slides, formData.title, formData.image]); // Run when formData changes

  // Sync slides array to formData whenever it changes
  useEffect(() => {
    if (slides.length > 0) {
      const stringified = JSON.stringify(slides);
      if (formData.slides !== stringified) {
        setFormData((prev: any) => ({ ...prev, slides: stringified }));
      }
    }
  }, [slides]);

  const handleAddSlide = () => {
    setSlides([...slides, { title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' }]);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);
  };

  const handleSlideChange = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

  const handleSlideChangeLocalized = (index: number, field: string, subfield: 'ar' | 'en', val: string) => {
    const newSlides = [...slides];
    const currentLoc = getLocalizedValue(newSlides[index][field]);
    currentLoc[subfield] = val;
    newSlides[index][field] = JSON.stringify(currentLoc);
    setSlides(newSlides);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    const token = localStorage.getItem('mithaly_admin_token') || '';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    
    const res = await fetch(`${backendUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: uploadData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Upload failed');
    return result.url;
  };

  const handleSlideImageUploadLocalized = async (file: File, slideIndex: number, lang: 'ar' | 'en') => {
    if (!file) return;
    setSlideUploading(`${lang}-${slideIndex}`);
    try {
      const url = await uploadImage(file);
      const newSlides = [...slides];
      const currentLoc = getLocalizedValue(newSlides[slideIndex].image);
      currentLoc[lang] = url;
      newSlides[slideIndex].image = JSON.stringify(currentLoc);
      setSlides(newSlides);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setSlideUploading(null);
    }
  };

  const handleSideImageUploadLocalized = async (file: File, field: string, lang: 'ar' | 'en') => {
    if (!file) return;
    setLocalUploading(`${field}-${lang}`);
    try {
      const url = await uploadImage(file);
      const currentLoc = getLocalizedValue(formData[field]);
      currentLoc[lang] = url;
      setFormData((prev: any) => ({
        ...prev,
        [field]: JSON.stringify(currentLoc)
      }));
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setLocalUploading(null);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Main Hero Slider Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest">البانر الرئيسي (السلايدر)</h4>
            <button 
              onClick={handleAddSlide}
              className="flex items-center gap-1.5 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl transition-all"
            >
              <Plus size={14} /> إضافة بانر
            </button>
          </div>
          
          <div className="space-y-6">
            {slides.map((slide, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 space-y-4 relative group transition-all hover:border-emerald-500/30 shadow-sm hover:shadow-md">
                
                {/* Remove button */}
                {slides.length > 1 && (
                  <button 
                    onClick={() => handleRemoveSlide(index)}
                    className="absolute top-4 left-4 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="حذف البانر"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">إعدادات الشريحة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">العنوان الرئيسي (عربي)</label>
                    <input type="text" value={getLocalizedValue(slide.title).ar} onChange={e => handleSlideChangeLocalized(index, 'title', 'ar', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: العناية تبدأ من هنا" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-400 block mr-1">العنوان الرئيسي (إنجليزي)</label>
                    <input type="text" value={getLocalizedValue(slide.title).en} onChange={e => handleSlideChangeLocalized(index, 'title', 'en', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-indigo-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-705 dir-ltr text-left" placeholder="English Title..." />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">العنوان الفرعي (عربي)</label>
                    <input type="text" value={getLocalizedValue(slide.subtitle).ar} onChange={e => handleSlideChangeLocalized(index, 'subtitle', 'ar', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: مجموعة مختارة من أفضل المنتجات" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-400 block mr-1">العنوان الفرعي (إنجليزي)</label>
                    <input type="text" value={getLocalizedValue(slide.subtitle).en} onChange={e => handleSlideChangeLocalized(index, 'subtitle', 'en', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-indigo-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-705 dir-ltr text-left" placeholder="English Subtitle..." />
                  </div>
                </div>
                
                {/* Localized Slide Image Upload Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">
                      صورة البانر (عربي) <span className="text-emerald-500 font-bold ml-1">(1200x800)</span>
                    </label>
                    <div className="flex gap-2">
                      <input type="text" value={getLocalizedValue(slide.image).ar} onChange={e => handleSlideChangeLocalized(index, 'image', 'ar', e.target.value)} className="flex-1 bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="رابط الصورة عربي" />
                      <div className="relative shrink-0">
                        <button type="button" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 h-full rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-emerald-100">
                          {slideUploading === `ar-${index}` ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        </button>
                        <input type="file" onChange={(e) => e.target.files && handleSlideImageUploadLocalized(e.target.files[0], index, 'ar')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                    </div>
                    {getLocalizedValue(slide.image).ar && <img src={getLocalizedValue(slide.image).ar} className="mt-2 h-20 w-full object-cover rounded-2xl border border-slate-200" alt="Slide Ar Preview" />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-400 block mr-1">
                      صورة البانر (إنجليزي) <span className="text-emerald-500 font-bold ml-1">(1200x800)</span>
                    </label>
                    <div className="flex gap-2">
                      <input type="text" value={getLocalizedValue(slide.image).en} onChange={e => handleSlideChangeLocalized(index, 'image', 'en', e.target.value)} className="flex-1 bg-white focus:bg-white border border-slate-200 focus:border-indigo-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-705 dir-ltr text-left" placeholder="English Image URL..." />
                      <div className="relative shrink-0">
                        <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 h-full rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200">
                          {slideUploading === `en-${index}` ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        </button>
                        <input type="file" onChange={(e) => e.target.files && handleSlideImageUploadLocalized(e.target.files[0], index, 'en')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                    </div>
                    {getLocalizedValue(slide.image).en && <img src={getLocalizedValue(slide.image).en} className="mt-2 h-20 w-full object-cover rounded-2xl border border-slate-200" alt="Slide En Preview" />}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">نص الزر (عربي)</label>
                    <input type="text" value={getLocalizedValue(slide.buttonText).ar} onChange={e => handleSlideChangeLocalized(index, 'buttonText', 'ar', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: تسوق الآن" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-400 block mr-1">نص الزر (إنجليزي)</label>
                    <input type="text" value={getLocalizedValue(slide.buttonText).en} onChange={e => handleSlideChangeLocalized(index, 'buttonText', 'en', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-indigo-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-705 dir-ltr text-left" placeholder="e.g. Shop Now" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">رابط الزر</label>
                    <input type="text" value={slide.buttonLink || ''} onChange={e => handleSlideChange(index, 'buttonLink', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: /products" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Side Banners Area */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b pb-2">صناديق العرض الجانبية</h4>
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
            
            {/* Box 1 */}
            <div className="space-y-3">
               <h5 className="text-[10px] font-black text-emerald-600 tracking-wider">البانر الجانبي العلوي (العروض والخصومات)</h5>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 block mr-1">عنوان البانر (عربي)</label>
                   <input type="text" placeholder="عنوان البانر عربي" value={getLocalizedValue(formData.side1Title).ar} onChange={e => setFormData({...formData, side1Title: makeLocalizedValue(e.target.value, getLocalizedValue(formData.side1Title).en)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-indigo-400 block mr-1">عنوان البانر (إنجليزي)</label>
                   <input type="text" placeholder="Banner Title English" value={getLocalizedValue(formData.side1Title).en} onChange={e => setFormData({...formData, side1Title: makeLocalizedValue(getLocalizedValue(formData.side1Title).ar, e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold dir-ltr text-left" />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 block mr-1">الوصف والخصم (عربي)</label>
                   <input type="text" placeholder="الوصف والخصم عربي" value={getLocalizedValue(formData.side1Desc).ar} onChange={e => setFormData({...formData, side1Desc: makeLocalizedValue(e.target.value, getLocalizedValue(formData.side1Desc).en)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-indigo-400 block mr-1">الوصف والخصم (إنجليزي)</label>
                   <input type="text" placeholder="Description & Discount English" value={getLocalizedValue(formData.side1Desc).en} onChange={e => setFormData({...formData, side1Desc: makeLocalizedValue(getLocalizedValue(formData.side1Desc).ar, e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold dir-ltr text-left" />
                 </div>
               </div>

               {/* Localized Side Banner 1 Image Inputs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 block mr-1">
                      صورة البانر 1 (عربي) <span className="text-emerald-500 font-bold ml-1">(800x400)</span>
                    </label>
                    <div className="flex gap-2">
                       <input type="text" value={getLocalizedValue(formData.side1Image).ar} onChange={e => setFormData({...formData, side1Image: makeLocalizedValue(e.target.value, getLocalizedValue(formData.side1Image).en)})} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs" />
                       <div className="relative shrink-0">
                          <button type="button" className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                            {localUploading === 'side1Image-ar' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          </button>
                          <input type="file" onChange={(e) => e.target.files && handleSideImageUploadLocalized(e.target.files[0], 'side1Image', 'ar')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       </div>
                    </div>
                    {getLocalizedValue(formData.side1Image).ar && <img src={getLocalizedValue(formData.side1Image).ar} className="mt-1 h-12 w-full object-cover rounded-xl border border-slate-200" />}
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 block mr-1">
                      صورة البانر 1 (إنجليزي) <span className="text-emerald-500 font-bold ml-1">(800x400)</span>
                    </label>
                    <div className="flex gap-2">
                       <input type="text" value={getLocalizedValue(formData.side1Image).en} onChange={e => setFormData({...formData, side1Image: makeLocalizedValue(getLocalizedValue(formData.side1Image).ar, e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs dir-ltr text-left" />
                       <div className="relative shrink-0">
                          <button type="button" className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                            {localUploading === 'side1Image-en' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          </button>
                          <input type="file" onChange={(e) => e.target.files && handleSideImageUploadLocalized(e.target.files[0], 'side1Image', 'en')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       </div>
                    </div>
                    {getLocalizedValue(formData.side1Image).en && <img src={getLocalizedValue(formData.side1Image).en} className="mt-1 h-12 w-full object-cover rounded-xl border border-slate-200" />}
                 </div>
               </div>
               
               <input type="text" placeholder="رابط التوجيه عند الضغط" value={formData.side1Link || ''} onChange={e => setFormData({...formData, side1Link: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs" />
            </div>
            
            <div className="h-px bg-slate-200" />
            
            {/* Box 2 */}
            <div className="space-y-3">
               <h5 className="text-[10px] font-black text-emerald-600 tracking-wider">البانر الجانبي السفلي (الأقسام)</h5>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 block mr-1">عنوان البانر (عربي)</label>
                   <input type="text" placeholder="عنوان البانر عربي" value={getLocalizedValue(formData.side2Title).ar} onChange={e => setFormData({...formData, side2Title: makeLocalizedValue(e.target.value, getLocalizedValue(formData.side2Title).en)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-indigo-400 block mr-1">عنوان البانر (إنجليزي)</label>
                   <input type="text" placeholder="Banner Title English" value={getLocalizedValue(formData.side2Title).en} onChange={e => setFormData({...formData, side2Title: makeLocalizedValue(getLocalizedValue(formData.side2Title).ar, e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold dir-ltr text-left" />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 block mr-1">الوصف والخصم (عربي)</label>
                   <input type="text" placeholder="الوصف والخصم عربي" value={getLocalizedValue(formData.side2Desc).ar} onChange={e => setFormData({...formData, side2Desc: makeLocalizedValue(e.target.value, getLocalizedValue(formData.side2Desc).en)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-indigo-400 block mr-1">الوصف والخصم (إنجليزي)</label>
                   <input type="text" placeholder="Description & Discount English" value={getLocalizedValue(formData.side2Desc).en} onChange={e => setFormData({...formData, side2Desc: makeLocalizedValue(getLocalizedValue(formData.side2Desc).ar, e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold dir-ltr text-left" />
                 </div>
               </div>

               {/* Localized Side Banner 2 Image Inputs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 block mr-1">
                      صورة البانر 2 (عربي) <span className="text-emerald-500 font-bold ml-1">(800x400)</span>
                    </label>
                    <div className="flex gap-2">
                       <input type="text" value={getLocalizedValue(formData.side2Image).ar} onChange={e => setFormData({...formData, side2Image: makeLocalizedValue(e.target.value, getLocalizedValue(formData.side2Image).en)})} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs" />
                       <div className="relative shrink-0">
                          <button type="button" className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                            {localUploading === 'side2Image-ar' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          </button>
                          <input type="file" onChange={(e) => e.target.files && handleSideImageUploadLocalized(e.target.files[0], 'side2Image', 'ar')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       </div>
                    </div>
                    {getLocalizedValue(formData.side2Image).ar && <img src={getLocalizedValue(formData.side2Image).ar} className="mt-1 h-12 w-full object-cover rounded-xl border border-slate-200" />}
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 block mr-1">
                      صورة البانر 2 (إنجليزي) <span className="text-emerald-500 font-bold ml-1">(800x400)</span>
                    </label>
                    <div className="flex gap-2">
                       <input type="text" value={getLocalizedValue(formData.side2Image).en} onChange={e => setFormData({...formData, side2Image: makeLocalizedValue(getLocalizedValue(formData.side2Image).ar, e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs dir-ltr text-left" />
                       <div className="relative shrink-0">
                          <button type="button" className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                            {localUploading === 'side2Image-en' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          </button>
                          <input type="file" onChange={(e) => e.target.files && handleSideImageUploadLocalized(e.target.files[0], 'side2Image', 'en')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       </div>
                    </div>
                    {getLocalizedValue(formData.side2Image).en && <img src={getLocalizedValue(formData.side2Image).en} className="mt-1 h-12 w-full object-cover rounded-xl border border-slate-200" />}
                 </div>
               </div>
               
               <input type="text" placeholder="رابط التوجيه عند الضغط" value={formData.side2Link || ''} onChange={e => setFormData({...formData, side2Link: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs" />
            </div>

          </div>
        </div>
      </div>

      {/* Featured Items Area (4 sections) */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b pb-2">العناصر المميزة (منتجات أو أقسام)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((num) => {
            const typeField = `prod${num}Type` as keyof typeof formData;
            const idField = `prod${num}Id` as keyof typeof formData;
            const imageField = `prod${num}Image` as keyof typeof formData;

            return (
              <div key={num} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                    {num}
                  </span>
                  <span className="text-xs font-bold text-slate-500">عنصر مميز</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block mr-1">النوع</label>
                  <select 
                    value={formData[typeField] || 'product'} 
                    onChange={e => setFormData({ ...formData, [typeField]: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-700"
                  >
                    <option value="product">منتج</option>
                    <option value="category">قسم (Category)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block mr-1">المعرف (المنتج أو القسم)</label>
                  {formData[typeField] === 'category' ? (
                    <select 
                      value={formData[idField] || ''} 
                      onChange={e => setFormData({ ...formData, [idField]: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-700"
                    >
                      <option value="">اختر القسم</option>
                      {props.categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      value={formData[idField] || ''} 
                      onChange={e => setFormData({ ...formData, [idField]: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-700"
                    >
                      <option value="">اختر المنتج</option>
                      {productsList?.map((prod: any) => (
                        <option key={prod.id} value={prod.id}>{prod.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Localized Custom Images for Featured Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 block mr-1">
                      صورة مخصصة (عربي) <span className="text-emerald-500 font-bold ml-1">(اختياري)</span>
                    </label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={getLocalizedValue(formData[imageField]).ar} 
                         onChange={e => setFormData({ ...formData, [imageField]: makeLocalizedValue(e.target.value, getLocalizedValue(formData[imageField]).en) })}
                         className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs" 
                       />
                       <div className="relative shrink-0">
                          <button type="button" className="bg-slate-100 p-2.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                             {localUploading === `${String(imageField)}-ar` ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          </button>
                          <input type="file" onChange={(e) => e.target.files && handleSideImageUploadLocalized(e.target.files[0], String(imageField), 'ar')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-400 block mr-1">
                      صورة مخصصة (إنجليزي) <span className="text-emerald-500 font-bold ml-1">(اختياري)</span>
                    </label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={getLocalizedValue(formData[imageField]).en} 
                         onChange={e => setFormData({ ...formData, [imageField]: makeLocalizedValue(getLocalizedValue(formData[imageField]).ar, e.target.value) })}
                         className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs dir-ltr text-left" 
                       />
                       <div className="relative shrink-0">
                          <button type="button" className="bg-slate-100 p-2.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                             {localUploading === `${String(imageField)}-en` ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                          </button>
                          <input type="file" onChange={(e) => e.target.files && handleSideImageUploadLocalized(e.target.files[0], String(imageField), 'en')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-end pt-6 border-t border-slate-50">
        <button onClick={handleSave} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/10 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} حفظ إعدادات الهيرو بالكامل
        </button>
      </div>
    </div>
  );
}
