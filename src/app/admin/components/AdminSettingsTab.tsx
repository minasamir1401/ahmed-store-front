import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Smartphone, Shield, LogIn, Lock as LockIcon, Database, DownloadCloud, Sparkles, Mail, Send, Truck, ArrowRight, ShieldCheck, Zap, Archive } from 'lucide-react';


export default function AdminSettingsTab(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload,
    items, adminEmail, setAdminEmail, adminName, setAdminName, adminPassword, setAdminPassword,
    adminSaveLoading, handleAdminSave, isLoggedIn, setIsLoggedIn, showLogin,
    activeTab, tabs, backupLoading, backupTypeLoading, restoreLoading, handleDownloadBackup, handleRestoreBackup,
    cleanLoading, handleCleanBase64Images,
    fromEmail, setFromEmail,
    fromName, setFromName,
    whatsappNumber, setWhatsappNumber,
    receivingNumber, setReceivingNumber,
    testRecipient, setTestRecipient,
    testEmailLoading, settingsSaveLoading,
    handleSaveGeneralSettings, handleSendTestEmail,
    returnPolicy, setReturnPolicy
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

                  {/* General Settings Section */}
                  <form onSubmit={handleSaveGeneralSettings} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden mt-8">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    
                    <div className="text-center space-y-2 mb-6">
                      <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                        <Smartphone size={22} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">إعدادات أرقام التواصل</h3>
                      <p className="text-[10px] text-slate-400 font-bold">أرقام التواصل وإشعارات الواتساب</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-1">رقم الواتساب (للتواصل)</label>
                        <input 
                          type="text" 
                          value={whatsappNumber} 
                          onChange={e => setWhatsappNumber(e.target.value)} 
                          className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-blue-500/20 focus:bg-white transition-all text-xs text-slate-700 dir-ltr text-left" 
                          placeholder="01xxxxxxxxx" 
                          disabled={settingsSaveLoading}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-1">رقم استقبال الطلبات (إشعار SMS)</label>
                        <input 
                          type="text" 
                          value={receivingNumber} 
                          onChange={e => setReceivingNumber(e.target.value)} 
                          className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-blue-500/20 focus:bg-white transition-all text-xs text-slate-700 dir-ltr text-left" 
                          placeholder="01xxxxxxxxx" 
                          disabled={settingsSaveLoading}
                        />
                      </div>


                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                      <button type="submit" disabled={settingsSaveLoading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                        {settingsSaveLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} حفظ الإعدادات
                      </button>
                    </div>
                  </form>

                  {/* Backup & Restore Section */}
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden mt-8">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                    
                    <div className="text-center space-y-2 mb-6">
                      <div className="bg-[#10b9811a] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                        <Database size={22} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">النسخ الاحتياطي واستعادة البيانات</h3>
                      <p className="text-[10px] text-slate-400 font-bold">تحميل نسخة احتياطية شاملة 100% لكافة بيانات المتجر (المنتجات، الأقسام، البراندات، الطلبات، المقالات، النصائح، سجلات الفهرسة، الإعدادات، وكافة الصور المرفوعة) أو استعادة نسخة سابقة</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-3 text-right">
                        <span className="text-[11px] font-black text-slate-700 block">خطوة 1: تحميل نسخة احتياطية</span>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                          اختر نوع النسخة الاحتياطية المناسب لك. يمكنك تنزيل نسخة البيانات فقط بشكل فوري، أو تنزيل نسخة شاملة تحتوي على قاعدة البيانات وملفات الصور المرفوعة.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-3 flex flex-col justify-between shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">فورية</span>
                                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                  <Zap size={14} className="text-emerald-600" /> نسخة البيانات فقط
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-500 mt-2 leading-relaxed font-medium">
                                تشمل 100% من جداول قاعدة البيانات (المنتجات، الطلبات، الأقسام، البراندات، المقالات، الإعدادات). حجم الملف خفيف جدا والتحميل فوري في أقل من ثانية.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadBackup('data')}
                              disabled={backupLoading || restoreLoading}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                            >
                              {backupTypeLoading === 'data' ? <Loader2 className="animate-spin" size={14} /> : <DownloadCloud size={14} />} تحميل نسخة البيانات (سريعة)
                            </button>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-3 flex flex-col justify-between shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">شاملة</span>
                                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                  <Archive size={14} className="text-slate-600" /> نسخة كاملة مع الصور
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-500 mt-2 leading-relaxed font-medium">
                                تشمل قاعدة البيانات بالكامل بالإضافة إلى جميع الصور والملفات المرفوعة على السيرفر، مجمعة في ملف ZIP واحد للحفظ الشامل.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadBackup('full')}
                              disabled={backupLoading || restoreLoading}
                              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                            >
                              {backupTypeLoading === 'full' ? <Loader2 className="animate-spin" size={14} /> : <DownloadCloud size={14} />} تحميل نسخة كاملة (+الصور)
                            </button>
                          </div>
                        </div>
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

                  {/* Base64 Database Image Cleanup Section */}
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden mt-8">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
                    
                    <div className="text-center space-y-2 mb-6">
                      <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <Trash2 size={22} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">تنظيف قاعدة البيانات</h3>
                      <p className="text-[10px] text-slate-400 font-bold">حذف كافة الصور المخزنة بصيغة Base64 الطويلة واستبدالها بصور افتراضية لتسريع الموقع</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2 text-right">
                        <span className="text-[11px] font-black text-slate-700 block">إجراء فوري لتخفيف حجم قاعدة البيانات</span>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">يقوم هذا الفحص بمرور شامل على كافة الجداول والمنتجات، ويبحث عن أي صور مشفرة محلياً (Base64) ويقوم بتنظيفها فوراً لتقليص مساحة الاستضافة وزيادة سرعة الاستجابة.</p>
                        <button 
                          type="button"
                          onClick={handleCleanBase64Images}
                          disabled={cleanLoading || backupLoading || restoreLoading}
                          className="mt-2 w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                        >
                          {cleanLoading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} تنظيف صور Base64 بالكامل
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
    </>
  );
}
