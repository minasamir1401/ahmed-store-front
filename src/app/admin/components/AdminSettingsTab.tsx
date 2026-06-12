import React from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Smartphone, Shield, LogIn, Lock as LockIcon, Database, DownloadCloud, Sparkles } from 'lucide-react';

export default function AdminSettingsTab(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload,
    items, adminEmail, setAdminEmail, adminName, setAdminName, adminPassword, setAdminPassword,
    adminSaveLoading, handleAdminSave, isLoggedIn, setIsLoggedIn, showLogin,
    activeTab, tabs, backupLoading, restoreLoading, handleDownloadBackup, handleRestoreBackup
  } = props;

  return (
    <>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <form onSubmit={handleAdminSave} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                    
                    <div className="text-center space-y-2 mb-6">
                      <div className="bg-[#10b9811a] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                        <LockIcon size={22} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">تعديل بيانات المشرف</h3>
                      <p className="text-[10px] text-slate-400 font-bold">تغيير اسم المستخدم، البريد الإلكتروني وكلمة المرور الخاصة بلوحة التحكم</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-1">اسم المستخدم / البريد الإلكتروني</label>
                        <input 
                          type="text" 
                          value={adminEmail} 
                          onChange={e => setAdminEmail(e.target.value)} 
                          className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700" 
                          placeholder="admin أو admin@mithaly.com" 
                          required 
                          disabled={adminSaveLoading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-1">الاسم الشخصي</label>
                        <input 
                          type="text" 
                          value={adminName} 
                          onChange={e => setAdminName(e.target.value)} 
                          className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700" 
                          placeholder="المدير العام" 
                          required 
                          disabled={adminSaveLoading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-1">كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</label>
                        <input 
                          type="password" 
                          value={adminPassword} 
                          onChange={e => setAdminPassword(e.target.value)} 
                          className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700" 
                          placeholder="••••••••" 
                          disabled={adminSaveLoading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                      <button type="submit" disabled={adminSaveLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                        {adminSaveLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} حفظ التغييرات
                      </button>
                    </div>
                  </form>


                  {/* Backup & Restore Section */}
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                    
                    <div className="text-center space-y-2 mb-6">
                      <div className="bg-[#10b9811a] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                        <Database size={22} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">النسخ الاحتياطي واستعادة البيانات</h3>
                      <p className="text-[10px] text-slate-400 font-bold">قم بتحميل نسخة احتياطية كاملة للمتجر (المنتجات، الأقسام، الهيرو، الطلبات، والصور) أو استعادة نسخة سابقة</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2 text-right">
                        <span className="text-[11px] font-black text-slate-700 block">خطوة 1: تحميل نسخة احتياطية</span>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">يقوم هذا الإجراء بتنزيل ملف مضغوط ZIP يحتوي على كافة بيانات المتجر وقاعدة البيانات بالإضافة إلى جميع الصور التي تم رفعها على السيرفر.</p>
                        <button 
                          type="button"
                          onClick={handleDownloadBackup}
                          disabled={backupLoading || restoreLoading}
                          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                        >
                          {backupLoading ? <Loader2 className="animate-spin" size={14} /> : <DownloadCloud size={14} />} تحميل نسخة احتياطية كاملة
                        </button>
                      </div>

                      <div className="p-4 bg-red-50/40 rounded-2xl border border-red-100/30 space-y-2 text-right">
                        <span className="text-[11px] font-black text-red-600 block">خطوة 2: استعادة نسخة احتياطية</span>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">تنبيه: سيؤدي رفع ملف النسخة الاحتياطية إلى مسح كافة المنتجات، الطلبات، الأقسام والصور الحالية نهائياً واستبدالها بالبيانات الموجودة في الملف.</p>
                        <div className="relative mt-2">
                          <input 
                            type="file" 
                            accept=".zip"
                            onChange={e => e.target.files && e.target.files[0] && handleRestoreBackup(e.target.files[0])}
                            disabled={restoreLoading || backupLoading}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                          />
                          <button 
                            type="button"
                            disabled={restoreLoading || backupLoading}
                            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                          >
                            {restoreLoading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} رفع واستعادة نسخة احتياطية (.zip)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    </>
  );
}
