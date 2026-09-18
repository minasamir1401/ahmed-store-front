'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check sessionStorage first, migrate any old localStorage tokens to sessionStorage
    const sessionToken = sessionStorage.getItem('vitamins_hub_auth_token')
    const sessionUser = sessionStorage.getItem('vitamins_hub_auth_user')

    let savedToken = sessionToken
    let savedUser = sessionUser

    if (!savedToken) {
      savedToken = localStorage.getItem('vitamins_hub_auth_token')
      savedUser = localStorage.getItem('vitamins_hub_auth_user')
      if (savedToken) {
        sessionStorage.setItem('vitamins_hub_auth_token', savedToken)
        if (savedUser) sessionStorage.setItem('vitamins_hub_auth_user', savedUser)
        localStorage.removeItem('vitamins_hub_auth_token')
        localStorage.removeItem('vitamins_hub_auth_user')
      }
    }

    queueMicrotask(() => {
      if (savedToken && savedUser) {
        try {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
        } catch {
          sessionStorage.removeItem('vitamins_hub_auth_token')
          sessionStorage.removeItem('vitamins_hub_auth_user')
        }
      }
      setLoading(false)
    })
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    sessionStorage.setItem('vitamins_hub_auth_token', newToken)
    sessionStorage.setItem('vitamins_hub_auth_user', JSON.stringify(newUser))
    // Clean old localStorage references
    localStorage.removeItem('vitamins_hub_auth_token')
    localStorage.removeItem('vitamins_hub_auth_user')
  }

  const logout = async () => {
    const currentToken = token || sessionStorage.getItem('vitamins_hub_auth_token')
    if (currentToken) {
      try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`
          }
        })
      } catch {}
    }

    setToken(null)
    setUser(null)
    sessionStorage.removeItem('vitamins_hub_auth_token')
    sessionStorage.removeItem('vitamins_hub_auth_user')
    localStorage.removeItem('vitamins_hub_auth_token')
    localStorage.removeItem('vitamins_hub_auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
