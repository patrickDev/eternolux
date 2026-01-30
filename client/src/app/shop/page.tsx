"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SearchX, Filter } from "lucide-react";

import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import { useGetProductsQuery, type Product } from "@/app/api/api";
import cardImg from "@/state/images/product1.png";

function ShopContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("search") ?? "";
  const query = useMemo(() => raw.replace(/\s+/g, " ").trim(), [raw]);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useGetProductsQuery(query ? query : undefined);

  return (
    <main className="pt-40 pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 block">
              EternoLux Catalog
            </span>
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              {query ? "Results" : "The Shop"}
            </h1>
            {query && (
              <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                Searching for: <span className="text-black">"{query}"</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 border-gray-100 px-5 py-2.5 rounded-full hover:bg-black hover:text-white transition">
              <Filter size={14} /> Filter
            </button>
            {query && (
              <Link
                href="/shop"
                className="text-xs font-black uppercase tracking-widest text-red-600 hover:underline"
              >
                Clear Search
              </Link>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="py-40 text-center font-black uppercase italic tracking-widest text-gray-300 animate-pulse">
            Searching Vault...
          </div>
        ) : isError ? (
          <div className="py-40 text-center">
            <h2 className="text-xl font-black uppercase italic">Connection Lost</h2>
            <p className="text-gray-500 text-sm mt-2">Could not reach the EternoLux API.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-40 text-center flex flex-col items-center">
            <SearchX size={48} className="text-gray-200 mb-4" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">No Scents Found</h2>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or browsing our bestsellers.</p>
            <Link href="/shop" className="mt-8 bg-black text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest">
              Browse All
            </Link>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p: Product) => {
              const msrp = Number(p.price) * 1.45;
              return (
                <Link
                  key={p.productId}
                  href={`/homebase/${p.productId}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-white border border-gray-50 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <Image
                      src={cardImg}
                      alt={p.name}
                      fill
                      className="object-contain p-8 group-hover:scale-110 transition duration-700"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full">
                      -{Math.round(((msrp - Number(p.price)) / msrp) * 100)}%
                    </div>
                  </div>

                  <div className="mt-6 px-1 text-center">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Eau De Parfum
                    </div>
                    <div className="font-black text-lg uppercase tracking-tighter truncate">
                      {p.name}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="font-black text-xl">${Number(p.price).toFixed(2)}</span>
                      <span className="text-gray-300 line-through text-xs font-bold">
                        ${msrp.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-1 text-yellow-500">
                      <span className="text-[10px] font-black text-black mr-1">4.9</span>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-[10px]">★</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-black">
      <Navbar />
      <Suspense fallback={<div className="pt-40 text-center font-black italic">Loading Shop...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  );
}