"use client"

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t, dir } = useLanguage()

  return (
    <footer className="bg-[#f7f7f7] border-t border-gray-200 pt-10 pb-24 md:pb-8 mt-auto">
      <div className="max-w-screen-xl mx-auto px-2 xs:px-4" dir={dir}>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-8 pb-8 border-b border-gray-200">

          {/* About — spans full width on tiny screens */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            {/* Logo */}
            <div className="flex items-center" dir="ltr">
              <img src="/logo-footer.jpg" alt="Vitamins Hub Logo" className="h-20 w-auto object-contain" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('footer_about_desc')}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" aria-label="TikTok" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.19 8.19 0 0 0 4.79 1.53V7.07a4.85 4.85 0 0 1-1.02-.38z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter/X" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-800">{t('footer_quick_links')}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link href="/about" className="hover:text-emerald-700 transition-colors">{t('footer_about_us')}</Link></li>
              <li><Link href="/products" className="hover:text-emerald-700 transition-colors">{t('nav_products')}</Link></li>
              <li><Link href="/offers" className="hover:text-emerald-700 transition-colors">{t('nav_offers')}</Link></li>
              <li><Link href="/brands" className="hover:text-emerald-700 transition-colors">{t('nav_brands')}</Link></li>
              <li><Link href="/health-tips" className="hover:text-emerald-700 transition-colors">{t('nav_health_tips')}</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-700 transition-colors">{t('footer_faq')}</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-800">{t('footer_policies')}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link href="/shipping" className="hover:text-emerald-700 transition-colors">{t('footer_shipping')}</Link></li>
              <li><Link href="/returns" className="hover:text-emerald-700 transition-colors">{t('footer_returns')}</Link></li>
              <li><Link href="/track" className="hover:text-emerald-700 transition-colors">{t('nav_track_order')}</Link></li>
              <li><Link href="/bmi-calculator" className="hover:text-emerald-700 transition-colors">{t('nav_bmi')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h3 className="text-sm font-black text-gray-800">{t('footer_contact_us')}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info@vitaminshub.com
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.67 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.57 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 7 7l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 16.92z"/></svg>
                +20 100 123 4567
              </li>
            </ul>
            <div className="flex gap-2 pt-1">
              <input
                type="email"
                placeholder={t('footer_newsletter_placeholder')}
                aria-label="Newsletter email subscription"
                className="flex-1 min-w-0 h-9 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:border-emerald-600"
              />
              <button style={{ background: '#2e7d5e' }} className="px-3 h-9 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0">
                {t('footer_subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5">
          <p className="text-[10px] text-gray-500 text-center sm:text-right">{t('footer_rights')}</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="border border-gray-300 rounded px-2 py-0.5 text-[10px] font-bold text-gray-600">Instapay</span>
            <span className="text-[11px] font-black text-[#1A1F71] tracking-wider">VISA</span>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-400 -ml-2 opacity-90"></div>
            </div>
            <span className="text-[11px] font-bold text-gray-700"> Pay</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
