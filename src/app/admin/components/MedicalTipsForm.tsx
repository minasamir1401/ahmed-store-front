import React, { useState } from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Sparkles, Languages } from 'lucide-react';

export default function MedicalTipsForm(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload, 
    categories, brandSearch, setBrandSearch, showBrandSuggestions, setShowBrandSuggestions,
    filteredBrands, brandUploading, isAILoading, handleAIFill,
    sizesPricesList, setSizesPricesList, supplementFactsList, setSupplementFactsList,
    keyInfoObj, setKeyInfoObj, productSpecsObj, setProductSpecsObj,
    certificationsObj, setCertificationsObj, dosageCalculatorObj, setDosageCalculatorObj,
    addLog, BACKEND_API, handleTipAI
  } = props;

  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!formData.title && !formData.content) return;
    setIsTranslating(true);
    addLog('جاري ترجمة النصيحة الطبية...');
    
    try {
      const token = localStorage.getItem('mithaly_admin_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      let titleEn = formData.titleEn || '';
      let contentEn = formData.contentEn || '';

      if (formData.title && !formData.titleEn) {
        const resTitle = await fetch(`${BACKEND_API}/api/translate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: formData.title })
        });
        if (resTitle.ok) {
          const data = await resTitle.json();
          titleEn = data.translation || data.text || titleEn;
        }
      }

      if (formData.content && !formData.contentEn) {
        const resContent = await fetch(`${BACKEND_API}/api/translate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: formData.content })
        });
        if (resContent.ok) {
          const data = await resContent.json();
          contentEn = data.translation || data.text || contentEn;
        }
      }

      setFormData({ ...formData, titleEn, contentEn });
      addLog('تمت الترجمة بنجاح');
    } catch (err) {
      console.error('Translation error', err);
      addLog('حدث خطأ أثناء الترجمة');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mr-1">صورة النصيحة الطبية</label>
          <div className="aspect-[4/3] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
            {formData.image ? (
              <>
                <img src={formData.image} className="w-full h-full object-cover" alt="preview" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white px-4 py-2 rounded-2xl text-emerald-600 flex items-center gap-2 font-black text-xs shadow-md"><Edit2 size={14} /> تغيير الصورة</div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2"><Upload size={18} /></div>
                <span className="text-xs font-black text-slate-800">اختر صورة للنصيحة</span>
                <span className="text-[10px] font-bold text-slate-400">اسحب صورة أو اضغط هنا</span>
              </div>
            )}
            <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            {uploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          {/* ARABIC */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200/50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1">العنوان (عربي)</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleTipAI} disabled={isAILoading || !formData.title} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
                    {isAILoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    توليد AI
                </button>
                <button type="button" onClick={handleAutoTranslate} disabled={isTranslating || (!formData.title && !formData.content)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
                    {isTranslating ? <Loader2 className="animate-spin" size={14} /> : <Languages size={14} />}
                    ترجمة للإنجليزية
                </button>
              </div>
            </div>
            <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-2xl py-3 px-4 font-black text-sm outline-none transition-all text-slate-700" placeholder="اكتب موضوع المقالة أو العنوان هنا..." required />
            
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1 mt-4">المحتوى (عربي)</label>
            <textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-32 bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-3xl py-3 px-4 text-sm font-bold outline-none transition-all resize-none text-slate-700" placeholder="اكتب النصيحة الطبية هنا..." required />
          </div>

          {/* ENGLISH */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mr-1">العنوان (إنجليزي) - اختياري</label>
            <input type="text" value={formData.titleEn || ''} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500/20 rounded-2xl py-3 px-4 font-black text-sm outline-none transition-all text-slate-700 dir-ltr text-left" placeholder="English Title..." />
            
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mr-1 mt-4">المحتوى (إنجليزي) - اختياري</label>
            <textarea value={formData.contentEn || ''} onChange={e => setFormData({...formData, contentEn: e.target.value})} className="w-full h-32 bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500/20 rounded-3xl py-3 px-4 text-sm font-bold outline-none transition-all resize-none text-slate-700 dir-ltr text-left" placeholder="English Content..." />
          </div>

        </div>
      </div>
    </>
  );
}
