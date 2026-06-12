"use client"

export default function Error({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-[2rem] border border-red-100 shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto font-black text-xl">!</div>
        <h1 className="text-xl font-black text-slate-900">حدث خطأ غير متوقع</h1>
        <p className="text-sm font-bold text-slate-500 leading-relaxed">يرجى إعادة المحاولة. إذا استمرت المشكلة سيتم تسجيلها للمراجعة.</p>
        <button
          type="button"
          onClick={reset}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-emerald-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </main>
  )
}
