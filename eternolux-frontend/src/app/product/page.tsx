// src/app/product/page.tsx - SHOP ALL PAGE WITH FILTERS
"use client";

import React, { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useGetProductsQuery } from "@/store/api";
import ProductTile from "@/app/components/ProductTitle";
import FilterSidebar from "@/app/components/FilterSidebar";
import SortDropdown from "@/app/components/SortDropdown";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function ShopAllPage() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Get unique brands and categories
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [products]);

  const categories = useMemo(() => {
    const catSet = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(catSet).sort();
  }, [products]);

  // Filter + Sort logic
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => p.category && selectedCategories.includes(p.category));
    }

    // In stock filter
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name-az":
          return a.name.localeCompare(b.name);
        case "name-za":
          return b.name.localeCompare(a.name);
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, priceRange, selectedBrands, selectedCategories, inStockOnly, sortBy]);

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setInStockOnly(false);
    setSortBy("featured");
  };

  const activeFilterCount = 
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    selectedBrands.length +
    selectedCategories.length +
    (inStockOnly ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Shop All Products
          </h1>
          <p className="text-gray-600">
            Discover our complete collection of luxury fragrances
          </p>

          {/* Filter and Sort Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap mt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 hover:border-red-600 rounded-lg font-bold text-sm transition-all"
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-sm text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold text-sm transition-all"
                >
                  <X size={18} />
                  Clear Filters
                </button>
              )}

              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          {showFilters && (
            <FilterSidebar
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandsChange={setSelectedBrands}
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
              onClear={clearFilters}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <ProductTile key={product.productId} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
