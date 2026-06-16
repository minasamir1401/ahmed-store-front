import React from 'react';
import { Loader2, CheckCircle2, Upload, Plus, Edit2, Trash2, Eye, Search, Smartphone, Shield, LogIn } from 'lucide-react';

export default function WhatsappTab(props: any) {
  const { 
    formData, setFormData, handleSave, loading, uploading, handleFileUpload,
    items, adminEmail, setAdminEmail, adminName, setAdminName, adminPassword, setAdminPassword,
    adminSaveLoading, handleAdminSave, isLoggedIn, setIsLoggedIn, showLogin,
    activeTab, tabs, whatsappStatus, handleWhatsappLogout, wsLoading
  } = props;

  return (
    <>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        whatsappStatus.status === 'connected' ? 'bg-green-50 text-green-600' :
                        whatsappStatus.status === 'qr' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                        whatsappStatus.status === 'initializing' ? 'bg-blue-50 text-blue-600 animate-spin-slow' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <Smartphone size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 leading-none">حالة خدمة الواتساب (WhatsApp Gateway)</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1.5 flex items-center gap-2">
                          الحالة الحالية: 
                          <span className={`font-black px-2 py-0.5 rounded-md text-[9px] ${
                            whatsappStatus.status === 'connected' ? 'bg-green-100 text-green-700' :
                            whatsappStatus.status === 'qr' ? 'bg-amber-100 text-amber-700' :
                            whatsappStatus.status === 'initializing' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {whatsappStatus.status === 'connected' ? 'متصل وجاهز للعمل ✅' :
                             whatsappStatus.status === 'qr' ? 'في انتظار مسح الرمز 📱' :
                             whatsappStatus.status === 'initializing' ? 'جاري التهيئة والتشغيل... 🔄' :
                             'غير متصل ❌'}
                          </span>
                        </span>
                      </div>
                    </div>
                    {whatsappStatus.status === 'connected' && (
                      <button 
                        type="button"
                        onClick={handleWhatsappLogout} 
                        disabled={wsLoading}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {wsLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                        قطع الاتصال وتسجيل الخروج
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Status details / QR scan box */}
                    <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-sm">
                      <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b pb-2">خطوات ربط الخدمة وتفعيلها</h4>
                      
                      {whatsappStatus.status === 'connected' ? (
                        <div className="text-center py-12 space-y-4">
                          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                            <CheckCircle2 size={36} />
                          </div>
                          <h3 className="text-lg font-black text-slate-800">حسابك مرتبط بنجاح!</h3>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-bold">
                            الخدمة تعمل الآن محلياً بشكل ممتاز. سيتم إرسال رسائل تأكيد الحسابات للعملاء الجدد، ورسائل تأكيد الطلبات، ورموز استعادة كلمة المرور تلقائياً.
                          </p>
                        </div>
                      ) : whatsappStatus.status === 'qr' && whatsappStatus.qr ? (
                        <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                          <div className="border-2 border-emerald-500/10 p-4 rounded-[2rem] bg-slate-50/50 shadow-inner shrink-0">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(whatsappStatus.qr)}`}
                              alt="WhatsApp QR Code"
                              className="w-48 h-48 rounded-lg"
                            />
                          </div>
                          <div className="space-y-4 text-slate-600 text-xs">
                            <p className="font-black text-slate-800 text-sm">امسح الرمز لتفعيل النظام:</p>
                            <ol className="list-decimal list-inside space-y-2.5 font-semibold text-slate-500">
                              <li>افتح تطبيق <span className="font-bold text-slate-700">واتساب</span> على هاتفك المحمول.</li>
                              <li>انقر على القائمة أو الإعدادات ثم اختر <span className="font-bold text-slate-700">الأجهزة المرتبطة (Linked Devices)</span>.</li>
                              <li>انقر على <span className="font-bold text-slate-700">ربط جهاز (Link a Device)</span>.</li>
                              <li>وجه كاميرا الهاتف نحو الرمز الموضح بجانبك لمسحه.</li>
                            </ol>
                            <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200/50">
                              💡 ملاحظة: بعد المسح بنجاح، ستتحول الشاشة تلقائياً للحالة &quot;متصل&quot; خلال ثوانٍ.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16 space-y-4">
                          <Loader2 className="animate-spin mx-auto text-emerald-600" size={36} />
                          <h3 className="text-sm font-black text-slate-700">
                            {whatsappStatus.status === 'initializing' ? 'جاري تهيئة خادم الواتساب ولودر المتصفح...' : 'جاري الاتصال بخادم الواتساب...'}
                          </h3>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed font-bold">
                            يرجى الانتظار، هذه العملية قد تستغرق بضع ثوانٍ لتوليد رمز الاستجابة السريعة (QR Code) الجديد.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* How it works info box */}
                    <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8 space-y-6">
                      <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b pb-2">تفاصيل النظام التلقائي</h4>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                          <h5 className="font-black text-xs text-slate-800">1. رسائل تأكيد التسجيل (Welcome Messages)</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">عند قيام مستخدم جديد بإنشاء حساب في الموقع، يستقبل تلقائياً رسالة ترحيبية وتأكيدية على رقم هاتفه.</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                          <h5 className="font-black text-xs text-slate-800">2. استرداد كلمة المرور (OTP Verification)</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">في حالة نسيان كلمة المرور، يكتب المستخدم رقم هاتفه، ليرسل له النظام فوراً كود تحقق مكون من 6 أرقام لتعديل كلمة مروره.</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                          <h5 className="font-black text-xs text-slate-800">3. تنبيهات الطلبات الجديدة (Order Receipts)</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">بمجرد إتمام العميل للطلب في الكاشير، تصله رسالة تفصيلية تحتوي على رقم الطلب واسم العميل والسعر الإجمالي تلقائياً.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    </>
  );
}
