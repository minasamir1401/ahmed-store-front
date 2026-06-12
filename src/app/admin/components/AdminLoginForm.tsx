import React from 'react'
import { Lock, LogIn, User } from 'lucide-react'

export default function AdminLoginForm({ username, setUsername, password, setPassword, handleLogin }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl w-full max-w-md space-y-6 border border-slate-100/50">
        <div className="text-center space-y-2 mb-8">
          <div className="bg-[#10b9811a] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 mb-4 shadow-sm">
            <Lock size={30} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">تسجيل دخول الإدارة</h1>
          <p className="text-xs text-slate-400 font-bold">يرجى إدخال بيانات الاعتماد للوصول إلى لوحة التحكم</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-1">اسم المستخدم</label>
            <div className="relative">
              <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 rounded-2xl py-3.5 pr-12 pl-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700" placeholder="admin" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 rounded-2xl py-3.5 pr-12 pl-4 font-bold outline-none border border-transparent focus:border-emerald-500/20 focus:bg-white transition-all text-xs text-slate-700" placeholder="••••••••" required />
            </div>
          </div>
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
          <LogIn size={18} /> الدخول للوحة التحكم
        </button>
      </form>
    </div>
  )
}
