'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">
        {/* Ambient glow circles */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] opacity-35 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-100 rounded-full blur-[100px] opacity-25 pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-8 relative z-10">
          {/* Animated SVG Icon */}
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500/5 border border-emerald-500/10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="relative z-10 w-24 h-24 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-lg shadow-emerald-500/5 text-emerald-600"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <HelpCircle size={44} className="stroke-[1.5]" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent font-cairo">
              404
            </h1>
            <h2 className="text-2xl font-black text-slate-800">
              الصفحة غير موجودة!
            </h2>
            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm mx-auto">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. دعنا نساعدك في العودة لرحلتك الصحية المليئة بالنشاط.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-700/10 hover:bg-[#235f47] transition-all cursor-pointer"
              >
                العودة للرئيسية
                <ArrowRight size={16} className="rotate-180" />
              </motion.button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
