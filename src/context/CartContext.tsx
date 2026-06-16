"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface CartItem {
  id: string | number
  title: string
  price: number
  quantity: number
  image: string
  size?: string
}

const getCartKey = (item: Pick<CartItem, 'id' | 'size'>) => `${item.id}:${item.size || ''}`

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (id: string | number, size?: string) => void
  updateQuantity: (id: string | number, quantity: number, size?: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Load initial cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('vitamins_hub_cart')
    queueMicrotask(() => {
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e)
        }
      }
      setIsLoaded(true)
    })
  }, [])

  // 2. Fetch cart from backend when token becomes available (user logs in)
  useEffect(() => {
    if (token) {
      fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401 || res.status === 404) {
            logout()
            console.warn('Session expired or user deleted')
            return null
          }
          return res.json()
        })
        .then(data => {
          if (data && Array.isArray(data.cart)) {
            setCart(data.cart)
            localStorage.setItem('vitamins_hub_cart', JSON.stringify(data.cart))
          }
        })
        .catch(err => console.error('Failed to fetch cart from backend', err))
    }
  }, [token])

  // 3. Save/Sync cart on every local change to localStorage and backend (if logged in)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vitamins_hub_cart', JSON.stringify(cart))

      if (token) {
        fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart })
        })
          .then(res => {
            if (res.status === 401 || res.status === 404) {
              logout()
              console.warn('Session expired or user deleted during sync')
              return null
            }
            return res.json()
          })
          .catch(err => console.error('Failed to sync cart to backend', err))
      }
    }
  }, [cart, token, isLoaded])

  const addToCart = (product: CartItem) => {
    setCart(prevCart => {
      const productKey = getCartKey(product)
      const existingItem = prevCart.find(item => getCartKey(item) === productKey)
      if (existingItem) {
        return prevCart.map(item =>
          getCartKey(item) === productKey ? { ...item, quantity: item.quantity + product.quantity } : item
        )
      }
      return [...prevCart, { ...product, quantity: Math.max(product.quantity || 1, 1) }]
    })
  }

  const removeFromCart = (id: string | number, size?: string) => {
    setCart(prevCart => prevCart.filter(item => getCartKey(item) !== `${id}:${size || ''}`))
  }

  const updateQuantity = (id: string | number, quantity: number, size?: string) => {
    if (quantity < 1) return
    setCart(prevCart =>
      prevCart.map(item =>
        getCartKey(item) === `${id}:${size || ''}` ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
