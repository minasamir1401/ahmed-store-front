import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#f7f7f7', borderTop: '1px solid #e5e5e5' }} className="pt-12 pb-6 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-gray-200">

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">عن مينا سمير</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              نحن نؤمن بالجمال الطبي والعناية الطبيعية. منتجات مختارة بعناية من أجود المكونات لتمنحك بشرة صحية ومشرقة.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* Snapchat */}
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-yellow-400 hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.166 2c.835 0 3.63.268 4.974 3.033.42.862.32 2.328.242 3.45l-.017.24c.43-.13.87-.29 1.25-.59.16-.12.35-.18.54-.18.24 0 .46.09.63.26.36.37.38.98.05 1.37-.66.78-1.81 1.16-2.43 1.35-.01.03-.02.07-.03.1.2.13.62.33 1.47.55.35.1.64.41.69.78.05.37-.12.72-.43.9-.4.23-.83.22-1.18.19-.21-.02-.44-.05-.7-.04-.25 1.08-1.29 2.1-2.7 2.9a5.38 5.38 0 0 1-1.65.57c.05.19.1.38.16.56.14.44.03.9-.3 1.2-.36.33-.88.41-1.32.21-.27-.12-.62-.21-1.06-.3-1.32-.25-2.2.15-2.7.38-.17.08-.32.12-.46.12-.39 0-.76-.19-.98-.52-.29-.43-.26-.97.07-1.38.08-.1.15-.22.22-.36a5.07 5.07 0 0 1-1.6-.57C5.71 14.1 4.68 13.1 4.43 12.03c-.26-.01-.49.02-.7.04-.35.03-.78.04-1.18-.19-.31-.18-.48-.53-.43-.9.05-.37.34-.68.69-.78.85-.22 1.27-.42 1.47-.55-.01-.03-.02-.07-.03-.1-.62-.19-1.77-.57-2.43-1.35-.33-.39-.31-1 .05-1.37.17-.17.39-.26.63-.26.19 0 .38.06.54.18.38.3.82.46 1.25.59l-.017-.24C4.204 5.301 4.104 3.835 4.524 2.97 5.868 2.235 8.71 2 12.166 2Z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.19 8.19 0 0 0 4.79 1.53V7.07a4.85 4.85 0 0 1-1.02-.38z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-green-700 transition-colors">عن نحن</Link></li>
              <li><Link href="/faq" className="hover:text-green-700 transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/shipping" className="hover:text-green-700 transition-colors">سياسة الشحن</Link></li>
              <li><Link href="/returns" className="hover:text-green-700 transition-colors">سياسة الإرجاع</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">معلومات التواصل</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info@minasamir.com
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.67 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.57 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 7 7l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 16.92z"/></svg>
                +20 100 123 4567
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                القاهرة، مصر
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">اشترك في نشرتنا البريدية</h3>
            <p className="text-sm text-gray-500">اشترك ليصلك كل جديد من العروض والمنتجات</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="ادخل بريدك الإلكتروني"
                className="flex-1 h-10 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-green-600"
                dir="rtl"
              />
              <button style={{ background: '#2e7d5e' }} className="px-4 h-10 text-white rounded-md text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap">
                اشترك الآن
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-xs text-gray-400">جميع الحقوق محفوظة لـمينا سمير © 2026</p>
          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            {/* mada */}
            <span className="border border-gray-300 rounded px-2 py-1 text-[10px] font-bold text-gray-600">mada</span>
            {/* Visa */}
            <svg width="38" height="14" viewBox="0 0 38 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="12" fontSize="13" fontWeight="700" fill="#1A1F71" fontFamily="Arial">VISA</text>
            </svg>
            {/* Mastercard */}
            <div className="flex items-center gap-0">
              <div className="w-5 h-5 rounded-full bg-red-500 opacity-90"></div>
              <div className="w-5 h-5 rounded-full bg-yellow-400 -ml-2.5 opacity-90"></div>
            </div>
            {/* Apple Pay */}
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="16" viewBox="0 0 38 16">
              <text x="0" y="13" fontSize="11" fontWeight="600" fill="#000" fontFamily="Arial"> Pay</text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
