import React from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Sparkles, Image as ImageIcon, Languages } from 'lucide-react';

export default function ProductsForm(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, setUploading, handleFileUpload, 
    categories, brandSearch, setBrandSearch, showBrandSuggestions, setShowBrandSuggestions,
    filteredBrands, brandUploading, isAILoading, handleAIFill,
    handleAutoTranslate, isTranslatingLoading,
    sizesPricesList, setSizesPricesList, supplementFactsList, setSupplementFactsList,
    keyInfoObj, setKeyInfoObj, productSpecsObj, setProductSpecsObj,
    certificationsObj, setCertificationsObj, dosageCalculatorObj, setDosageCalculatorObj,
    faqsList, setFaqsList,
    addLog, handleSEOAI, isSEOLoading, uploadAdminImage
  } = props;

  return (
    <>
      <>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Image Columns */}
                        <div className="lg:col-span-1 space-y-6">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mr-1">الصورة الرئيسية</label>
                          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[10px] font-bold text-emerald-800 leading-relaxed">
                            هذه هي الصورة التي ستظهر في Google ونتائج البحث وكروت المنتجات. لا تضع هنا صورة منتج آخر أو صورة من المعرض.
                          </div>
                          <div className="aspect-square bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                            {formData.image ? (
                              <>
                                <img src={formData.image} className="w-full h-full object-contain p-4" alt="preview" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-white px-4 py-2 rounded-2xl text-emerald-600 flex items-center gap-2 font-black text-xs shadow-md">
                                    <Edit2 size={14} /> تغيير الصورة
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-center p-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2"><Upload size={18} /></div>
                                <span className="text-xs font-black text-slate-800">اختر صورة رئيسية</span>
                                <span className="text-[10px] font-bold text-slate-400">اسحب صورة أو اضغط هنا</span>
                              </div>
                            )}
                            <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            {uploading && (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="animate-spin text-emerald-600" size={32} />
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-4 space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1">صور معرض المنتج</label>
                            <div className="grid grid-cols-4 gap-3">
                              {(formData.images ? formData.images.split(',').filter(Boolean) : []).map((img: string, idx: number) => (
                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-sm hover:shadow-md transition-all">
                                  <img src={img} className="w-full h-full object-cover" alt="gallery" />
                                  
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="relative">
                                      <button type="button" className="bg-white text-emerald-600 p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[9px] font-black">
                                        <Edit2 size={12} /> استبدال
                                      </button>
                                      <input type="file" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setUploading(true);
                                        try {
                                          const result = await uploadAdminImage(file, formData.imageAlt || formData.title || file.name, formData.title);
                                          const imgs = formData.images.split(',').filter(Boolean);
                                          imgs[idx] = result.url;
                                          setFormData({...formData, images: imgs.join(',')});
                                          addLog('تم استبدال الصورة بنجاح');
                                        } catch (err: any) {
                                          if (!err.isAdminUnauthorized) alert('فشل الاستبدال: ' + (err.message || 'خطأ غير معروف'));
                                        } finally {
                                          setUploading(false);
                                          e.target.value = '';
                                        }
                                      }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    
                                    <button type="button" onClick={() => {
                                      if (!confirm('هل تريد حذف هذه الصورة من المعرض؟')) return;
                                      const imgs = formData.images.split(',').filter(Boolean);
                                      imgs.splice(idx, 1);
                                      setFormData({...formData, images: imgs.join(',')});
                                      addLog('تم حذف الصورة من المعرض');
                                    }} className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all flex items-center gap-1 text-[9px] font-black">
                                      <Trash2 size={12} /> حذف
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className="relative aspect-square rounded-2xl border-2 border-dashed border-emerald-600/20 bg-emerald-600/5 flex items-center justify-center cursor-pointer hover:bg-emerald-600/10 transition-colors">
                                {uploading ? <Loader2 className="animate-spin text-emerald-600" size={16} /> : <Plus size={20} className="text-emerald-600/50" />}
                                <input type="file" accept="image/*" multiple onChange={async (e) => {
                                  if (!e.target.files) return;
                                  const files = Array.from(e.target.files);
                                  for (const file of files) await handleFileUpload(file, 'gallery');
                                  e.target.value = '';
                                }} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fields Column */}
                        <div className="lg:col-span-2 space-y-8">
                          {/* Title & AI Auto Fill */}
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-800 block mr-1">اسم المنتج بالعربي</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="flex-1 bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-2xl py-3.5 px-6 font-bold text-sm sm:text-base outline-none transition-all text-slate-700" placeholder="مثال: أوميجا 3 تركيز عالي" required />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">

                              <button type="button" onClick={() => handleAIFill()} disabled={isAILoading || !formData.title} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200 disabled:opacity-50 cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]">
                                {isAILoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                <span>توليد بالذكاء الاصطناعي</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleAutoTranslate}
                                disabled={isTranslatingLoading || !formData.title}
                                className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-200 disabled:opacity-50 cursor-pointer whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] mr-auto"
                              >
                                {isTranslatingLoading ? <Loader2 className="animate-spin" size={14} /> : <Languages size={14} />}
                                <span>ترجمة البيانات تلقائياً</span>
                              </button>
                            </div>
                            <div className="space-y-1 pt-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">English Product Name</label>
                              <input type="text" dir="ltr" value={formData.titleEn || ''} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-5 font-bold text-xs outline-none text-slate-600" placeholder="English translation will appear here" />
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
                                  <input type="text" value={brandSearch} onChange={e => {setBrandSearch(e.target.value); setFormData({...formData, brandName: e.target.value}); setShowBrandSuggestions(true)}} onFocus={() => setShowBrandSuggestions(true)} className="w-full bg-slate-50 rounded-2xl py-3.5 px-5 font-bold text-xs outline-none border border-transparent focus:border-emerald-500/20 transition-all text-slate-700" placeholder="اسم الشركة بالإنجليزية..." />
                                  {showBrandSuggestions && brandSearch && (
                                    <div className="absolute top-full right-0 left-0 bg-white shadow-2xl rounded-2xl mt-2 z-50 border border-slate-100 max-h-48 overflow-y-auto">
                                      {filteredBrands.length > 0 ? filteredBrands.map((b: any) => (
                                        <button key={b.id} type="button" onClick={() => {setFormData({...formData, brandId: b.id, brandName: b.name}); setBrandSearch(b.name); setShowBrandSuggestions(false)}} className="w-full text-right px-6 py-3 hover:bg-slate-50 font-bold text-xs flex items-center gap-3 border-b last:border-0 border-slate-50">
                                          <img src={b.image} className="w-6 h-6 rounded-full object-cover border" />
                                          {b.name}
                                        </button>
                                      )) : (
                                        <div className="px-6 py-3 text-[10px] text-slate-400 font-bold italic">سيتم إنشاء ماركة جديدة باسم &quot;{brandSearch}&quot;</div>
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
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-800 block mr-1">تاريخ انتهاء الصلاحية</label>
                              <input type="text" value={formData.expiryDate || ''} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-slate-50 rounded-2xl py-3.5 px-5 font-bold text-xs text-slate-700 outline-none" placeholder="مثال: 2028-10" />
                            </div>
                          </div>

                          {/* Standard Texts */}
                          <div className="space-y-4">
                            <label className="text-xs font-black text-slate-800 block mr-1">وصف المنتج (مطول وجذاب للمشتري)</label>
                            <textarea value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-[2rem] py-5 px-6 font-bold text-xs min-h-[160px] outline-none transition-all text-slate-700 leading-relaxed" placeholder="اكتب وصفاً مفصلاً يوضح الفوائد والمميزات هنا..." required />
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">English Description</label>
                              <textarea dir="ltr" value={formData.descEn || ''} onChange={e => setFormData({...formData, descEn: e.target.value})} className="w-full bg-white border border-slate-100 rounded-[2rem] py-4 px-5 font-bold text-xs min-h-[120px] outline-none text-slate-600 leading-relaxed" placeholder="English translation will appear here" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-xs font-black text-slate-800 block mr-1">مميزات المنتج (كل مميزة في سطر منفصل)</label>
                            <textarea value={formData.features || ''} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-[2rem] py-5 px-6 font-bold text-xs min-h-[120px] outline-none transition-all text-slate-700 leading-relaxed" placeholder="الميزة الأولى&#10;الميزة الثانية&#10;الميزة الثالثة" />
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">English Features</label>
                              <textarea dir="ltr" value={formData.featuresEn || ''} onChange={e => setFormData({...formData, featuresEn: e.target.value})} className="w-full bg-white border border-slate-100 rounded-[2rem] py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-600 leading-relaxed" placeholder="One feature per line" />
                            </div>
                          </div>

                          {/* Premium Visual Builders Section */}
                          <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-8 space-y-8 border border-slate-100">
                            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b pb-3 border-slate-200/50"><Sparkles size={16} /> مُحرر بيانات المكملات والمنتجات الذكي</h4>

                            {/* Sizes & Prices Editor */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">الأحجام المتوفرة وأسعارها الاختيارية</label>
                              <div className="space-y-2">
                                {sizesPricesList.map((item: any, index: number) => (
                                  <div key={index} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,26rem)] gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in">
                                    <input 
                                      type="text" 
                                      value={item.size} 
                                      onChange={(e) => {
                                        const newList = [...sizesPricesList]
                                        newList[index].size = e.target.value
                                        setSizesPricesList(newList)
                                      }} 
                                      placeholder="الحجم (مثال: 60 كبسولة)" 
                                      className="flex-1 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none" 
                                    />
                                    <div className="flex gap-2 items-center w-full sm:w-auto">
                                      <input 
                                        type="number" 
                                        value={item.price} 
                                        onChange={(e) => {
                                          const newList = [...sizesPricesList]
                                          newList[index].price = parseFloat(e.target.value) || 0
                                          setSizesPricesList(newList)
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
                                  onClick={() => setSizesPricesList([...sizesPricesList, { size: '', price: '' }])}
                                  className="w-full border-2 border-dashed border-emerald-600/20 bg-white hover:bg-slate-50 text-emerald-600 text-xs font-black py-3 rounded-xl transition-all cursor-pointer"
                                >
                                  + إضافة خيار حجم وسعر جديد
                                </button>
                              </div>
                            </div>

                            {/* Supplement Facts Editor */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">جدول الحقائق الغذائية (Supplement Facts)</label>
                              <div className="space-y-2">
                                {supplementFactsList.map((item: any, index: number) => (
                                  <div key={index} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in">
                                      <input 
                                        type="text" 
                                        value={item.name} 
                                      onChange={(e) => {
                                        const newList = [...supplementFactsList]
                                        newList[index].name = e.target.value
                                        setSupplementFactsList(newList)
                                      }} 
                                        placeholder="العنصر (مثال: Vitamin C)" 
                                        className="w-full min-w-0 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none" 
                                      />
                                      <input 
                                        type="text" 
                                        dir="ltr"
                                        value={item.name_en || ''} 
                                        onChange={(e) => {
                                          const newList = [...supplementFactsList]
                                          newList[index].name_en = e.target.value
                                          setSupplementFactsList(newList)
                                        }} 
                                        placeholder="Ingredient in English" 
                                        className="w-full min-w-0 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none" 
                                      />
                                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem_auto] gap-2 items-center w-full min-w-0">
                                      <input 
                                        type="text" 
                                        value={item.amount} 
                                        onChange={(e) => {
                                          const newList = [...supplementFactsList]
                                          newList[index].amount = e.target.value
                                          setSupplementFactsList(newList)
                                        }} 
                                        placeholder="الكمية (مثال: 500 ملجم)" 
                                        className="w-full min-w-0 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-center text-slate-700 outline-none" 
                                      />
                                      <input 
                                        type="text" 
                                        dir="ltr"
                                        value={item.amount_en || ''} 
                                        onChange={(e) => {
                                          const newList = [...supplementFactsList]
                                          newList[index].amount_en = e.target.value
                                          setSupplementFactsList(newList)
                                        }} 
                                        placeholder="Amount EN" 
                                        className="w-full min-w-0 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-center text-slate-700 outline-none" 
                                      />
                                      <input 
                                        type="text" 
                                        value={item.dv} 
                                        onChange={(e) => {
                                          const newList = [...supplementFactsList]
                                          newList[index].dv = e.target.value
                                          setSupplementFactsList(newList)
                                        }} 
                                        placeholder="النسبة (DV)" 
                                        className="w-full min-w-0 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-center text-slate-700 outline-none" 
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
                                  onClick={() => setSupplementFactsList([...supplementFactsList, { name: '', amount: '', dv: '' }])}
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
                                <div className="col-span-2 flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100/50 mt-1">
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
                              <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">الشهادات ومعايير الجودة (تحديد السريع)</label>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase mr-1">نص بديل لصورة المنتج (Image Alt)</label>
                                    <input type="text" value={formData.imageAlt || ''} onChange={e => setFormData({...formData, imageAlt: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs outline-none text-slate-600" placeholder="مثال: أوميجا 3 تركيز عالي من ناو فودز" />
                                    <p className="text-[10px] font-bold text-slate-400">يستخدم في SEO وقراءة الصور لمحركات البحث. لو سبت الحقل فاضي هنستخدم اسم المنتج تلقائياً.</p>
                                  </div>
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
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-400 block mr-1">عنوان حقل الاختيار بالإنجليزي</label>
                                      <input 
                                        type="text" 
                                        dir="ltr"
                                        value={dosageCalculatorObj.optionsLabel_en || ''} 
                                        onChange={(e) => setDosageCalculatorObj({...dosageCalculatorObj, optionsLabel_en: e.target.value})} 
                                        placeholder="Main Goal:" 
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
                                              const newRules = (dosageCalculatorObj.rules || []).filter((_: any, idx: number) => idx !== index)
                                              setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                            }} 
                                            className="absolute top-2 left-2 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                                            title="حذف هذا الخيار"
                                          >
                                            <Trash2 size={14} />
                                          </button>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                              <label className="text-[9px] font-black text-slate-400 block mr-1">اسم الهدف/الخيار (مثل: النوم والاسترخاء)</label>
                                              <input 
                                                type="text" 
                                                value={rule.label || ''} 
                                                onChange={(e) => {
                                                  const newRules = [...(dosageCalculatorObj.rules || [])]
                                                  newRules[index].label = e.target.value
                                                  // auto generate value
                                                  newRules[index].value = e.target.value.toLowerCase().replace(/\s+/g, '-')
                                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                }}
                                                placeholder="اسم الهدف"
                                                className="w-full bg-white rounded-xl p-2 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500/10" 
                                              />
                                              <input 
                                                type="text" 
                                                dir="ltr"
                                                value={rule.label_en || ''} 
                                                onChange={(e) => {
                                                  const newRules = [...(dosageCalculatorObj.rules || [])]
                                                  newRules[index].label_en = e.target.value
                                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                }}
                                                placeholder="English goal name"
                                                className="w-full bg-white rounded-xl p-2 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500/10 mt-2" 
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[9px] font-black text-slate-400 block mr-1">القيمة البرمجية (فريد بالإنجليزي، مثل: sleep)</label>
                                              <input 
                                                type="text" 
                                                value={rule.value || ''} 
                                                onChange={(e) => {
                                                  const newRules = [...(dosageCalculatorObj.rules || [])]
                                                  newRules[index].value = e.target.value
                                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                }}
                                                placeholder="القيمة"
                                                className="w-full bg-white rounded-xl p-2 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500/10" 
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[9px] font-black text-slate-400 block mr-1">أيقونة الخيار</label>
                                              <select 
                                                value={rule.icon || 'Activity'} 
                                                onChange={(e) => {
                                                  const newRules = [...(dosageCalculatorObj.rules || [])]
                                                  newRules[index].icon = e.target.value
                                                  setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
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
                                            {/* Male rules */}
                                            {(dosageCalculatorObj.genderTarget === 'both' || dosageCalculatorObj.genderTarget === 'male') && (
                                              <div className="space-y-2.5 bg-slate-100/30 p-3 rounded-xl border border-slate-100">
                                                <span className="text-[10px] font-black text-blue-500 block mr-1">توصيات الذكور:</span>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-slate-400 block">الاحتياج المقترح للذكور (مثال: 400 ملجم)</label>
                                                  <input type="text" value={rule.maleDose || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].maleDose = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="مثال: 400 ملجم" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                  <input type="text" dir="ltr" value={rule.maleDose_en || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].maleDose_en = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="English dose" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-slate-400 block">جرعة الكبسولات المقترحة للذكور (مثال: كبسولتين يومياً)</label>
                                                  <input type="text" value={rule.maleCapsules || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].maleCapsules = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="كبسولتين يومياً" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                  <input type="text" dir="ltr" value={rule.maleCapsules_en || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].maleCapsules_en = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="English capsules" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-slate-400 block">نصيحة الاستخدام للذكور</label>
                                                  <textarea value={rule.maleTip || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].maleTip = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="يفضل تناولها قبل النوم..." className="w-full bg-white rounded-lg p-2 text-[11px] font-bold min-h-[50px] outline-none border border-slate-100" />
                                                  <textarea dir="ltr" value={rule.maleTip_en || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].maleTip_en = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="English tip" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold min-h-[50px] outline-none border border-slate-100" />
                                                </div>
                                              </div>
                                            )}

                                            {/* Female rules */}
                                            {(dosageCalculatorObj.genderTarget === 'both' || dosageCalculatorObj.genderTarget === 'female') && (
                                              <div className="space-y-2.5 bg-slate-100/30 p-3 rounded-xl border border-slate-100">
                                                <span className="text-[10px] font-black text-rose-500 block mr-1">توصيات الإناث:</span>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-slate-400 block">الاحتياج المقترح للإناث (مثال: 320 ملجم)</label>
                                                  <input type="text" value={rule.femaleDose || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].femaleDose = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="مثال: 320 ملجم" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                  <input type="text" dir="ltr" value={rule.femaleDose_en || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].femaleDose_en = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="English dose" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-slate-400 block">جرعة الكبسولات المقترحة للإناث (مثال: كبسولة يومياً)</label>
                                                  <input type="text" value={rule.femaleCapsules || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].femaleCapsules = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="كبسولة يومياً" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                  <input type="text" dir="ltr" value={rule.femaleCapsules_en || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].femaleCapsules_en = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="English capsules" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold outline-none border border-slate-100" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-slate-400 block">نصيحة الاستخدام للإناث</label>
                                                  <textarea value={rule.femaleTip || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].femaleTip = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="يفضل تناولها قبل النوم..." className="w-full bg-white rounded-lg p-2 text-[11px] font-bold min-h-[50px] outline-none border border-slate-100" />
                                                  <textarea dir="ltr" value={rule.femaleTip_en || ''} onChange={(e) => {
                                                    const newRules = [...(dosageCalculatorObj.rules || [])]
                                                    newRules[index].femaleTip_en = e.target.value
                                                    setDosageCalculatorObj({...dosageCalculatorObj, rules: newRules})
                                                  }} placeholder="English tip" className="w-full bg-white rounded-lg p-2 text-[11px] font-bold min-h-[50px] outline-none border border-slate-100" />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}

                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const rules = dosageCalculatorObj.rules || []
                                          setDosageCalculatorObj({
                                            ...dosageCalculatorObj,
                                            rules: [...rules, { value: '', label: '', icon: 'Activity', maleDose: '', maleCapsules: '', maleTip: '', femaleDose: '', femaleCapsules: '', femaleTip: '' }]
                                          })
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

                          {/* SEO optimization section */}
                          <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-8 space-y-6 border border-slate-100">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200/50">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} /> تحسين محركات البحث وجوجل (SEO)</h4>
                                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto justify-end">
                                  <button type="button" onClick={() => handleSEOAI()} disabled={isSEOLoading || !formData.title} className="text-[10px] bg-emerald-600 text-white border border-transparent px-3 py-1.5 rounded-xl font-black shadow-sm flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer">
                                     {isSEOLoading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />} توليد بالذكاء الاصطناعي
                                  </button>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 gap-4">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mr-1">كلمات البحث المفتاحية (Meta Keywords)</label>
                                    <textarea value={formData.seoKeywords || ''} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[80px] outline-none text-slate-600 leading-relaxed" placeholder="كلمة 1، جملة 2..." />
                                    <textarea dir="ltr" value={formData.seoKeywordsEn || ''} onChange={e => setFormData({...formData, seoKeywordsEn: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[70px] outline-none text-slate-600 leading-relaxed" placeholder="English meta keywords" />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mr-1">وصف البحث المختصر (Meta Description)</label>
                                    <textarea value={formData.seoDesc || ''} onChange={e => setFormData({...formData, seoDesc: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[60px] outline-none text-slate-600 leading-relaxed" placeholder="وصف جذاب يظهر في نتائج بحث جوجل..." />
                                    <textarea dir="ltr" value={formData.seoDescEn || ''} onChange={e => setFormData({...formData, seoDescEn: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[60px] outline-none text-slate-600 leading-relaxed" placeholder="English meta description" />
                                 </div>
                              </div>
                          </div>

                          {/* Extra warnings text */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-800 block mr-1">طريقة الاستخدام والجرعات</label>
                              <textarea value={formData.directions || ''} onChange={e => setFormData({...formData, directions: e.target.value})} placeholder="اكتب طريقة وجرعات الاستخدام المثالية للمنتج هنا..." className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-700" />
                              <textarea dir="ltr" value={formData.usageEn || ''} onChange={e => setFormData({...formData, usageEn: e.target.value})} placeholder="English usage and dosage" className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[80px] outline-none text-slate-600" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-800 block mr-1">المحاذير وموانع الاستخدام</label>
                              <textarea value={formData.warnings || ''} onChange={e => setFormData({...formData, warnings: e.target.value})} placeholder="اكتب محاذير وموانع استخدام المنتج أو الحساسية هنا..." className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[100px] outline-none text-slate-700" />
                              <textarea dir="ltr" value={formData.warningsEn || ''} onChange={e => setFormData({...formData, warningsEn: e.target.value})} placeholder="English warnings" className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 font-bold text-xs min-h-[80px] outline-none text-slate-600" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-800 block mr-1">المكونات والمحاذير القانونية</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <textarea value={formData.ingredients || ''} onChange={e => setFormData({...formData, ingredients: e.target.value})} placeholder="المكونات التفصيلية للمنتج..." className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[80px] outline-none text-slate-700" />
                              <textarea value={formData.disclaimer || ''} onChange={e => setFormData({...formData, disclaimer: e.target.value})} placeholder="إخلاء مسؤولية قانوني افتراضي..." className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold text-xs min-h-[80px] outline-none text-slate-700" />
                              <textarea dir="ltr" value={formData.ingredientsEn || ''} onChange={e => setFormData({...formData, ingredientsEn: e.target.value})} placeholder="English ingredients" className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-5 font-bold text-xs min-h-[80px] outline-none text-slate-600" />
                              <textarea dir="ltr" value={formData.disclaimerEn || ''} onChange={e => setFormData({...formData, disclaimerEn: e.target.value})} placeholder="English disclaimer" className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-5 font-bold text-xs min-h-[80px] outline-none text-slate-600" />
                            </div>
                          </div>

                          {/* FAQs Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-800">الأسئلة الشائعة (FAQs)</label>
                              <button type="button" onClick={() => setFaqsList([...(faqsList || []), { question_ar: '', answer_ar: '', question_en: '', answer_en: '' }])} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors">
                                <Plus size={14} /> إضافة سؤال
                              </button>
                            </div>
                            {(faqsList || []).map((faq: any, index: number) => (
                              <div key={index} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative space-y-3 animate-in fade-in">
                                <button type="button" onClick={() => {
                                  const nl = [...faqsList]
                                  nl.splice(index, 1)
                                  setFaqsList(nl)
                                }} className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                                  <Trash2 size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="text" value={faq.question_ar || ''} onChange={e => { const nl = [...faqsList]; nl[index].question_ar = e.target.value; setFaqsList(nl) }} placeholder="السؤال بالعربي" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs outline-none text-slate-700 border border-transparent focus:border-emerald-500/20" />
                                  <input type="text" dir="ltr" value={faq.question_en || ''} onChange={e => { const nl = [...faqsList]; nl[index].question_en = e.target.value; setFaqsList(nl) }} placeholder="Question in English" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs outline-none text-slate-700 border border-transparent focus:border-emerald-500/20" />
                                  <textarea value={faq.answer_ar || ''} onChange={e => { const nl = [...faqsList]; nl[index].answer_ar = e.target.value; setFaqsList(nl) }} placeholder="الإجابة بالعربي" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs outline-none text-slate-700 min-h-[80px] border border-transparent focus:border-emerald-500/20" />
                                  <textarea dir="ltr" value={faq.answer_en || ''} onChange={e => { const nl = [...faqsList]; nl[index].answer_en = e.target.value; setFaqsList(nl) }} placeholder="Answer in English" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs outline-none text-slate-700 min-h-[80px] border border-transparent focus:border-emerald-500/20" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
    </>
  );
}
