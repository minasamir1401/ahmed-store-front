'use client';

import { useEffect } from 'react';

export default function ConsoleManager() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const noop = () => {};

    const checkAndApply = () => {
      if (localStorage.getItem('debug_pwd') === 'mina') {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        console.info = originalInfo;
      } else {
        console.log = noop;
        console.warn = noop;
        console.error = noop;
        console.info = noop;
      }
    };

    // Apply initially
    checkAndApply();

    // Expose global methods
    (window as any).showLogs = (password: string) => {
      if (password === 'mina') {
        localStorage.setItem('debug_pwd', 'mina');
        checkAndApply();
        originalLog('✅ Logs enabled!');
      } else {
        originalWarn('❌ Wrong password');
      }
    };

    (window as any).hideLogs = () => {
      localStorage.removeItem('debug_pwd');
      checkAndApply();
      originalLog('🚫 Logs disabled.');
    };
  }, []);

  return null;
}
