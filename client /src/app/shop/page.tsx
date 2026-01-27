"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import { useGetProductsQuery, type Product } from "@/app/api/api";
import cardImg from "@/state/images/product1.png";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("search") ?? "";

  // Normalize (trim + collapse spaces)
  const query = useMemo(() => raw.replace(/\s+/g, " ").trim(), [raw]);

  // ✅ THIS is the key: pass query into the API hook
  const {
    data: products = [],
    isLoading,
    isError,
  } = useGetProductsQuery(query ? query : undefined);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Shop</h1>
              {query ? (
                <p className="mt-2 text-gray-600">
                  Showing results for <span className="font-semibold">“{query}”</span>
                </p>
              ) : (
                <p className="mt-2 text-gray-600">Browse all products</p>
              )}
            </div>

            {query ? (
              <Link
                href="/shop"
                className="text-sm font-semibold hover:underline underline-offset-4"
              >
                Clear search
              </Link>
            ) : null}
          </div>

          {isLoading ? (
            <div className="mt-10 text-center text-gray-700">Loading products...</div>
          ) : isError ? (
            <div className="mt-10 text-center text-red-600">
              Could not load products. Check your API.
            </div>
          ) : products.length === 0 ? (
            <div className="mt-10 text-center text-gray-700">
              No products found{query ? ` for “${query}”` : ""}.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p: Product) => (
                <Link
                  key={p.productId}
                  href={`/homebase/${p.productId}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition block"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                    <Image
                      src={cardImg}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold leading-tight">{p.name}</div>
                      <div className="text-sm text-gray-600">
                        {p.description ?? "Eau de Parfum"}
                      </div>
                    </div>
                    {typeof p.rating === "number" ? (
                      <div className="text-xs font-semibold text-gray-700">
                        {p.rating.toFixed(1)} ★
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-bold">${p.price}</div>
                    <div className="text-xs text-gray-600">
                      {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
