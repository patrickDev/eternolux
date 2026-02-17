// src/app/wishlist/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart, ShoppingBag, Trash2, Share2,
  Check, ArrowRight, Star, Package,
} from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/app/types/product.types";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount, shareUrl } = useWishlist();
  const { addToCart } = useCart();

  const [addedIds,  setAddedIds]  = useState<Set<string>>(new Set());
  const [copied,    setCopied]    = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 } as any);
    setAddedIds((prev) => new Set(prev).add(product.productId));
    setTimeout(() => {
      setAddedIds((prev) => { const n = new Set(prev); n.delete(product.productId); return n; });
    }, 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      prompt("Copy this wishlist link:", shareUrl);
    }
  };

  // ── Empty state ──────────────────────────────────────────
  if (wishlistCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} className="text-red-300" strokeWidth={1} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: FONT }}>
            Your wishlist is empty
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Save items you love by clicking the heart icon on any product.
          </p>
          <button
            onClick={() => router.push("/homebase")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            Start Shopping <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 mb-1">
                My Favorites
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900"
                style={{ letterSpacing: "-0.02em" }}>
                Wishlist
                <span className="ml-3 text-lg font-normal text-gray-400">
                  ({wishlistCount} {wishlistCount === 1 ? "item" : "items"})
                </span>
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Share */}
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  copied
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-gray-300 text-gray-700 hover:border-gray-900"
                }`}
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
                {copied ? "Copied!" : "Share List"}
              </button>

              {/* Clear all */}
              <button
                onClick={clearWishlist}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-500 rounded-full text-sm font-bold uppercase tracking-widest hover:border-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 size={15} /> Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-7xl py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map((product) => {
            const price     = product.price;
            const msrp      = product.originalPrice ?? null;
            const hasDisc   = msrp !== null && msrp > price;
            const discount  = hasDisc ? Math.round(((msrp - price) / msrp) * 100) : 0;
            const inStock   = product.stock > 0 && product.status !== "out_of_stock";
            const imgSrc    = product.imageUrl || product.images?.[0] || "";
            const isR2      = imgSrc.includes("images.eternolux.com");
            const imgError  = imgErrors.has(product.productId);
            const justAdded = addedIds.has(product.productId);

            return (
              <div key={product.productId} className="bg-white group relative flex flex-col">

                {/* Image */}
                <div
                  className="relative overflow-hidden bg-gray-100 cursor-pointer"
                  style={{ aspectRatio: "3/4" }}
                  onClick={() => router.push(`/homebase/${product.productId}`)}
                >
                  {imgSrc && !imgError ? (
                    <Image
                      src={imgSrc}
                      alt={product.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      onError={() => setImgErrors((prev) => new Set(prev).add(product.productId))}
                      unoptimized={isR2}
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <Package size={36} className="text-gray-200" strokeWidth={1} />
                    </div>
                  )}

                  {!inStock && (
                    <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
                      <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {hasDisc && (
                    <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-widest">
                      {discount}% off
                    </div>
                  )}

                  {/* Remove from wishlist */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.productId); }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    aria-label="Remove from wishlist"
                  >
                    <Heart size={14} className="fill-white" />
                  </button>
                </div>

                {/* Info */}
                <div className="pt-2.5 pb-3 px-0.5 flex-1 flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-0.5">
                    {product.brand || product.category}
                  </p>
                  <h3
                    onClick={() => router.push(`/homebase/${product.productId}`)}
                    className="text-[13px] leading-snug text-gray-800 font-normal line-clamp-2 cursor-pointer hover:text-red-600 transition-colors mb-1.5"
                  >
                    {product.name}
                  </h3>

                  {/* Stars */}
                  {(product.rating ?? 0) > 0 && (
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i} size={10}
                          fill={i < Math.floor(product.rating ?? 0) ? "#E21A23" : "none"}
                          className={i < Math.floor(product.rating ?? 0) ? "text-red-600" : "text-gray-300"}
                        />
                      ))}
                      {(product.reviewCount ?? 0) > 0 && (
                        <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-[15px] font-bold text-gray-900">${price.toFixed(2)}</span>
                    {hasDisc && (
                      <span className="text-[12px] text-gray-400 line-through">${msrp!.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!inStock}
                    className={`mt-auto w-full py-2.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all rounded-sm ${
                      !inStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : justAdded
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 hover:bg-red-600 text-white"
                    }`}
                  >
                    {justAdded ? (
                      <><Check size={13} strokeWidth={3} /> Added!</>
                    ) : (
                      <><ShoppingBag size={13} /> {inStock ? "Add to Bag" : "Out of Stock"}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/homebase")}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 border-b-2 border-gray-400 hover:border-red-600 pb-0.5 transition-all uppercase tracking-widest"
          >
            Continue Shopping <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
