// src/contexts/CartContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { CartItem, Product } from "@/app/types/product.types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CartContextValue {
  cartItems:        CartItem[];
  cartTotalCount:   number;        // total number of individual items
  cartTotalAmount:  number;        // total $ value
  addToCart:        (product: CartItem) => void;
  removeFromCart:   (productId: string) => void;
  incrementQuantity:(productId: string) => void;
  decrementQuantity:(productId: string) => void;
  clearCart:        () => void;
  isInCart:         (productId: string) => boolean;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "eternolux_cart";

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated,  setHydrated]  = useState(false);

  // ── Hydrate from localStorage on mount ────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {
      // corrupt storage — start fresh
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ── Persist to localStorage on every change ───────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // storage full or private browsing — ignore
    }
  }, [cartItems, hydrated]);

  // ── Actions ───────────────────────────────────────────────
  const addToCart = useCallback((product: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        // Increment quantity (cap at stock)
        return prev.map((i) =>
          i.productId === product.productId
            ? {
                ...i,
                quantity: Math.min(
                  i.quantity + (product.quantity ?? 1),
                  i.stock ?? 99
                ),
              }
            : i
        );
      }
      // New item
      return [...prev, { ...product, quantity: product.quantity ?? 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const incrementQuantity = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.quantity < (i.stock ?? 99)
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  }, []);

  const decrementQuantity = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0) // auto-remove when qty hits 0
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: string) => cartItems.some((i) => i.productId === productId),
    [cartItems]
  );

  // ── Derived values ────────────────────────────────────────
  const cartTotalCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const cartTotalAmount = useMemo(
    () => cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
    [cartItems]
  );

  const value: CartContextValue = {
    cartItems,
    cartTotalCount,
    cartTotalAmount,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
