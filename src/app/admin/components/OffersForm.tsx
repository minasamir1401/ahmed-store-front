import React from 'react';
import { Loader2, Upload, Tag, Box, Image as ImageIcon } from 'lucide-react';
import SearchableProductSelect from './SearchableProductSelect';

export default function OffersForm(props: any) {
  const { 
    formData, setFormData, loading, uploading, handleFileUpload, productsList
  } = props;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      {/* Header section */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-slate-800">تفاصيل العرض الترويجي</h2>
        <p className="text-slate-500 text-sm mt-2">قم بضبط إعدادات العرض وصورة البنر بكل سهولة لزيادة المبيعات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left/Right Column: Image Upload */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-black text-slate-800">
            <ImageIcon size={18} className="text-emerald-600" />
            صورة بنر العرض <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500">يفضل استخدام صور أفقية بدقة عالية لظهور جذاب في الواجهة الرئيسية</p>
          
          <div className="aspect-[16/9] w-full bg-slate-50 hover:bg-slate-100/80 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-emerald-500/50 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm transition-all">
             {formData.image ? (
               <img src={formData.image} className="w-full h-full object-cover p-2 rounded-[2rem]" alt="preview" />
             ) : (
               <div className="flex flex-col items-center gap-3 text-slate-400">
                 <Upload size={44} className="group-hover:text-emerald-500 transition-colors" />
                 <span className="text-xs font-bold px-4 text-center">اضغط هنا أو اسحب الصورة للرفع</span>
               </div>
             )}
             
             <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                <span className="text-white font-black text-xs bg-emerald-600 px-6 py-3 rounded-2xl shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                  {formData.image ? 'تغيير الصورة' : 'رفع صورة جديدة'}
                </span>
             </div>
             
             <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
             
             {uploading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-emerald-600" size={36} />
                  <span className="text-sm font-black text-emerald-600 tracking-wider">جاري الرفع...</span>
                </div>
              </div>
             )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
           <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-black text-slate-800">
               <Tag size={18} className="text-emerald-600" />
               عنوان العرض <span className="text-red-500">*</span>
             </label>
             <input 
               type="text" 
               value={formData.title || ''} 
               onChange={e => setFormData({...formData, title: e.target.value})} 
               className="w-full bg-white focus:bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/50 rounded-2xl py-4 px-5 font-black text-sm outline-none transition-all text-slate-700 shadow-sm" 
               placeholder="مثال: خصومات كبرى على منتجات العناية بالشعر..." 
               required 
             />
           </div>

           <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-black text-slate-800">
               <Tag size={18} className="text-amber-500" />
               علامة الخصم (شريط ملون)
             </label>
             <input 
               type="text" 
               value={formData.discount || ''} 
               onChange={e => setFormData({...formData, discount: e.target.value})} 
               className="w-full bg-white focus:bg-amber-50/30 border-2 border-slate-100 focus:border-amber-500/50 rounded-2xl py-4 px-5 font-black text-sm outline-none transition-all text-slate-700 shadow-sm" 
               placeholder="مثال: خصم 30% 🔥 أو وفر 150 جنيه" 
               required 
             />
           </div>

           <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-black text-slate-800">
               <Box size={18} className="text-blue-500" />
               توجيه الضغط إلى منتج (اختياري)
             </label>
              <SearchableProductSelect
                productsList={productsList}
                value={formData.productId || ''}
                onChange={val => setFormData({...formData, productId: val})}
                placeholder="-- بدون توجيه لمنتج معين (عرض فقط) --"
              />
             <p className="text-[11px] text-slate-500 mt-2 font-medium">إذا تم اختيار منتج، سيتم تحويل المستخدم مباشرة لصفحة المنتج عند الضغط على البنر في الواجهة الرئيسية.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
