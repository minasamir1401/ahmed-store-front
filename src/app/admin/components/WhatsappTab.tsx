import React from 'react';
import { Loader2, CheckCircle2, Smartphone, Mail, Send, Eye, EyeOff } from 'lucide-react';

export default function WhatsappTab(props: any) {
  const [showSmtpPass, setShowSmtpPass] = React.useState(false);
  const { 
    whatsappStatus, handleWhatsappLogout, wsLoading,
    smtpHost, setSmtpHost,
    smtpPort, setSmtpPort,
    smtpSecure, setSmtpSecure,
    smtpUser, setSmtpUser,
    smtpPass, setSmtpPass,
    fromEmail, setFromEmail,
    fromName, setFromName,
    whatsappNumber, setWhatsappNumber,
    receivingNumber, setReceivingNumber,
    testRecipient, setTestRecipient,
    testEmailLoading, settingsSaveLoading,
    handleSaveGeneralSettings, handleSendTestEmail
  } = props;

  return (
    <>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* WhatsApp Gateway Status Panel */}
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

        {/* WhatsApp Setup steps & details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

        {/* System Phone Numbers Settings */}
        <form onSubmit={handleSaveGeneralSettings} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden mt-8">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500" />
          
          <div className="text-center space-y-2 mb-6">
            <div className="bg-[#10b9811a] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <Smartphone size={22} />
            </div>
            <h3 className="text-lg font-black text-slate-800">إعدادات أرقام التواصل والدفع</h3>
            <p className="text-[10px] text-slate-400 font-bold">تحديث أرقام الاتصال بالموقع وأرقام تحويل الأموال لإنستاباي وفودافون كاش</p>
          </div>

          <div className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">رقم الواتساب والاتصال الأساسي للموقع</label>
              <input 
                type="text" 
                value={whatsappNumber || ''} 
                onChange={e => setWhatsappNumber(e.target.value)} 
                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                placeholder="مثال: 01201450111" 
                required 
                disabled={settingsSaveLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">رقم استقبال فودافون كاش وإنستاباي (Instapay)</label>
              <input 
                type="text" 
                value={receivingNumber || ''} 
                onChange={e => setReceivingNumber(e.target.value)} 
                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                placeholder="مثال: 01009596452" 
                required 
                disabled={settingsSaveLoading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <button type="submit" disabled={settingsSaveLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              {settingsSaveLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} حفظ أرقام النظام
            </button>
          </div>
        </form>

        {/* SMTP Server Settings */}
        <form onSubmit={handleSaveGeneralSettings} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden mt-8">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
          
          <div className="text-center space-y-2 mb-6">
            <div className="bg-[#10b9811a] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <Mail size={22} />
            </div>
            <h3 className="text-lg font-black text-slate-800">إعدادات البريد الإلكتروني SMTP</h3>
            <p className="text-[10px] text-slate-400 font-bold">ربط حساب Gmail أو خادم SMTP خارجي لإرسال فواتير وتأكيدات الطلبات للعملاء تلقائياً</p>
          </div>

          <div className="space-y-4 text-right">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">خادم SMTP (Host)</label>
                <input 
                  type="text" 
                  value={smtpHost || ''} 
                  onChange={e => setSmtpHost(e.target.value)} 
                  className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                  placeholder="smtp.gmail.com" 
                  required 
                  disabled={settingsSaveLoading}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">المنفذ (Port)</label>
                <input 
                  type="text" 
                  value={smtpPort || ''} 
                  onChange={e => setSmtpPort(e.target.value)} 
                  className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                  placeholder="587 أو 465" 
                  required 
                  disabled={settingsSaveLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">نوع التشفير / الاتصال الآمن</label>
              <select 
                value={smtpSecure || 'false'}
                onChange={e => setSmtpSecure(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right"
                disabled={settingsSaveLoading}
              >
                <option value="false">TLS (منفذ 587 - موصى به للـ Gmail)</option>
                <option value="true">SSL (منفذ 465)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">البريد الإلكتروني / الحساب (User)</label>
              <input 
                type="email" 
                value={smtpUser || ''} 
                onChange={e => setSmtpUser(e.target.value)} 
                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right text-left" 
                placeholder="example@gmail.com" 
                required 
                disabled={settingsSaveLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">كلمة المرور / App Password (Gmail)</label>
              <div className="relative flex items-center">
                <input 
                  type={showSmtpPass ? "text" : "password"} 
                  value={smtpPass || ''} 
                  onChange={e => setSmtpPass(e.target.value)} 
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pr-4 pl-12 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                  placeholder="كلمة مرور التطبيق المكونة من 16 حرفاً" 
                  required={!smtpPass}
                  disabled={settingsSaveLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPass(!showSmtpPass)}
                  className="absolute left-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showSmtpPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">اسم المرسل الظاهر للعميل</label>
                <input 
                  type="text" 
                  value={fromName || ''} 
                  onChange={e => setFromName(e.target.value)} 
                  className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                  placeholder="The VitaHub" 
                  required 
                  disabled={settingsSaveLoading}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">بريد المرسل (اختياري)</label>
                <input 
                  type="text" 
                  value={fromEmail || ''} 
                  onChange={e => setFromEmail(e.target.value)} 
                  className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                  placeholder="اتركه فارغاً لاستخدام البريد نفسه" 
                  disabled={settingsSaveLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <button type="submit" disabled={settingsSaveLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              {settingsSaveLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} حفظ إعدادات SMTP
            </button>
          </div>
        </form>

        {/* Test Email Connection Form */}
        <form onSubmit={handleSendTestEmail} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-sm max-w-xl mx-auto relative overflow-hidden mt-8">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="text-center space-y-2 mb-6">
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
              <Send size={22} />
            </div>
            <h3 className="text-lg font-black text-slate-800">تجربة إرسال بريد إلكتروني</h3>
            <p className="text-[10px] text-slate-400 font-bold">اختبار صحة إعدادات SMTP ومدى نجاح الاتصال بإرسال رسالة تجريبية لبريدك الشخصي</p>
          </div>

          <div className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1 block">البريد الإلكتروني للمستلم التجريبي</label>
              <input 
                type="email" 
                value={testRecipient || ''} 
                onChange={e => setTestRecipient(e.target.value)} 
                className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700 text-right" 
                placeholder="your-email@example.com" 
                required 
                disabled={testEmailLoading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <button type="submit" disabled={testEmailLoading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              {testEmailLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} إرسال رسالة تجريبية
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
