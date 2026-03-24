import { useState, useEffect } from 'react'
import type { CustomizationOptions } from '@/components/TShirtCustomizer'

export interface CartItem {
  id: string
  options: CustomizationOptions
  unitPrice: number
  totalPrice: number
  addedAt: string // ISO string
}

const STORAGE_KEY = 'threadcraft_cart'

const load = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

const save = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(load)

  // Keep localStorage in sync whenever items change
  useEffect(() => {
    save(items)
  }, [items])

  const addItem = (options: CustomizationOptions) => {
    const unitPrice = 24.99
    const discount = options.quantity >= 3 ? 0.9 : 1
    const totalPrice = parseFloat((unitPrice * options.quantity * discount).toFixed(2))

    const item: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      options: { ...options },
      unitPrice,
      totalPrice,
      addedAt: new Date().toISOString(),
    }

    setItems(prev => [item, ...prev])
    return item
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.options.quantity, 0)
  const cartTotal  = items.reduce((sum, i) => sum + i.totalPrice, 0)

  return { items, addItem, removeItem, clearCart, totalItems, cartTotal }
}
