// src/app/search/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Star, ShoppingBag, Check, Heart } from "lucide-react";
import Image from "next/image";
import { useGetProductsQuery } from "@/store/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/app/types/product.types";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const PRICE_RANGES = [
  { label: "All Prices",     min: 0,   max: Infinity },
  { label: "Under $50",      min: 0,   max: 50 },
  { label: "$50 – $100",     min: 50,  max: 100 },
  { label: "$100 – $200",    min: 100, max: 200 },
  { label: "Over $200",      min: 200, max: Infinity },
];

export default function SearchPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { data: allProducts = [], isLoading } = useGetProductsQuery();
  const { addToCart }   = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [query,         setQuery]         = useState(initialQuery);
  const [debouncedQ,    setDebouncedQ]    = useState(initialQuery);
  const [selectedCats,  setSelectedCats]  = useState<string[]>([]);
  const [priceRange,    setPriceRange]    = useState(0); // index into PRICE_RANGES
  const [showFilters,   setShowFilters]   = useState(false);
  const [addedIds,      setAddedIds]      = useState<Set<string>>(new Set());
  const [imgErrors,     setImgErrors]     = useState<Set<string>>(new Set());

  // ── Debounce query ────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // ── Sync URL ──────────────────────────────────────────────
  useEffect(() => {
    const url = debouncedQ ? `/search?q=${encodeURIComponent(debouncedQ)}` : "/search";
    window.history.replaceState(null, "", url);
  }, [debouncedQ]);

  // ── Unique categories from data ───────────────────────────
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allProducts]);

  // ── Filter + search client-side ───────────────────────────
  const results = useMemo(() => {
    let list = [...allProducts];

    // Text search: name + description + tags + brand + category
    if (debouncedQ.trim()) {
      const q = debouncedQ.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCats.length > 0) {
      list = list.filter((p) => selectedCats.includes(p.category ?? ""));
    }

    // Price filter
    const range = PRICE_RANGES[priceRange];
    if (range.min > 0 || range.max !== Infinity) {
      list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }

    return list;
  }, [allProducts, debouncedQ, selectedCats, priceRange]);

  const toggleCategory = (cat: string) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 } as any);
    setAddedIds((prev) => new Set(prev).add(product.productId));
    setTimeout(() => {
      setAddedIds((prev) => { const n = new Set(prev); n.delete(product.productId); return n; });
    }, 2000);
  };

  const activeFilterCount = selectedCats.length + (priceRange > 0 ? 1 : 0);

  // ── Skeleton ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl py-10">
          <div className="h-12 bg-gray-200 rounded-full animate-pulse mb-8 max-w-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[3/4]" />
                <div className="pt-2 space-y-2">
                  <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>

      {/* ── Search Header ────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl py-4">
          <div className="flex items-center gap-3">

            {/* Search input */}
            <div className="relative flex-1 max-w-2xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrances, brands, categories..."
                autoFocus
                className="w-full pl-11 pr-10 py-3 bg-gray-100 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-full border-2 text-sm font-bold uppercase tracking-widest transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700 hover:border-gray-900"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6">

              {/* Categories */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                        selectedCats.includes(cat)
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-300 text-gray-600 hover:border-gray-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Price
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, i) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(i)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        priceRange === i
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-300 text-gray-600 hover:border-gray-900"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setSelectedCats([]); setPriceRange(0); }}
                  className="self-end text-xs font-bold text-red-600 hover:underline uppercase tracking-widest"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-7xl py-8">

        {/* Count */}
        <p className="text-sm text-gray-500 mb-6">
          {debouncedQ ? (
            <><span className="font-bold text-gray-900">{results.length}</span> results for &ldquo;<span className="text-red-600 font-bold">{debouncedQ}</span>&rdquo;</>
          ) : (
            <><span className="font-bold text-gray-900">{results.length}</span> products</>
          )}
        </p>

        {/* No results */}
        {results.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <Search size={48} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-xl font-black text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 text-sm mb-6">
              Try a different search term or remove filters.
            </p>
            <button
              onClick={() => { setQuery(""); setSelectedCats([]); setPriceRange(0); }}
              className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map((product) => {
            const price    = product.price;
            const msrp     = product.originalPrice ?? null;
            const hasDisc  = msrp !== null && msrp > price;
            const discount = hasDisc ? Math.round(((msrp - price) / msrp) * 100) : 0;
            const inStock  = product.stock > 0 && product.status !== "out_of_stock";
            const imgSrc   = product.imageUrl || product.images?.[0] || "";
            const isR2     = imgSrc.includes("images.eternolux.com");
            const imgErr   = imgErrors.has(product.productId);
            const wishlisted = isWishlisted(product.productId);
            const justAdded  = addedIds.has(product.productId);

            return (
              <div key={product.productId} className="bg-white group relative flex flex-col">
                {/* Image */}
                <div
                  className="relative overflow-hidden bg-gray-100 cursor-pointer"
                  style={{ aspectRatio: "3/4" }}
                  onClick={() => router.push(`/homebase/${product.productId}`)}
                >
                  {imgSrc && !imgErr ? (
                    <Image
                      src={imgSrc} alt={product.name} fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      onError={() => setImgErrors((prev) => new Set(prev).add(product.productId))}
                      unoptimized={isR2}
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <ShoppingBag size={32} className="text-gray-200" strokeWidth={1} />
                    </div>
                  )}

                  {!inStock && (
                    <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
                      <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {hasDisc && (
                    <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-widest">
                      {discount}% off
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100 ${
                      wishlisted ? "bg-red-600 text-white opacity-100" : "bg-white/90 text-gray-500 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    <Heart size={14} className={wishlisted ? "fill-white" : ""} />
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
                        <Star key={i} size={10}
                          fill={i < Math.floor(product.rating ?? 0) ? "#E21A23" : "none"}
                          className={i < Math.floor(product.rating ?? 0) ? "text-red-600" : "text-gray-300"}
                        />
                      ))}
                      {(product.reviewCount ?? 0) > 0 && (
                        <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-[15px] font-bold text-gray-900">${price.toFixed(2)}</span>
                    {hasDisc && (
                      <span className="text-[12px] text-gray-400 line-through">${msrp!.toFixed(2)}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!inStock}
                    className={`mt-auto w-full py-2.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all rounded-sm ${
                      !inStock ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : justAdded ? "bg-green-600 text-white"
                        : "bg-gray-900 hover:bg-red-600 text-white"
                    }`}
                  >
                    {justAdded ? <><Check size={13} strokeWidth={3} /> Added!</>
                      : <><ShoppingBag size={13} /> {inStock ? "Add to Bag" : "Out of Stock"}</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
