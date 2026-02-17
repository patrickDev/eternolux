// src/app/components/SearchBar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useGetProductsQuery } from "@/store/api";
import type { Product } from "@/app/types/product.types";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const TRENDING = ["Chanel", "Perfume", "Cologne", "Gift Sets", "Limited Edition"];

export default function SearchBar() {
  const router = useRouter();
  const { data: allProducts = [] } = useGetProductsQuery();

  const [query,    setQuery]    = useState("");
  const [focused,  setFocused]  = useState(false);
  const [results,  setResults]  = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Debounced search ─────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (!query.trim()) { setResults([]); return; }
      const q = query.toLowerCase();
      const found = allProducts
        .filter((p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand  ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
        )
        .slice(0, 6);
      setResults(found);
    }, 200);
    return () => clearTimeout(t);
  }, [query, allProducts]);

  // ── Click outside to close ───────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleSelect = (product: Product) => {
    setFocused(false);
    setQuery("");
    router.push(`/homebase/${product.productId}`);
  };

  const handleTrending = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setFocused(false);
  };

  const showDropdown = focused && (query.trim().length > 0 || true); // show on focus

  return (
    <div className="relative flex-1 max-w-xl" style={{ fontFamily: FONT }}>
      {/* Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="What are you looking for today?"
            className="w-full pl-10 pr-9 py-2.5 bg-gray-100 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-gray-300 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        >
          {/* Results */}
          {results.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1.5">
                Products
              </p>
              {results.map((product) => {
                const imgSrc = product.imageUrl || product.images?.[0] || "";
                const isR2   = imgSrc.includes("images.eternolux.com");
                return (
                  <button
                    key={product.productId}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden relative">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={product.name} fill
                          className="object-cover object-top" unoptimized={isR2}
                          sizes="40px" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {product.brand || product.category}
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm font-black text-red-600">${product.price.toFixed(2)}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
              {/* View all results */}
              <button
                onClick={() => { router.push(`/search?q=${encodeURIComponent(query)}`); setFocused(false); setQuery(""); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                See all results for &ldquo;{query}&rdquo; <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* No results message */}
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-500">No products found for &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => { router.push(`/search?q=${encodeURIComponent(query)}`); setFocused(false); setQuery(""); }}
                className="mt-2 text-xs font-bold text-red-600 hover:underline"
              >
                Search anyway →
              </button>
            </div>
          )}

          {/* Trending (show when no query) */}
          {!query.trim() && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                <TrendingUp size={11} /> Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((term) => (
                  <button key={term} onClick={() => handleTrending(term)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider transition-all">
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
