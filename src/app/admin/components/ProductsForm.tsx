import React from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Sparkles, Image as ImageIcon, Languages } from 'lucide-react';
import { parseImageList, serializeImageList } from '@/lib/product-images';

export default function ProductsForm(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, setUploading, handleFileUpload, 
    categories, brandSearch, setBrandSearch, showBrandSuggestions, setShowBrandSuggestions,
    filteredBrands, brandUploading, isAILoading, handleAIFill,
    handleAutoTranslate, isTranslatingLoading,
    sizesPricesList, setSizesPricesList, supplementFactsList, setSupplementFactsList,
    keyInfoObj, setKeyInfoObj, productSpecsObj, setProductSpecsObj,
    certificationsObj, setCertificationsObj, dosageCalculatorObj, setDosageCalculatorObj,
    addLog, BACKEND_API, handleSEOAI, isSEOLoading
  } = props;

  const galleryList = parseImageList(formData.images);
  const secondImage = galleryList[0] || '';
  const extraImages = galleryList.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Image Column: 2 Dedicated Image Tables (Cover + Second) + Extra Gallery */}
      <div className="lg:col-span-1 space-y-6">
        {/* Table 1: Cover Image (الغلاف) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} />
              الجدول 1: صورة الغلاف (الأساسية)
            </label>
            <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              واجهة العبوة
            </span>
          </div>

          <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden group shadow-inner transition-all">
            {formData.image ? (
              <>
                <img src={formData.image} className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" alt="غلاف المنتج" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="relative">
                    <button type="button" className="bg-white text-emerald-600 p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[9px] font-black cursor-pointer">
                      <Edit2 size={12} /> استبدال
                    </button>
                    <input
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      type="file"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'main')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل تريد حذف صورة الغلاف؟')) {
                        setFormData({ ...formData, image: '' });
                        addLog?.('تم حذف صورة الغلاف');
                      }
                    }}
                    className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[9px] font-black cursor-pointer"
                  >
                    <Trash2 size={12} /> حذف
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center p-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-1">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-black text-slate-800">اختر صورة الغلاف</span>
                <span className="text-[10px] font-bold text-slate-400">اسحب صورة أو اضغط للرفع</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'main')}
              className={`absolute inset-0 opacity-0 cursor-pointer ${formData.image ? 'pointer-events-none' : ''}`}
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-emerald-600" size={28} />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block mb-1">رابط صورة الغلاف (Front Image URL)</span>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://.../front-image.png"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500/40 rounded-xl py-2 px-3 font-mono text-[11px] outline-none transition-all text-slate-700 text-left"
                dir="ltr"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block mb-1">النص البديل لصورة الغلاف (Alt Text)</span>
              <input
                type="text"
                value={formData.imageAlt || ''}
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                placeholder="صورة أمامية لعبوة المنتج..."
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500/40 rounded-xl py-2 px-3 font-bold text-[11px] outline-none transition-all text-slate-700"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Table 2: Second Image (الصورة الثانية / الخلفية) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} />
              الجدول 2: الصورة الثانية (الخلفية / الظهر)
            </label>
            <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
              ظهر العبوة / المكونات
            </span>
          </div>

          <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500/50 flex flex-col items-center justify-center overflow-hidden group shadow-inner transition-all">
            {secondImage ? (
              <>
                <img src={secondImage} className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" alt="الصورة الثانية" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="relative">
                    <button type="button" className="bg-white text-emerald-600 p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[9px] font-black cursor-pointer">
                      <Edit2 size={12} /> استبدال
                    </button>
                    <input
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      type="file"
                      onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        await handleFileUpload(e.target.files[0], 'second');
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل تريد حذف الصورة الثانية؟')) {
                        const updated = galleryList.slice(1);
                        setFormData({ ...formData, images: serializeImageList(updated) });
                        addLog?.('تم حذف الصورة الثانية');
                      }
                    }}
                    className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[9px] font-black cursor-pointer"
                  >
                    <Trash2 size={12} /> حذف
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center p-4">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-1">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-black text-slate-800">اختر الصورة الثانية</span>
                <span className="text-[10px] font-bold text-slate-400">ظهر العبوة أو البطاقة الغذائية</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                await handleFileUpload(e.target.files[0], 'second');
              }}
              className={`absolute inset-0 opacity-0 cursor-pointer ${secondImage ? 'pointer-events-none' : ''}`}
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-blue-600" size={28} />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block mb-1">رابط الصورة الثانية (Back Image URL)</span>
              <input
                type="text"
                value={secondImage}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  const updated = val ? [val, ...extraImages] : [...extraImages];
                  setFormData({ ...formData, images: serializeImageList(updated) });
                }}
                placeholder="https://.../back-image.jpg"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500/40 rounded-xl py-2 px-3 font-mono text-[11px] outline-none transition-all text-slate-700 text-left"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Optional Extra Images */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              صور إضافية للمعرض (اختياري)
            </label>
            {extraImages.length > 0 && (
              <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {extraImages.length} صور إضافية
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {extraImages.map((img: string, idx: number) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-sm hover:shadow-md transition-all">
                <img src={img} className="w-full h-full object-cover" alt="معرض إضافي" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                  <div className="relative">
                    <button type="button" className="bg-white text-emerald-600 p-1.5 rounded-lg shadow hover:scale-110 transition-all flex items-center gap-1 text-[8px] font-black cursor-pointer">
                      <Edit2 size={10} /> استبدال
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        setUploading(true);
                        const uploadData = new FormData();
                        uploadData.append('image', e.target.files[0]);
                        try {
                          const res = await fetch(BACKEND_API + '/api/upload', {
                            method: 'POST',
                            body: uploadData,
                            headers: (typeof window !== 'undefined' && (sessionStorage.getItem('mithaly_admin_token') || localStorage.getItem('mithaly_admin_token')))
                              ? { 'Authorization': `Bearer ${sessionStorage.getItem('mithaly_admin_token') || localStorage.getItem('mithaly_admin_token')}` }
                              : {}
                          });
                          const result = await res.json();
                          if (res.ok && result.url) {
                            const newExtra = [...extraImages];
                            newExtra[idx] = result.url;
                            const fullList = [secondImage, ...newExtra].filter(Boolean);
                            setFormData({ ...formData, images: serializeImageList(fullList) });
                            addLog?.('تم استبدال الصورة بنجاح');
                          }
                        } catch {
                          alert('فشل الاستبدال');
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm('هل تريد حذف هذه الصورة من المعرض؟')) return;
                      const newExtra = [...extraImages];
                      newExtra.splice(idx, 1);
                      const fullList = [secondImage, ...newExtra].filter(Boolean);
                      setFormData({ ...formData, images: serializeImageList(fullList) });
                      addLog?.('تم حذف الصورة من المعرض');
                    }}
                    className="bg-red-500 text-white p-1.5 rounded-lg shadow hover:scale-110 transition-all flex items-center gap-1 text-[8px] font-black cursor-pointer"
                  >
                    <Trash2 size={10} /> حذف
                  </button>
                </div>
              </div>
            ))}
            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-emerald-600/20 bg-emerald-600/5 flex items-center justify-center cursor-pointer hover:bg-emerald-600/10 transition-colors">
              {uploading ? <Loader2 className="animate-spin text-emerald-600" size={16} /> : <Plus size={18} className="text-emerald-600/50" />}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  if (!e.target.files) return;
                  const files = Array.from(e.target.files);
                  for (const file of files) await handleFileUpload(file, 'gallery');
                  e.target.value = '';
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fields Column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Title & AI Actions (Bilingual) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="text-xs font-black text-slate-800 block mr-1">بيانات اسم المنتج (عربي وإنجليزي)</label>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={handleAIFill} 
                disabled={isAILoading || !formData.title} 
                className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isAILoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                <span>أكمل بالذكاء الاصطناعي</span>
              </button>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslatingLoading || !formData.title}
                className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-200 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isTranslatingLoading ? <Loader2 className="animate-spin" size={14} /> : <Languages size={14} />}
                <span>إضافة الترجمة</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">اسم المنتج بالعربية</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <input 
                type="text" 
                value={formData.title || ''} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-500/30 rounded-2xl py-3 px-4 font-bold text-sm outline-none transition-all text-slate-800" 
                placeholder="مثال: ناو ألفا جي بي سي 300 ملغ" 
                dir="rtl"
                required 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">Product Title (English)</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <input 
                type="text" 
                value={formData.titleEn || ''} 
                onChange={e => setFormData({...formData, titleEn: e.target.value})} 
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500/30 rounded-2xl py-3 px-4 font-bold text-sm outline-none transition-all text-slate-800 text-left" 
                placeholder="e.g. Now Alpha GPC 300mg" 
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Category and Brands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 block mr-1">القسم</label>
            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-slate-50 rounded-2xl py-3.5 px-5 font-bold text-xs outline-none border border-transparent focus:border-emerald-500/20 transition-all text-slate-700" required>
              <option value="" disabled>اختر القسم المناسب...</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 relative">
            <label className="text-xs font-black text-slate-800 block mr-1">الشركة المصنعة / الماركة</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="text" value={brandSearch} onChange={e => {setBrandSearch(e.target.value); setFormData({...formData, brandName: e.target.value}); setShowBrandSuggestions(true)}} onFocus={() => setShowBrandSuggestions(true)} className="w-full bg-slate-50 rounded-2xl py-3.5 px-5 font-bold text-xs outline-none border border-transparent focus:border-emerald-500/20 transition-all text-slate-700" placeholder="اسم الشركة..." />
                {showBrandSuggestions && brandSearch && (
                  <div className="absolute top-full right-0 left-0 bg-white shadow-2xl rounded-2xl mt-2 z-50 border border-slate-100 max-h-48 overflow-y-auto">
                    {filteredBrands.length > 0 ? filteredBrands.map((b: any) => (
                      <button key={b.id} type="button" onClick={() => {setFormData({...formData, brandId: b.id, brandName: b.name}); setBrandSearch(b.name); setShowBrandSuggestions(false)}} className="w-full text-right px-6 py-3 hover:bg-slate-50 font-bold text-xs flex items-center gap-3 border-b last:border-0 border-slate-50">
                        <img src={b.image} className="w-6 h-6 rounded-full object-cover border" />
                        {b.name}
                      </button>
                    )) : (
                      <div className="px-6 py-3 text-[10px] text-slate-400 font-bold italic">سيتم إنشاء ماركة جديدة باسم "{brandSearch}"</div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative shrink-0">
                <button type="button" className="bg-slate-100 hover:bg-slate-200 p-3.5 rounded-2xl transition-all cursor-pointer">
                  {brandUploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                </button>
                <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'brand')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 block mr-1">السعر الحالي (ج.م)</label>
            <input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 rounded-2xl py-3.5 px-5 font-black text-emerald-600 text-sm outline-none" placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 block mr-1">السعر القديم لشطب السعر</label>
            <input type="number" value={formData.oldPrice || ''} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full bg-slate-50 rounded-2xl py-3.5 px-5 font-bold text-xs text-red-500 outline-none" placeholder="اختياري" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 block mr-1">خصومات خاصة</label>
            <div className="flex gap-2">
              <select value={formData.discountType || ''} onChange={e => setFormData({...formData, discountType: e.target.value})} className="flex-1 bg-slate-50 rounded-2xl py-3.5 px-4 font-bold text-xs outline-none text-slate-700">
                <option value="">لا يوجد خصم</option>
                <option value="percentage">نسبة (%)</option>
                <option value="fixed">مبلغ ثابت (ج.م)</option>
              </select>
              {formData.discountType && (
                <input type="number" value={formData.discountValue || ''} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-20 bg-slate-50 rounded-2xl py-3.5 px-3 font-black text-xs text-center text-slate-700" placeholder="القيمة" />
              )}
            </div>
          </div>
        </div>

        {/* Descriptions (Arabic & English) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 block mr-1">وصف المنتج (عربي وإنجليزي)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">الوصف بالعربية</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.desc || ''} 
                onChange={e => setFormData({...formData, desc: e.target.value})} 
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-500/20 rounded-[1.5rem] py-4 px-5 font-bold text-xs min-h-[150px] outline-none transition-all text-slate-700 leading-relaxed" 
                placeholder="اكتب وصفاً مفصلاً يوضح الفوائد والمميزات هنا..." 
                dir="rtl"
                required 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">Product Description (English)</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.descEn || ''} 
                onChange={e => setFormData({...formData, descEn: e.target.value})} 
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500/20 rounded-[1.5rem] py-4 px-5 font-bold text-xs min-h-[150px] outline-none transition-all text-slate-700 leading-relaxed text-left" 
                placeholder="Write a comprehensive English product description..." 
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Features (Arabic & English) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 block mr-1">مميزات المنتج وفوائده (كل ميزة في سطر منفصل)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">المميزات بالعربية</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.features || ''} 
                onChange={e => setFormData({...formData, features: e.target.value})} 
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-500/20 rounded-[1.5rem] py-4 px-5 font-bold text-xs min-h-[110px] outline-none transition-all text-slate-700 leading-relaxed" 
                placeholder="الميزة الأولى&#10;الميزة الثانية&#10;الميزة الثالثة" 
                dir="rtl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">Features (English - One per line)</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.featuresEn || ''} 
                onChange={e => setFormData({...formData, featuresEn: e.target.value})} 
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500/20 rounded-[1.5rem] py-4 px-5 font-bold text-xs min-h-[110px] outline-none transition-all text-slate-700 leading-relaxed text-left" 
                placeholder="First feature&#10;Second feature&#10;Third feature" 
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Visual Builders Section */}
        <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-8 space-y-8 border border-slate-100">
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b pb-3 border-slate-200/50">
            <Sparkles size={16} /> مُحرر بيانات المكملات والمنتجات الذكي
          </h4>

          {/* Sizes & Prices Editor (Bilingual) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">الأحجام المتوفرة وأسعارها الاختيارية (عربي وإنجليزي)</label>
            <div className="space-y-2">
              {(Array.isArray(sizesPricesList) ? sizesPricesList : []).map((item: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in">
                  <input 
                    type="text" 
                    value={item.size} 
                    onChange={(e) => {
                      const newList = [...sizesPricesList];
                      newList[index].size = e.target.value;
                      setSizesPricesList(newList);
                    }} 
                    placeholder="الحجم بالعربي (مثال: 60 كبسولة)" 
                    className="flex-1 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none" 
                    dir="rtl"
                  />
                  <input 
                    type="text" 
                    value={item.sizeEn || ''} 
                    onChange={(e) => {
                      const newList = [...sizesPricesList];
                      newList[index].sizeEn = e.target.value;
                      setSizesPricesList(newList);
                    }} 
                    placeholder="Size EN (e.g. 60 Veg Capsules)" 
                    className="flex-1 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none text-left" 
                    dir="ltr"
                  />
                  <div className="flex gap-2 items-center w-full sm:w-auto">
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => {
                        const newList = [...sizesPricesList];
                        newList[index].price = parseFloat(e.target.value) || 0;
                        setSizesPricesList(newList);
                      }} 
                      placeholder="السعر (ج.م)" 
                      className="flex-1 sm:w-28 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-center text-slate-700 outline-none" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setSizesPricesList(sizesPricesList.filter((_: any, idx: number) => idx !== index))} 
                      className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setSizesPricesList([...(Array.isArray(sizesPricesList) ? sizesPricesList : []), { size: '', sizeEn: '', price: '' }])}
                className="w-full border-2 border-dashed border-emerald-600/20 bg-white hover:bg-slate-50 text-emerald-600 text-xs font-black py-3 rounded-xl transition-all cursor-pointer"
              >
                + إضافة خيار حجم وسعر جديد
              </button>
            </div>
          </div>

          {/* Supplement Facts Editor (Bilingual) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">جدول الحقائق الغذائية (Supplement Facts - عربي وإنجليزي)</label>
            <div className="space-y-2">
              {(Array.isArray(supplementFactsList) ? supplementFactsList : []).map((item: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in">
                  <input 
                    type="text" 
                    value={item.name} 
                    onChange={(e) => {
                      const newList = [...supplementFactsList];
                      newList[index].name = e.target.value;
                      setSupplementFactsList(newList);
                    }} 
                    placeholder="العنصر بالعربية (مثال: فيتامين سي)" 
                    className="flex-1 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none" 
                    dir="rtl"
                  />
                  <input 
                    type="text" 
                    value={item.name_en || ''} 
                    onChange={(e) => {
                      const newList = [...supplementFactsList];
                      newList[index].name_en = e.target.value;
                      setSupplementFactsList(newList);
                    }} 
                    placeholder="Ingredient EN (e.g. Vitamin C)" 
                    className="flex-1 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none text-left" 
                    dir="ltr"
                  />
                  <div className="flex gap-2 items-center w-full sm:w-auto">
                    <input 
                      type="text" 
                      value={item.amount} 
                      onChange={(e) => {
                        const newList = [...supplementFactsList];
                        newList[index].amount = e.target.value;
                        setSupplementFactsList(newList);
                      }} 
                      placeholder="الكمية (500 ملجم)" 
                      className="flex-1 sm:w-28 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-center text-slate-700 outline-none" 
                    />
                    <input 
                      type="text" 
                      value={item.dv} 
                      onChange={(e) => {
                        const newList = [...supplementFactsList];
                        newList[index].dv = e.target.value;
                        setSupplementFactsList(newList);
                      }} 
                      placeholder="النسبة (DV)" 
                      className="w-20 sm:w-24 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-center text-slate-700 outline-none" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setSupplementFactsList(supplementFactsList.filter((_: any, idx: number) => idx !== index))} 
                      className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setSupplementFactsList([...(Array.isArray(supplementFactsList) ? supplementFactsList : []), { name: '', name_en: '', amount: '', dv: '' }])}
                className="w-full border-2 border-dashed border-emerald-600/20 bg-white hover:bg-slate-50 text-emerald-600 text-xs font-black py-3 rounded-xl transition-all cursor-pointer"
              >
                + إضافة عنصر غذائي جديد لجدول الحقائق
              </button>
            </div>
          </div>

          {/* Key Info Editor */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">بيانات الاستخدام والمنشأ (Key Info)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">حجم الجرعة اليومية</label>
                <input type="text" value={keyInfoObj.servingSize || ''} onChange={(e) => setKeyInfoObj({...keyInfoObj, servingSize: e.target.value})} placeholder="مثال: 1 كبسولة يومياً" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">إجمالي الحصص بالعبوة</label>
                <input type="text" value={keyInfoObj.totalServings || ''} onChange={(e) => setKeyInfoObj({...keyInfoObj, totalServings: e.target.value})} placeholder="مثال: 60 جرعة" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">بلد المنشأ والاستيراد</label>
                <input type="text" value={keyInfoObj.origin || ''} onChange={(e) => setKeyInfoObj({...keyInfoObj, origin: e.target.value})} placeholder="مثال: الولايات المتحدة الأمريكية" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">تاريخ انتهاء الصلاحية</label>
                <input type="text" value={keyInfoObj.bestBefore || ''} onChange={(e) => setKeyInfoObj({...keyInfoObj, bestBefore: e.target.value})} placeholder="مثال: 12/2026" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
            </div>
          </div>

          {/* Product Specs Editor */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">المواصفات الفنية للعبوة</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">رمز المخزن (SKU)</label>
                <input type="text" value={productSpecsObj.sku || ''} onChange={(e) => setProductSpecsObj({...productSpecsObj, sku: e.target.value})} placeholder="مثال: SKU-OMEGA3" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">وزن الشحن الكلي</label>
                <input type="text" value={productSpecsObj.shippingWeight || ''} onChange={(e) => setProductSpecsObj({...productSpecsObj, shippingWeight: e.target.value})} placeholder="مثال: 0.20 كجم" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">رمز المنتج العالمي (UPC)</label>
                <input type="text" value={productSpecsObj.upc || ''} onChange={(e) => setProductSpecsObj({...productSpecsObj, upc: e.target.value})} placeholder="مثال: 748252119022" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 block mr-1">الأبعاد الكلية للعبوة</label>
                <input type="text" value={productSpecsObj.dimensions || ''} onChange={(e) => setProductSpecsObj({...productSpecsObj, dimensions: e.target.value})} placeholder="مثال: 6 x 6 x 11 سم" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" />
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100/50 mt-1">
                <input 
                  type="checkbox" 
                  id="specAuthentic"
                  checked={!!productSpecsObj.authentic} 
                  onChange={(e) => setProductSpecsObj({...productSpecsObj, authentic: e.target.checked})} 
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="specAuthentic" className="text-xs font-black text-slate-700 cursor-pointer select-none">المنتج أصلي 100% ومستورد وخاضع لرقابة الجودة</label>
              </div>
            </div>
          </div>

          {/* Certifications Editor */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">الشهادات ومعايير الجودة</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
              {[
                { key: 'glutenFree', label: 'خالي من الجلوتين (Gluten Free)' },
                { key: 'dairyFree', label: 'خالي من الألبان (Dairy Free)' },
                { key: 'soyFree', label: 'خالي من الصويا (Soy Free)' },
                { key: 'treeNutFree', label: 'خالي من المكسرات (Nut Free)' },
                { key: 'nonGmo', label: 'غير معدل وراثياً (Non-GMO)' },
                { key: 'organic', label: 'منتج عضوي (Organic)' }
              ].map((cert) => (
                <div key={cert.key} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`cert-${cert.key}`}
                    checked={!!certificationsObj[cert.key]} 
                    onChange={(e) => setCertificationsObj({...certificationsObj, [cert.key]: e.target.checked})} 
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor={`cert-${cert.key}`} className="text-[11px] font-bold text-slate-600 cursor-pointer select-none">{cert.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Dosage Calculator Editor */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <input 
                type="checkbox" 
                id="calcEnabled"
                checked={!!dosageCalculatorObj?.enabled} 
                onChange={(e) => setDosageCalculatorObj({...dosageCalculatorObj, enabled: e.target.checked})} 
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="calcEnabled" className="text-xs font-black text-slate-800 cursor-pointer select-none">تفعيل حاسبة الجرعة التفاعلية لهذا المنتج</label>
            </div>

            {dosageCalculatorObj?.enabled && (
              <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">عنوان الحاسبة</label>
                    <input 
                      type="text" 
                      value={dosageCalculatorObj.title || ''} 
                      onChange={(e) => setDosageCalculatorObj({...dosageCalculatorObj, title: e.target.value})} 
                      placeholder="مثال: حاسبة جرعة المغنيسيوم الذكية" 
                      className="w-full bg-slate-50 rounded-xl p-2.5 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">الجنس المستهدف</label>
                    <select 
                      value={dosageCalculatorObj.genderTarget || 'both'} 
                      onChange={(e) => setDosageCalculatorObj({...dosageCalculatorObj, genderTarget: e.target.value})} 
                      className="w-full bg-slate-50 rounded-xl p-2.5 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700"
                    >
                      <option value="both">كلاهما (ذكور وإناث)</option>
                      <option value="male">ذكور فقط (إخفاء خيار الإناث)</option>
                      <option value="female">إناث فقط (إخفاء خيار الذكور)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">أيقونة الحاسبة</label>
                    <select 
                      value={dosageCalculatorObj.icon || 'Activity'} 
                      onChange={(e) => setDosageCalculatorObj({...dosageCalculatorObj, icon: e.target.value})} 
                      className="w-full bg-slate-50 rounded-xl p-2.5 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700"
                    >
                      <option value="Activity">نبض نشاط (Activity)</option>
                      <option value="Sun">شمس (Sun)</option>
                      <option value="Droplet">قطرة ماء (Droplet)</option>
                      <option value="Moon">هلال ونوم (Moon)</option>
                      <option value="Dumbbell">دمبل ورياضة (Dumbbell)</option>
                      <option value="Sparkles">بريق ولمعان (Sparkles)</option>
                      <option value="Flame">نار ونشاط (Flame)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 block mr-1">عنوان حقل الاختيار</label>
                    <input 
                      type="text" 
                      value={dosageCalculatorObj.optionsLabel || 'الهدف الأساسي:'} 
                      onChange={(e) => setDosageCalculatorObj({...dosageCalculatorObj, optionsLabel: e.target.value})} 
                      placeholder="الهدف الأساسي:" 
                      className="w-full bg-slate-50 rounded-xl p-2.5 text-xs font-bold outline-none border border-transparent focus:border-emerald-500/10 text-slate-700" 
                    />
                  </div>
                </div>

                {/* Rules/Options List */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">الأهداف والجرعات المقابلة لها</label>
                  <div className="space-y-4">
                    {(dosageCalculatorObj.rules || []).map((rule: any, index: number) => (
                      <div key={index} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4 relative animate-in fade-in">
                        <button 
                          type="button" 
                          onClick={() => {
                            const newRules = (dosageCalculatorObj.rules || []).filter((_: any, idx: number) => idx !== index);
                            setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                          }} 
                          className="absolute top-2 left-2 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                          title="حذف هذا الخيار"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 block mr-1">اسم الهدف بالعربية</label>
                            <input 
                              type="text" 
                              value={rule.label || ''} 
                              onChange={(e) => {
                                const newRules = [...(dosageCalculatorObj.rules || [])];
                                newRules[index].label = e.target.value;
                                newRules[index].value = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                              }} 
                              placeholder="مثال: النوم والاسترخاء" 
                              className="w-full bg-white rounded-xl p-2 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500/10" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 block mr-1">القيمة البرمجية (Unique Key)</label>
                            <input 
                              type="text" 
                              value={rule.value || ''} 
                              onChange={(e) => {
                                const newRules = [...(dosageCalculatorObj.rules || [])];
                                newRules[index].value = e.target.value;
                                setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                              }} 
                              placeholder="sleep" 
                              className="w-full bg-white rounded-xl p-2 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500/10 text-left" 
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 block mr-1">أيقونة الخيار</label>
                            <select 
                              value={rule.icon || 'Activity'} 
                              onChange={(e) => {
                                const newRules = [...(dosageCalculatorObj.rules || [])];
                                newRules[index].icon = e.target.value;
                                setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                              }} 
                              className="w-full bg-white rounded-xl p-2 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500/10"
                            >
                              <option value="Activity">نبض نشاط (Activity)</option>
                              <option value="Sun">شمس (Sun)</option>
                              <option value="Droplet">قطرة ماء (Droplet)</option>
                              <option value="Moon">هلال ونوم (Moon)</option>
                              <option value="Dumbbell">دمبل ورياضة (Dumbbell)</option>
                              <option value="Sparkles">بريق ولمعان (Sparkles)</option>
                              <option value="Flame">نار ونشاط (Flame)</option>
                            </select>
                          </div>
                        </div>

                        {/* Rules values grid based on genderTarget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-200">
                          {(dosageCalculatorObj.genderTarget === 'both' || dosageCalculatorObj.genderTarget === 'male') && (
                            <div className="space-y-2.5 bg-slate-100/30 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-black text-blue-500 block mr-1">توصيات الذكور:</span>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block">الاحتياج المقترح للذكور</label>
                                <input type="text" value={rule.maleDose || ''} onChange={(e) => {
                                  const newRules = [...(dosageCalculatorObj.rules || [])];
                                  newRules[index].maleDose = e.target.value;
                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                                }} placeholder="مثال: 400 ملجم" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block">جرعة الكبسولات المقترحة</label>
                                <input type="text" value={rule.maleCapsules || ''} onChange={(e) => {
                                  const newRules = [...(dosageCalculatorObj.rules || [])];
                                  newRules[index].maleCapsules = e.target.value;
                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                                }} placeholder="مثال: كبسولتين يومياً" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block">نصيحة الاستخدام</label>
                                <textarea value={rule.maleTip || ''} onChange={(e) => {
                                  const newRules = [...(dosageCalculatorObj.rules || [])];
                                  newRules[index].maleTip = e.target.value;
                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                                }} placeholder="يفضل تناولها مع وجبة العشاء..." className="w-full bg-white rounded-lg p-2 text-[11px] font-bold min-h-[50px] outline-none border border-slate-100" />
                              </div>
                            </div>
                          )}

                          {(dosageCalculatorObj.genderTarget === 'both' || dosageCalculatorObj.genderTarget === 'female') && (
                            <div className="space-y-2.5 bg-slate-100/30 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-black text-rose-500 block mr-1">توصيات الإناث:</span>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block">الاحتياج المقترح للإناث</label>
                                <input type="text" value={rule.femaleDose || ''} onChange={(e) => {
                                  const newRules = [...(dosageCalculatorObj.rules || [])];
                                  newRules[index].femaleDose = e.target.value;
                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                                }} placeholder="مثال: 320 ملجم" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block">جرعة الكبسولات المقترحة</label>
                                <input type="text" value={rule.femaleCapsules || ''} onChange={(e) => {
                                  const newRules = [...(dosageCalculatorObj.rules || [])];
                                  newRules[index].femaleCapsules = e.target.value;
                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                                }} placeholder="مثال: كبسولة واحدة يومياً" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block">نصيحة الاستخدام</label>
                                <textarea value={rule.femaleTip || ''} onChange={(e) => {
                                  const newRules = [...(dosageCalculatorObj.rules || [])];
                                  newRules[index].femaleTip = e.target.value;
                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules});
                                }} placeholder="يفضل تناولها مع الوجبة..." className="w-full bg-white rounded-lg p-2 text-[11px] font-bold min-h-[50px] outline-none border border-slate-100" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button 
                      type="button" 
                      onClick={() => {
                        const rules = dosageCalculatorObj.rules || [];
                        setDosageCalculatorObj({
                          ...dosageCalculatorObj,
                          rules: [...rules, { value: '', label: '', icon: 'Activity', maleDose: '', maleCapsules: '', maleTip: '', femaleDose: '', femaleCapsules: '', femaleTip: '' }]
                        });
                      }} 
                      className="w-full border-2 border-dashed border-emerald-600/20 bg-white hover:bg-slate-50 text-emerald-600 text-xs font-black py-3 rounded-xl transition-all cursor-pointer"
                    >
                      + إضافة خيار / هدف جديد للحاسبة
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Optimization Section (Bilingual) */}
        <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-8 space-y-6 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200/50">
            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} /> تحسين محركات البحث وجوجل (SEO - عربي وإنجليزي)
            </h4>
            <button 
              type="button" 
              onClick={handleSEOAI} 
              disabled={isSEOLoading || !formData.title} 
              className="text-[10px] bg-white text-emerald-600 border border-slate-200 px-4 py-2 rounded-xl font-black shadow-sm flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              {isSEOLoading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />} 
              <span>توليد بيانات SEO تلقائياً</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">كلمات البحث المفتاحية (عربي)</label>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.seoKeywords || ''} 
                onChange={e => setFormData({...formData, seoKeywords: e.target.value})} 
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[85px] outline-none text-slate-600 leading-relaxed" 
                placeholder="كلمات مفتاحية بالعربية مفصولة بفواصل..." 
                dir="rtl" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Meta Keywords (English)</label>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.seoKeywordsEn || ''} 
                onChange={e => setFormData({...formData, seoKeywordsEn: e.target.value})} 
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[85px] outline-none text-slate-600 leading-relaxed text-left" 
                placeholder="English keywords separated by commas..." 
                dir="ltr" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">وصف البحث المختصر (عربي)</label>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.seoDesc || ''} 
                onChange={e => setFormData({...formData, seoDesc: e.target.value})} 
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[75px] outline-none text-slate-600 leading-relaxed" 
                placeholder="وصف جذاب يظهر في نتائج بحث جوجل بالعربية..." 
                dir="rtl" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Meta Description (English)</label>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.seoDescEn || ''} 
                onChange={e => setFormData({...formData, seoDescEn: e.target.value})} 
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[75px] outline-none text-slate-600 leading-relaxed text-left" 
                placeholder="Compelling meta description for Google English search results..." 
                dir="ltr" 
              />
            </div>
          </div>
        </div>

        {/* Usage & Directions (Arabic & English) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 block mr-1">طريقة وجرعات الاستخدام (عربي وإنجليزي)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">طريقة الاستخدام بالعربية</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.directions || ''} 
                onChange={e => setFormData({...formData, directions: e.target.value})} 
                placeholder="اكتب طريقة وجرعات الاستخدام المثالية للمنتج هنا..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-700" 
                dir="rtl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">Suggested Use & Directions (English)</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.usageEn || ''} 
                onChange={e => setFormData({...formData, usageEn: e.target.value})} 
                placeholder="Directions and suggested usage in English..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-700 text-left" 
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Warnings & Precautions (Arabic & English) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 block mr-1">المحاذير وموانع الاستخدام (عربي وإنجليزي)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">التحذيرات بالعربية</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.warnings || ''} 
                onChange={e => setFormData({...formData, warnings: e.target.value})} 
                placeholder="اكتب محاذير وموانع استخدام المنتج أو الحساسية هنا..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-700" 
                dir="rtl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-500">Warnings & Cautions (English)</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.warningsEn || ''} 
                onChange={e => setFormData({...formData, warningsEn: e.target.value})} 
                placeholder="Warnings, cautions, and allergen notes in English..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-700 text-left" 
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Ingredients & Legal Disclaimer (Arabic & English) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-800">المكونات التفصيلية (عربي)</label>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.ingredients || ''} 
                onChange={e => setFormData({...formData, ingredients: e.target.value})} 
                placeholder="المكونات التفصيلية للمنتج بالعربية..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[85px] outline-none text-slate-700" 
                dir="rtl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-800">Detailed Ingredients (English)</label>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.ingredientsEn || ''} 
                onChange={e => setFormData({...formData, ingredientsEn: e.target.value})} 
                placeholder="Detailed ingredients in English..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[85px] outline-none text-slate-700 text-left" 
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-800">إخلاء المسؤولية القانوني (عربي)</label>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">عربي</span>
              </div>
              <textarea 
                value={formData.disclaimer || ''} 
                onChange={e => setFormData({...formData, disclaimer: e.target.value})} 
                placeholder="إخلاء مسؤولية قانوني افتراضي بالعربية..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[85px] outline-none text-slate-700" 
                dir="rtl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-800">Legal Disclaimer (English)</label>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">EN</span>
              </div>
              <textarea 
                value={formData.disclaimerEn || ''} 
                onChange={e => setFormData({...formData, disclaimerEn: e.target.value})} 
                placeholder="Legal disclaimer in English..." 
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[85px] outline-none text-slate-700 text-left" 
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
