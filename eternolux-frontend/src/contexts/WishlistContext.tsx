// src/contexts/WishlistContext.tsx
"use client";

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useMemo,
} from "react";
import type { Product } from "@/app/types/product.types";

interface WishlistContextValue {
  wishlistItems:   Product[];
  wishlistCount:   number;
  isWishlisted:    (productId: string) => boolean;
  toggleWishlist:  (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist:   () => void;
  shareUrl:        string;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "eternolux_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items,    setItems]    = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // ── Hydrate from localStorage ────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch { localStorage.removeItem(STORAGE_KEY); }
    finally   { setHydrated(true); }
  }, []);

  // ── Persist to localStorage ──────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const isWishlisted = useCallback(
    (id: string) => items.some((i) => i.productId === id),
    [items]
  );

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) =>
      prev.some((i) => i.productId === product.productId)
        ? prev.filter((i) => i.productId !== product.productId)
        : [...prev, product]
    );
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== id));
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const wishlistCount = useMemo(() => items.length, [items]);

  // ── Share URL ─────────────────────────────────────────────
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || items.length === 0) return "";
    const ids = items.map((i) => i.productId).join(",");
    return `${window.location.origin}/wishlist?ids=${ids}`;
  }, [items]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems: items,
      wishlistCount,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      shareUrl,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
