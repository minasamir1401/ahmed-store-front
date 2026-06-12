import React from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Sparkles } from 'lucide-react';

export default function OffersForm(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload, 
    categories, brandSearch, setBrandSearch, showBrandSuggestions, setShowBrandSuggestions,
    filteredBrands, brandUploading, isAILoading, handleAIFill,
    sizesPricesList, setSizesPricesList, supplementFactsList, setSupplementFactsList,
    keyInfoObj, setKeyInfoObj, productSpecsObj, setProductSpecsObj,
    certificationsObj, setCertificationsObj, dosageCalculatorObj, setDosageCalculatorObj,
    addLog, BACKEND_API, productsList
  } = props;

  return (
    <>
      // Offers Tab Form with image upload, title, discount tag, and product selector
                    <div className="space-y-8 max-w-xl mx-auto py-10">
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mr-1 text-center">صورة بنر العرض الرئيسي</label>
                      <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                         {formData.image ? <img src={formData.image} className="w-full h-full object-cover p-2 rounded-[2rem]" alt="preview" /> : <Upload size={36} className="text-slate-300" />}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-black text-xs bg-emerald-600 px-4 py-2 rounded-xl shadow-md">تغيير الصورة</span>
                         </div>
                         <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                         {uploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                          </div>
                         )}
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-xs font-black text-slate-800 block mr-1">عنوان العرض</label>
                           <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-2xl py-4 px-6 font-black text-sm outline-none transition-all text-slate-700" placeholder="مثال: مكملات أوميجا 3 بأعلى جودة" required />
                         </div>

                         <div className="space-y-2">
                           <label className="text-xs font-black text-slate-800 block mr-1">علامة الخصم (Discount Tag)</label>
                           <input type="text" value={formData.discount || ''} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-2xl py-4 px-6 font-black text-sm outline-none transition-all text-slate-700" placeholder="مثال: خصم 30% أو عروض حصرية" required />
                         </div>

                         <div className="space-y-2">
                           <label className="text-xs font-black text-slate-800 block mr-1">المنتج المرتبط بالعرض (التوجيه عند الضغط)</label>
                           <select 
                             value={formData.productId || ''} 
                             onChange={e => setFormData({...formData, productId: e.target.value})} 
                             className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl py-4 px-6 font-black text-sm outline-none transition-all text-slate-700 cursor-pointer"
                           >
                             <option value="">-- بدون توجيه لمنتج معين (فقط صورة وعرض) --</option>
                             {productsList.map((prod: any) => (
                               <option key={prod.id} value={prod.id}>
                                 {prod.title} ({prod.price} ج.م)
                               </option>
                             ))}
                           </select>
                         </div>
                      </div>
                    </div>
    </>
  );
}
