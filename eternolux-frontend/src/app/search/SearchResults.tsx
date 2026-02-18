// src/app/search/SearchResults.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ProductTile from "@/app/components/ProductTitle";
import { useSearchProductsQuery } from "@/store/api";
import { Search } from "lucide-react";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;

  // Fetch search results
  const { data: products, isLoading, error } = useSearchProductsQuery(
    { search: query, category },
    { skip: !query } // Skip query if no search term
  );

  // Group results by category
  const groupedResults = useMemo(() => {
    if (!products) return {};
    
    const groups: Record<string, typeof products> = {};
    products.forEach((product) => {
      const cat = product.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(product);
    });
    
    return groups;
  }, [products]);

  const totalResults = products?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>
      {/* ── HERO SECTION ────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Search size={40} strokeWidth={2} />
            <h1 className="text-5xl md:text-6xl font-black">Search Results</h1>
          </div>
          {query && (
            <p className="text-xl text-red-100">
              Showing results for &quot;<span className="font-bold">{query}</span>&quot;
            </p>
          )}
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div className="container mx-auto px-6 py-12">
        
        {/* No Query */}
        {!query && (
          <div className="text-center py-16">
            <Search size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Enter a search term
            </h2>
            <p className="text-gray-600">
              Use the search bar above to find products
            </p>
          </div>
        )}

        {/* Loading */}
        {query && isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {query && error && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              Please try again or refine your search
            </p>
          </div>
        )}

        {/* Results Count */}
        {query && !isLoading && !error && (
          <div className="mb-8">
            <p className="text-sm text-gray-600">
              Found <span className="font-bold text-gray-900">{totalResults}</span>{" "}
              {totalResults === 1 ? "result" : "results"}
            </p>
          </div>
        )}

        {/* No Results */}
        {query && !isLoading && !error && totalResults === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              No products found
            </h2>
            <p className="text-gray-600 mb-6">
              Try different keywords or browse our categories
            </p>
            <a
              href="/homebase"
              className="inline-block bg-gray-900 hover:bg-red-600 text-white font-bold text-sm px-8 py-3 rounded-full transition-all"
            >
              Browse All Products
            </a>
          </div>
        )}

        {/* Results - Grouped by Category */}
        {query && !isLoading && !error && totalResults > 0 && (
          <div className="space-y-12">
            {Object.entries(groupedResults).map(([categoryName, categoryProducts]) => (
              <section key={categoryName}>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  {categoryName}
                  <span className="ml-3 text-base font-normal text-gray-500">
                    ({categoryProducts.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {categoryProducts.map((product) => (
                    <ProductTile key={product.productId} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
