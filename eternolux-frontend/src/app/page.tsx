// src/app/page.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Star, Sparkles, Gift } from "lucide-react";
import HeroSlideshow from "@/app/components/HeroSlideshow";
import ProductTile from "@/app/components/ProductTitle";
import { useGetProductsQuery } from "@/store/api";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function LandingPage() {
  const { data: products, isLoading } = useGetProductsQuery();

  // Featured products
  const featuredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.tags?.includes("featured")).slice(0, 10);
  }, [products]);

  // New arrivals
  const newArrivals = useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.tags?.includes("new")).slice(0, 10);
  }, [products]);

  // Best sellers
  const bestSellers = useMemo(() => {
    if (!products) return [];
    return products.filter(p => (p.rating ?? 0) >= 4.5).slice(0, 10);
  }, [products]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: FONT }}>
      
      {/* ── HERO SLIDESHOW ──────────────────────────────── */}
      <HeroSlideshow />

      {/* ── FEATURES SECTION ────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Star size={32} />}
              title="Premium Quality"
              description="Handpicked luxury fragrances from the world's finest perfume houses"
            />
            <FeatureCard
              icon={<Sparkles size={32} />}
              title="Authentic Products"
              description="100% genuine products with certificates of authenticity"
            />
            <FeatureCard
              icon={<Gift size={32} />}
              title="Gift Ready"
              description="Elegant packaging and personalized gift messages available"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  Featured Collection
                </h2>
                <p className="text-gray-600">Our most coveted fragrances</p>
              </div>
              <Link
                href="/homebase?filter=featured"
                className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                View All
                <ArrowRight size={20} />
              </Link>
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {featuredProducts.map((product) => (
                  <ProductTile key={product.productId} product={product} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/homebase?filter=featured"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                View All Featured
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  New Arrivals
                </h2>
                <p className="text-gray-600">Fresh scents just for you</p>
              </div>
              <Link
                href="/homebase?filter=new"
                className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                View All
                <ArrowRight size={20} />
              </Link>
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {newArrivals.map((product) => (
                  <ProductTile key={product.productId} product={product} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/homebase?filter=new"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                View All New Arrivals
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── BEST SELLERS ────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  Best Sellers
                </h2>
                <p className="text-gray-600">Customer favorites</p>
              </div>
              <Link
                href="/homebase?sort=popular"
                className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                View All
                <ArrowRight size={20} />
              </Link>
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {bestSellers.map((product) => (
                  <ProductTile key={product.productId} product={product} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/homebase?sort=popular"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                View All Best Sellers
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA SECTION ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Discover Your Signature Scent
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Explore our complete collection of luxury fragrances and find the perfect scent that defines you.
          </p>
          <Link
            href="/homebase"
            className="inline-block bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl hover:shadow-white/20 hover:scale-105"
          >
            Shop All Fragrances
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURE CARD
═══════════════════════════════════════════════════════════ */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT GRID SKELETON
═══════════════════════════════════════════════════════════ */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
          <div className="w-full bg-gray-200" style={{ aspectRatio: "231/282" }} />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
