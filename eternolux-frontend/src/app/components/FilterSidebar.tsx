// src/app/components/FilterSidebar.tsx
"use client";

import React from "react";
import { Check } from "lucide-react";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface FilterSidebarProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  brands: string[];
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  priceRange,
  onPriceRangeChange,
  brands,
  selectedBrands,
  onBrandsChange,
  categories,
  selectedCategories,
  onCategoriesChange,
  inStockOnly,
  onInStockChange,
  onClear,
}: FilterSidebarProps) {
  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandsChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandsChange([...selectedBrands, brand]);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="w-64 flex-shrink-0" style={{ fontFamily: FONT }}>
      <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Filters</h3>
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 font-bold transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-3">
              Price Range
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-700">${priceRange[0]}</span>
                <span className="font-bold text-gray-700">${priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-3">
                Category
              </label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all ${
                        selectedCategories.includes(category)
                          ? "bg-red-600 border-red-600"
                          : "border-gray-300 group-hover:border-red-400"
                      }`}>
                        {selectedCategories.includes(category) && (
                          <Check size={14} className="text-white absolute top-0.5 left-0.5" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 capitalize">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-3">
                Brand
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all ${
                        selectedBrands.includes(brand)
                          ? "bg-red-600 border-red-600"
                          : "border-gray-300 group-hover:border-red-400"
                      }`}>
                        {selectedBrands.includes(brand) && (
                          <Check size={14} className="text-white absolute top-0.5 left-0.5" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* In Stock Only */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => onInStockChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded transition-all ${
                  inStockOnly
                    ? "bg-red-600 border-red-600"
                    : "border-gray-300 group-hover:border-red-400"
                }`}>
                  {inStockOnly && (
                    <Check size={14} className="text-white absolute top-0.5 left-0.5" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700">
                In Stock Only
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
