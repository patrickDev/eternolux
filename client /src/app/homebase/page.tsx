"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import { useGetProductsQuery } from "@/app/api/api";

// Replace with your images in /public or imported static assets
import heroImg from "@/state/images/product1.png"; // replace with a hero/banner image
import cardImg from "@/state/images/product1.png"; // replace with product card image

export default function HomePage() {
  const { data: products = [], isLoading, isError } = useGetProductsQuery();

  const bestsellers = useMemo(() => {
    return [...products].slice(0, 8);
  }, [products]);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {/* HERO */}
      <section className="pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs tracking-wide text-gray-700">
                NEW COLLECTION • LIMITED DROPS
              </p>

              <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight">
                Luxury Parfum, crafted to{" "}
                <span className="underline decoration-gray-300 underline-offset-4">
                  turn heads
                </span>
                .
              </h1>

              <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-xl">
                Discover signature scents with long-lasting projection. Clean
                ingredients, premium oils, and elegant bottles designed for your
                vanity and your presence.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/homebase"
                  className="inline-flex justify-center rounded-xl bg-black px-6 py-3 text-white font-semibold hover:bg-gray-900 transition"
                >
                  Shop Bestsellers
                </Link>
                <Link
                  href="#collections"
                  className="inline-flex justify-center rounded-xl border border-gray-300 px-6 py-3 text-black font-semibold hover:bg-gray-50 transition"
                >
                  Explore Collections
                </Link>
              </div>

              {/* trust row */}
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="font-semibold">Extrait-level</div>
                  <div className="text-gray-600">Premium concentration</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="font-semibold">All-day wear</div>
                  <div className="text-gray-600">Long-lasting performance</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="font-semibold">Fast shipping</div>
                  <div className="text-gray-600">Tracked delivery</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="font-semibold">Secure checkout</div>
                  <div className="text-gray-600">Safe payments</div>
                </div>
              </div>
            </div>

            {/* hero image */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-b from-gray-50 to-white blur-xl" />
              <div className="relative rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm">
                <Image
                  src={heroImg}
                  alt="Luxury parfum hero"
                  className="w-full h-auto rounded-2xl object-cover"
                  priority
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Featured</div>
                    <div className="font-semibold">EternoLux Signature</div>
                  </div>
                  <Link
                    href="/homebase"
                    className="rounded-xl bg-black px-4 py-2 text-white text-sm font-semibold hover:bg-gray-900 transition"
                  >
                    Shop now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Collections</h2>
              <p className="mt-2 text-gray-600">
                Choose a mood. Build a scent wardrobe.
              </p>
            </div>
            <Link href="/homebase" className="text-sm font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Fresh & Clean",
                desc: "Crisp citrus, airy musk, easy everyday wear.",
                tag: "Best for daytime",
              },
              {
                title: "Warm & Seductive",
                desc: "Amber, vanilla, woods — date-night energy.",
                tag: "Best for evenings",
              },
              {
                title: "Bold & Iconic",
                desc: "Spicy, smoky, unforgettable signature trails.",
                tag: "For statement makers",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-gray-200 p-6 bg-white hover:shadow-md transition"
              >
                <div className="text-xs text-gray-600">{c.tag}</div>
                <div className="mt-2 text-xl font-bold">{c.title}</div>
                <p className="mt-2 text-gray-600">{c.desc}</p>
                <Link
                  href="/homebase"
                  className="mt-5 inline-flex text-sm font-semibold hover:underline"
                >
                  Shop {c.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Bestsellers</h2>
              <p className="mt-2 text-gray-600">
                Customer favorites with proven performance.
              </p>
            </div>
            <Link href="/homebase" className="text-sm font-semibold hover:underline">
              Shop all
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-10 text-center text-gray-700">Loading products...</div>
          ) : isError ? (
            <div className="mt-10 text-center text-red-600">
              Could not load products. Please check your API.
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="mt-10 text-center text-gray-700">
              No products yet. Seed your database to show items here.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.map((p) => (
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
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {p.description ?? "Eau de Parfum"}
                      </div>
                    </div>

                    {typeof p.rating === "number" ? (
                      <div className="text-xs font-semibold text-gray-700 whitespace-nowrap">
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

                  {/* Optional: small “click to view” hint */}
                  <div className="mt-4 text-xs font-semibold text-gray-500">
                    View details →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The dry-down is addictive. I get compliments every time I wear it.",
                name: "Amara",
                meta: "Warm & Seductive collection",
              },
              {
                quote:
                  "Clean, elegant, and lasts all day. This is my new signature scent.",
                name: "Jordan",
                meta: "Fresh & Clean collection",
              },
              {
                quote:
                  "Smells like luxury. The projection is perfect and the bottle is beautiful.",
                name: "Mina",
                meta: "Bold & Iconic collection",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-gray-200 p-6">
                <p className="text-gray-700 leading-relaxed">“{t.quote}”</p>
                <div className="mt-4 font-semibold">{t.name}</div>
                <div className="text-sm text-gray-600">{t.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[28px] border border-gray-200 bg-black text-white p-10 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold">Find your signature scent</h3>
                <p className="mt-3 text-white/80 max-w-xl">
                  Shop bestsellers or explore by mood. Your next compliment is one
                  spray away.
                </p>
              </div>
              <div className="flex gap-3 lg:justify-end">
                <Link
                  href="/homebase"
                  className="inline-flex justify-center rounded-xl bg-white px-6 py-3 text-black font-semibold hover:bg-gray-100 transition"
                >
                  Shop now
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex justify-center rounded-xl border border-white/30 px-6 py-3 text-white font-semibold hover:bg-white/10 transition"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
