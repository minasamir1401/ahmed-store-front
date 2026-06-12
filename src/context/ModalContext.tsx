"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AlertCircle, HelpCircle, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ModalType = 'alert' | 'confirm' | null

interface ModalConfig {
  type: ModalType
  title: string
  message: string
  resolve: (value: boolean) => void
}

interface ModalContextType {
  showAlert: (message: string, title?: string) => Promise<boolean>
  showConfirm: (message: string, title?: string) => Promise<boolean>
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalConfig | null>(null)

  const showAlert = (message: string, title: string = 'تنبيه') => {
    return new Promise<boolean>((resolve) => {
      setModal({
        type: 'alert',
        title,
        message,
        resolve
      })
    })
  }

  const showConfirm = (message: string, title: string = 'تأكيد') => {
    return new Promise<boolean>((resolve) => {
      setModal({
        type: 'confirm',
        title,
        message,
        resolve
      })
    })
  }

  const handleClose = (value: boolean) => {
    if (modal) {
      modal.resolve(value)
      setModal(null)
    }
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 print:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => handleClose(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              dir="rtl"
              className="bg-white/95 backdrop-blur-md rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 relative z-10 p-6 flex flex-col items-center text-center space-y-4"
            >
              {/* Icon Circle */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                modal.type === 'confirm' 
                  ? 'bg-amber-50 text-amber-600 shadow-amber-500/10' 
                  : 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10'
              }`}>
                {modal.type === 'confirm' ? (
                  <HelpCircle size={28} />
                ) : (
                  <AlertCircle size={28} />
                )}
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5 w-full">
                <h3 className="text-base font-black text-slate-800">{modal.title}</h3>
                <p className="text-xs font-bold text-slate-500 leading-relaxed whitespace-pre-line px-2">
                  {modal.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full pt-2">
                {modal.type === 'confirm' ? (
                  <>
                    <button
                      onClick={() => handleClose(false)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleClose(true)}
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      تأكيد
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleClose(true)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    موافق
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
