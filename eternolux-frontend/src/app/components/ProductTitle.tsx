// src/app/components/ProductTile.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Heart, Star, Check,
  Plus, Minus, ArrowRight,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/app/types/product.types";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface ProductTileProps {
  product:        Product;
  badge?:         string;
  rank?:          number;
  isWishlisted?:  boolean;
  onWishlist?:    () => void;
  onAddedToCart?: (product: Product) => void;
  className?:     string;
}

export default function ProductTile({
  product,
  badge,
  rank,
  isWishlisted  = false,
  onWishlist,
  onAddedToCart,
  className     = "",
}: ProductTileProps) {
  const router        = useRouter();
  const { addToCart } = useCart();

  const [imgError,  setImgError]  = useState(false);
  const [quantity,  setQuantity]  = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ── Price ─────────────────────────────────────────────────
  // price/originalPrice already Number() from normalizeProduct
  const price    = product.price;
  const msrp     = product.originalPrice ?? null;
  const hasDisc  = msrp !== null && msrp > price;
  const discount = hasDisc ? Math.round(((msrp - price) / msrp) * 100) : 0;

  // ── Stock ─────────────────────────────────────────────────
  const inStock  = product.stock > 0 && product.status !== "out_of_stock";
  const maxQty   = Math.min(product.stock || 1, 10);
  const lowStock = inStock && product.stock <= (product.lowStockThreshold ?? 10);

  // ── Image ─────────────────────────────────────────────────
  // Use imageUrl first, fall back to first item in images[]
  const imgSrc  = product.imageUrl || product.images?.[0] || "";
  // R2 images don't need Next.js optimization — serve directly
  const isR2    = imgSrc.includes("images.eternolux.com");

  const goToDetail = () => router.push(`/homebase/${product.productId}`);

  // ── Cart ─────────────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addToCart({ ...product, quantity } as any);
    setJustAdded(true);
    onAddedToCart?.(product);
    setTimeout(() => { setJustAdded(false); setQuantity(1); }, 2500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlist?.();
  };

  // ── Stars using real DB rating ────────────────────────────
  const rating = product.rating ?? 0;
  const Stars = () => {
    const full  = Math.floor(rating);
    const empty = 5 - full;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(full)].map((_, i) => (
          <Star key={`f${i}`} size={11} fill="#E21A23" className="text-red-600" />
        ))}
        {[...Array(empty)].map((_, i) => (
          <Star key={`e${i}`} size={11} className="text-gray-300" />
        ))}
        {(product.reviewCount ?? 0) > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">
            ({product.reviewCount})
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`group relative bg-white flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setQuantity(1); }}
    >
      {/* ══ IMAGE ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden bg-gray-100 cursor-pointer"
        style={{ aspectRatio: "3/4" }}
        onClick={goToDetail}
      >
        {imgSrc && !imgError ? (
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            unoptimized={isR2}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 gap-3 px-4">
            <ShoppingBag size={36} className="text-gray-200" strokeWidth={1} />
            <p className="text-[11px] text-gray-400 text-center line-clamp-3 font-medium">
              {product.name}
            </p>
          </div>
        )}

        {/* Out of Stock */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* TOP LEFT — rank or badge */}
        {rank ? (
          <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow">
            #{rank}
          </div>
        ) : badge ? (
          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-widest shadow">
            {badge}
          </div>
        ) : hasDisc ? (
          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-widest shadow">
            {discount}% off
          </div>
        ) : null}

        {/* TOP RIGHT — wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all duration-200 ${
            isWishlisted
              ? "bg-red-600 text-white opacity-100"
              : "bg-white/90 text-gray-500 hover:bg-red-600 hover:text-white opacity-0 group-hover:opacity-100"
          }`}
          aria-label="Wishlist"
        >
          <Heart size={14} className={isWishlisted ? "fill-white" : ""} />
        </button>

        {/* BOTTOM — hover overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ease-out ${
            isHovered && inStock ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="bg-white/96 backdrop-blur-sm px-3 pt-3 pb-3 flex flex-col gap-2 shadow-[0_-6px_24px_rgba(0,0,0,0.10)]">

            {/* Qty selector */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Qty
              </span>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setQuantity((q) => Math.max(q - 1, 1)); }}
                  disabled={quantity <= 1}
                  className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <Minus size={11} strokeWidth={2.5} />
                </button>
                <span className="w-7 text-center text-sm font-black text-gray-900 select-none">
                  {quantity}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setQuantity((q) => Math.min(q + 1, maxQty)); }}
                  disabled={quantity >= maxQty}
                  className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <Plus size={11} strokeWidth={2.5} />
                </button>
              </div>
              {lowStock && (
                <span className="text-[10px] font-black text-red-600">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 rounded-sm text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-200 ${
                justAdded
                  ? "bg-green-600 text-white"
                  : "bg-gray-900 hover:bg-red-600 text-white"
              }`}
            >
              {justAdded ? (
                <><Check size={13} strokeWidth={3} /> Added to Bag!</>
              ) : (
                <><ShoppingBag size={13} /> Add to Bag — ${(price * quantity).toFixed(2)}</>
              )}
            </button>

            {/* View Details */}
            <button
              onClick={(e) => { e.stopPropagation(); goToDetail(); }}
              className="w-full py-1 text-[11px] font-bold text-gray-400 hover:text-red-600 flex items-center justify-center gap-1 transition-colors"
            >
              View Full Details <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* ══ TEXT BELOW IMAGE ════════════════════════════════ */}
      <div className="pt-2.5 pb-2 px-0.5">

        {/* Brand */}
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-0.5">
          {product.brand || product.category || ""}
        </p>

        {/* Name */}
        <h3
          onClick={goToDetail}
          className="text-[13px] leading-snug text-gray-800 font-normal line-clamp-2 cursor-pointer hover:text-red-600 transition-colors mb-1.5"
          style={{ fontFamily: FONT }}
        >
          {product.name}
        </h3>

        {/* Real stars */}
        <div className="mb-1.5">
          <Stars />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[15px] font-bold text-gray-900" style={{ fontFamily: FONT }}>
            ${price.toFixed(2)}
          </span>
          {hasDisc && (
            <>
              <span className="text-[12px] text-gray-400 line-through">
                ${msrp!.toFixed(2)}
              </span>
              <span className="text-[11px] font-black text-red-600">
                ({discount}% off)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
