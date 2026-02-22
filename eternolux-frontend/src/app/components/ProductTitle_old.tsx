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

const ProductTile: React.FC<ProductTileProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [clickCount, setClickCount] = useState(0);
  const [showingCount, setShowingCount] = useState(false);

  const discount =
    (product?.originalPrice ?? 0) > (product?.price ?? 0)
      ? Math.round(
          (((product?.originalPrice ?? 0) - (product?.price ?? 0)) /
            (product?.originalPrice ?? 1)) * 100
        )
      : 0;

  const isInWishlist = isWishlisted(product.productId);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    addToCart({
      ...product,
      images: product.images ?? (product.imageUrl ? [product.imageUrl] : ["/placeholder.png"]),
      imageUrl: product.imageUrl ?? product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
    });

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
      className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-200"
      style={{ fontFamily: FONT }}
    >
      {/* ── IMAGE CONTAINER (231×282 aspect ratio ≈ 0.82) ── */}
      <div className="relative w-full" style={{ aspectRatio: "231/282" }}>
        <div className="relative w-full h-full overflow-hidden bg-gray-50">
          <Image
            src={product.images?.[0] || product.imageUrl || "/placeholder.png"}
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
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20">
              {discount}% OFF
            </div>
          )}

          {/* Wishlist Button - TOP RIGHT, ALWAYS VISIBLE */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-20 ${
              isInWishlist
                ? "bg-red-600 text-white scale-110"
                : "bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-red-600 hover:text-white hover:scale-110"
            }`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              strokeWidth={2}
              fill={isInWishlist ? "currentColor" : "none"}
            />
          </button>

          {/* ADD TO CART OVERLAY - AT 2/3 POSITION (66% from top) */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "66%" }}>
                <button
                  onClick={handleAddToCart}
                  className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center gap-2 ${
                    showingCount
                      ? "bg-green-500 text-white scale-110"
                      : "bg-white text-gray-900 hover:bg-red-600 hover:text-white hover:scale-105"
                  }`}
                >
                  {showingCount ? (
                    <span className="text-sm font-black">+{clickCount}</span>
                  ) : (
                    <>
                      <ShoppingBag size={12} strokeWidth={1.5} />
                      Add to Bag
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="bg-white px-4 py-2 rounded-full">
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">
                  Out of Stock
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCT INFO ────────────────────────────────── */}
      <div className="p-3">
        {/* Brand/Category */}
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
          {product.brand || product.category || "Fragrance"}
        </p>

        {/* Product Name */}
        <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2rem] leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {(product.rating ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i < Math.floor(product.rating ?? 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-black text-red-600">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through font-medium">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status (if low) */}
        {!isOutOfStock && product.stock < 10 && (
          <p className="text-[10px] text-red-600 font-bold mt-1">
            Only {product.stock} left!
          </p>
        )}
      </div>
    </div>
  );
};

// Export as default
export default ProductTile;
