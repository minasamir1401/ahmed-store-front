"use client"

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ScrollRestorationInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentKeyRef = useRef('')

  const getStorageKey = (path: string, search: string) => {
    return `vitahub_scroll_pos_${path}${search ? `?${search}` : ''}`
  }

  // Enable manual scroll restoration to control async restoration precisely
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Save scroll position during scrolling and before leaving the current page
  useEffect(() => {
    const currentSearch = searchParams?.toString() || ''
    const currentKey = getStorageKey(pathname, currentSearch)
    currentKeyRef.current = currentKey

    let scrollDebounce: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(scrollDebounce)
      scrollDebounce = setTimeout(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(currentKey, String(window.scrollY))
        }
      }, 50)
    }

    const saveCurrentPosition = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(currentKey, String(window.scrollY))
      }
    }

    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a')
      if (target && target.href) {
        saveCurrentPosition()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', saveCurrentPosition)
    window.addEventListener('pagehide', saveCurrentPosition)
    document.addEventListener('click', handleLinkClick, true)

    return () => {
      clearTimeout(scrollDebounce)
      saveCurrentPosition()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', saveCurrentPosition)
      window.removeEventListener('pagehide', saveCurrentPosition)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [pathname, searchParams])

  // Restore scroll position when switching or navigating to a page
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Do not alter scroll if URL contains an explicit anchor hash
    if (window.location.hash) return

    const currentSearch = searchParams?.toString() || ''
    const currentKey = getStorageKey(pathname, currentSearch)
    const savedStr = sessionStorage.getItem(currentKey)
    const savedY = savedStr ? parseInt(savedStr, 10) : 0

    if (savedY > 0) {
      let attempts = 0
      const maxAttempts = 35
      let userInteracted = false

      const cancelOnInteraction = () => {
        userInteracted = true
      }

      window.addEventListener('wheel', cancelOnInteraction, { passive: true, once: true })
      window.addEventListener('touchstart', cancelOnInteraction, { passive: true, once: true })
      window.addEventListener('keydown', cancelOnInteraction, { passive: true, once: true })

      const restoreStep = () => {
        if (userInteracted) return

        const docHeight = document.documentElement.scrollHeight
        const viewHeight = window.innerHeight
        const maxScroll = Math.max(0, docHeight - viewHeight)

        if (maxScroll >= savedY - 50 || docHeight >= savedY || attempts >= maxAttempts) {
          window.scrollTo({ top: savedY, behavior: 'instant' })
        } else {
          attempts++
          retryTimeoutRef.current = setTimeout(restoreStep, 40)
        }
      }

      restoreStep()

      return () => {
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
        window.removeEventListener('wheel', cancelOnInteraction)
        window.removeEventListener('touchstart', cancelOnInteraction)
        window.removeEventListener('keydown', cancelOnInteraction)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, searchParams])

  return null
}

export default function ScrollRestoration() {
  return (
    <Suspense fallback={null}>
      <ScrollRestorationInner />
    </Suspense>
  )
}
