// src/app/components/ProductTile.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/app/types/product.types";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface ProductTileProps {
  product: Product;
}

export default function ProductTile({ product }: ProductTileProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [clickCount, setClickCount] = useState(0);
  const [showingCount, setShowingCount] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isInWishlist = isWishlisted(product.productId);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    // Increment click count
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Add to cart
   addToCart({
  ...product,
  // keep Product fields intact
  images: product.images ?? (product.imageUrl ? [product.imageUrl] : ["/placeholder.png"]),
  imageUrl: product.imageUrl ?? product.images?.[0] ?? "/placeholder.png",
  quantity: 1,
});

    // Show "+X" on button for 1 second
    setShowingCount(true);
    setTimeout(() => setShowingCount(false), 1000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    router.push(`/product/${product.productId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-gray-200"
      style={{ fontFamily: FONT }}
    >
      {/* ── IMAGE CONTAINER ─────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Image
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.png";
          }}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg z-20">
            {discount}% OFF
          </div>
        )}

        {/* Wishlist Button - TOP RIGHT, ALWAYS VISIBLE */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-20 ${
            isInWishlist
              ? "bg-red-600 text-white scale-110"
              : "bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-red-600 hover:text-white hover:scale-110"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={20}
            strokeWidth={2}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>

        {/* ADD TO CART OVERLAY - APPEARS ON IMAGE HOVER */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
            <button
              onClick={handleAddToCart}
              className={`px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest transition-all duration-300 shadow-2xl flex items-center gap-3 ${
                showingCount
                  ? "bg-green-500 text-white scale-125"
                  : "bg-white text-gray-900 hover:bg-red-600 hover:text-white hover:scale-110"
              }`}
            >
              {showingCount ? (
                // Show "+X" after click
                <span className="text-2xl font-black">+{clickCount}</span>
              ) : (
                // Show "Add to Bag" with icon
                <>
                  <ShoppingBag size={22} strokeWidth={2.5} />
                  Add to Bag
                </>
              )}
            </button>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-white px-6 py-3 rounded-full">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Out of Stock
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── PRODUCT INFO ────────────────────────────────── */}
      <div className="p-5">
        {/* Brand/Category */}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
          {product.brand || product.category || "Fragrance"}
        </p>

        {/* Product Name */}
        <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {((product.rating ?? 0) > 0) && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(product.rating ?? 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              ({product.reviewCount ?? 0})
            </span>
          </div>
        )}


        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-red-600">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through font-medium">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status (if low) */}
        {!isOutOfStock && product.stock < 10 && (
          <p className="text-xs text-red-600 font-bold mt-2">
            Only {product.stock} left!
          </p>
        )}
      </div>
    </div>
  );
}
