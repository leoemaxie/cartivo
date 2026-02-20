/**
 * Cartivo Cart Store
 *
 * Simple localStorage-backed cart used by the Voice Agent function calls.
 * Products from the Smart Setup Builder are stored here.
 */

export interface CartItem {
  productId: string
  name: string
  price: number
  category: string
  quantity: number
}

export interface Cart {
  cartId: string
  items: CartItem[]
  totalCost: number
  createdAt: string
  updatedAt: string
}

const CART_KEY = 'cartivo_cart'

function generateId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function getCart(): Cart {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (raw) return JSON.parse(raw) as Cart
  } catch {
    // ignore corrupt storage
  }
  return {
    cartId: generateId(),
    items: [],
    totalCost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function saveCart(cart: Cart): void {
  cart.updatedAt = new Date().toISOString()
  cart.totalCost = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function addItemsToCart(items: CartItem[]): Cart {
  const cart = getCart()
  for (const item of items) {
    const existing = cart.items.find((i) => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      cart.items.push({ ...item })
    }
  }
  saveCart(cart)
  return cart
}

export function clearCart(): Cart {
  const fresh: Cart = {
    cartId: generateId(),
    items: [],
    totalCost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(CART_KEY, JSON.stringify(fresh))
  return fresh
}
