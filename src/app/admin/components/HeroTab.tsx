import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Trash2 } from 'lucide-react';

export default function HeroTab(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload
  } = props;

  const [slides, setSlides] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [slideUploading, setSlideUploading] = useState<number | null>(null);

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
            setSlides(parsed);
          }
          return;
        }
      } catch (e) {
        console.error("Failed to parse existing slides:", e);
      }
    }
    
    // Fallback: migrate old static hero to slides if slides are empty
    if (!formData.slides && (formData.title || formData.image) && slides.length === 0) {
      setSlides([{
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        image: formData.image || '',
        buttonText: formData.buttonText || '',
        buttonLink: formData.buttonLink || ''
      }]);
    } else if (!formData.slides && slides.length === 0) {
      setSlides([{ title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' }]);
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

  const handleSlideImageUpload = async (file: File, slideIndex: number) => {
    if (!file) return;
    setSlideUploading(slideIndex);
    try {
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
      
      const newSlides = [...slides];
      newSlides[slideIndex].image = result.url;
      setSlides(newSlides);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setSlideUploading(null);
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block mr-1">العنوان الرئيسي</label>
                  <input type="text" value={slide.title || ''} onChange={e => handleSlideChange(index, 'title', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: العناية تبدأ من هنا" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block mr-1">العنوان الفرعي</label>
                  <input type="text" value={slide.subtitle || ''} onChange={e => handleSlideChange(index, 'subtitle', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: مجموعة مختارة من أفضل المنتجات" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block mr-1">
                    صورة البانر <span className="text-emerald-500 font-bold ml-1">(المقاس الموصى به: 1200x800)</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={slide.image || ''} onChange={e => handleSlideChange(index, 'image', e.target.value)} className="flex-1 bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="رابط الصورة" />
                    <div className="relative shrink-0">
                      <button type="button" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 h-full rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-emerald-100">
                        {slideUploading === index ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                      </button>
                      <input type="file" onChange={(e) => e.target.files && handleSlideImageUpload(e.target.files[0], index)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                  {slide.image && <img src={slide.image} className="mt-2 h-24 w-full object-cover rounded-2xl border border-slate-200" alt="Slide Preview" />}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">نص الزر</label>
                    <input type="text" value={slide.buttonText || ''} onChange={e => handleSlideChange(index, 'buttonText', e.target.value)} className="w-full bg-white focus:bg-white border border-slate-200 focus:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-700" placeholder="مثال: تسوق الآن" />
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
               <input type="text" placeholder="عنوان البانر" value={formData.side1Title || ''} onChange={e => setFormData({...formData, side1Title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
               <input type="text" placeholder="الوصف والخصم" value={formData.side1Desc || ''} onChange={e => setFormData({...formData, side1Desc: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 block mr-1">
                    رابط صورة البانر 1 <span className="text-emerald-500 font-bold ml-1">(المقاس الموصى به: 800x400)</span>
                  </label>
                  <div className="flex gap-2">
                     <input type="text" value={formData.side1Image || ''} onChange={e => setFormData({...formData, side1Image: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs" />
                     <div className="relative shrink-0">
                        <button type="button" className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                          {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        </button>
                        <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'side1')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                     </div>
                  </div>
               </div>
               <input type="text" placeholder="رابط التوجيه عند الضغط" value={formData.side1Link || ''} onChange={e => setFormData({...formData, side1Link: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs" />
            </div>
            
            <div className="h-px bg-slate-200" />
            
            {/* Box 2 */}
            <div className="space-y-3">
               <h5 className="text-[10px] font-black text-emerald-600 tracking-wider">البانر الجانبي السفلي (الأقسام)</h5>
               <input type="text" placeholder="عنوان البانر" value={formData.side2Title || ''} onChange={e => setFormData({...formData, side2Title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
               <input type="text" placeholder="الوصف والخصم" value={formData.side2Desc || ''} onChange={e => setFormData({...formData, side2Desc: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold" />
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 block mr-1">
                    رابط صورة البانر 2 <span className="text-emerald-500 font-bold ml-1">(المقاس الموصى به: 800x400)</span>
                  </label>
                  <div className="flex gap-2">
                     <input type="text" value={formData.side2Image || ''} onChange={e => setFormData({...formData, side2Image: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs" />
                     <div className="relative shrink-0">
                        <button type="button" className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                          {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        </button>
                        <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'side2')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                     </div>
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block mr-1">
                    صورة مخصصة <span className="text-emerald-500 font-bold ml-1">(اختياري)</span>
                  </label>
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={formData[imageField] || ''} 
                       onChange={e => setFormData({ ...formData, [imageField]: e.target.value })}
                       className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs" 
                     />
                     <div className="relative shrink-0">
                        <button type="button" className="bg-slate-100 p-2.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                          <Upload size={14} />
                        </button>
                        <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], `prod${num}` as any)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
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
