// src/app/homebase/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import HeroSlideshow from "@/app/components/HeroSlideshow";
import ProductTile from "@/app/components/ProductTitle";
import { useGetProductsQuery } from "@/store/api";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function HomebasePage() {
  const { data: products, isLoading, error } = useGetProductsQuery();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // Categories from products
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, priceRange]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Failed to load products
          </h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>
      
      {/* ── HERO SLIDESHOW ──────────────────────────────── */}
      <HeroSlideshow />

      {/* ── FILTERS BAR ────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm px-6 py-3 pr-10 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm px-6 py-3 pr-10 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"
              />
            </div>

            {/* Filters Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-gray-900 hover:bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-full transition-all flex items-center gap-2"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="md:hidden mt-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Price Range
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SHOP ALL SECTION ────────────────────────────── */}
      <section className="container mx-auto px-6 py-12">
        
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Shop All Fragrances
          </h2>
          <p className="text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden animate-pulse"
              >
                <div className="w-full bg-gray-200" style={{ aspectRatio: "231/282" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid - 5 columns on XL screens */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductTile key={product.productId} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSortBy("featured");
                setPriceRange([0, 500]);
              }}
              className="bg-gray-900 hover:bg-red-600 text-white font-bold text-sm px-8 py-3 rounded-full transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
