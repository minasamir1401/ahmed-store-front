export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        <p className="text-sm font-black text-slate-700">جاري تحميل الصفحة...</p>
      </div>
    </main>
  )
}
