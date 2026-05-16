'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/types';

const CART_KEY = 'techgeo_cart';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch {}
    }
  }, []);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id);
      if (existing) {
        const updated = prev.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        return updated;
      }
      const updated = [...prev, item];
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.product_id !== productId);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => {
      const updated = prev.map(i =>
        i.product_id === productId ? { ...i, quantity } : i
      );
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
