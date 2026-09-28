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

    // Intercept browser extension port disconnects and unhandled third-party rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const message = reason?.message || (typeof reason === 'string' ? reason : '');
      const isExtensionError =
        message.includes('message channel closed before a response was received') ||
        message.includes('listener indicated an asynchronous response') ||
        message.includes('Extension context invalidated') ||
        message.includes('Receiving end does not exist');

      if (isExtensionError || (reason && typeof reason === 'object' && !('stack' in reason) && !('message' in reason))) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Expose global methods
    (window as any).showLogs = (password: string) => {
      if (password === 'mina') {
        localStorage.setItem('debug_pwd', 'mina');
        checkAndApply();
        originalLog('Logs enabled.');
      } else {
        originalWarn('Wrong password');
      }
    };

    (window as any).hideLogs = () => {
      localStorage.removeItem('debug_pwd');
      checkAndApply();
      originalLog('Logs disabled.');
    };

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
