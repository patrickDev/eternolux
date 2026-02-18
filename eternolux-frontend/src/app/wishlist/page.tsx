// src/app/wishlist/page.tsx
"use client";

import React from "react";
import { Heart, ShoppingBag, Trash2, Share2 } from "lucide-react";
import ProductTile from "@/app/components/ProductTitle";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist, shareUrl } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    wishlistItems.forEach((product) => {
    addToCart({
     ...product,
     images: product.images ?? (product.imageUrl ? [product.imageUrl] : ["/placeholder.png"]),
      imageUrl: product.imageUrl ?? product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
    });
    });
  };

  const handleShare = async () => {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({
          title: "My EternoLux Wishlist",
          text: "Check out my favorite fragrances!",
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert("Wishlist link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>
      
      {/* ── HEADER ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart size={40} strokeWidth={2} fill="currentColor" />
            <h1 className="text-5xl md:text-6xl font-black">My Wishlist</h1>
          </div>
          <p className="text-xl text-red-100">
            {wishlistCount === 0
              ? "Your wishlist is empty"
              : `${wishlistCount} ${wishlistCount === 1 ? "item" : "items"} saved`}
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div className="container mx-auto px-6 py-12">
        
        {/* Empty State */}
        {wishlistCount === 0 && (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start adding your favorite fragrances to your wishlist
            </p>
            <a
              href="/homebase"
              className="inline-block bg-gray-900 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
            >
              Shop All Fragrances
            </a>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistCount > 0 && (
          <>
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
                >
                  <ShoppingBag size={18} />
                  Add All to Bag
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-900 text-gray-900 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
              <button
                onClick={clearWishlist}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm uppercase tracking-widest transition-colors"
              >
                <Trash2 size={18} />
                Clear All
              </button>
            </div>

            {/* Product Grid - Same as homebase */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {wishlistItems.map((product) => (
                <ProductTile key={product.productId} product={product} />
              ))}
            </div>

            {/* Bottom Actions (Mobile) */}
            <div className="mt-12 flex flex-col gap-3 md:hidden">
              <button
                onClick={handleAddAllToCart}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-red-600 text-white px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
              >
                <ShoppingBag size={18} />
                Add All to Bag
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-900 text-gray-900 px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
              >
                <Share2 size={18} />
                Share Wishlist
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── RECOMMENDATIONS ─────────────────────────────── */}
      {wishlistCount > 0 && (
        <section className="bg-white py-16 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              You Might Also Like
            </h2>
            <p className="text-gray-600 mb-8">
              Based on your wishlist selections
            </p>
            {/* Add recommendations here if you have a recommendations API */}
            <a
              href="/homebase"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
            >
              Browse All Fragrances
              <ShoppingBag size={18} />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
