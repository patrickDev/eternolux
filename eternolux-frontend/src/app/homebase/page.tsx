// src/app/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Sparkles, Award,
  TrendingUp, Shield, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api";
import type { Product } from "@/app/types/product.types";
import CartModal from "@/app/checkout/cartModal";
import ProductTile from "@/app/components/ProductTitle";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const HERO_SLIDES = [
  {
    id: 1, eyebrow: "New Collection 2025", title: "Born From", titleAccent: "Luxury",
    description: "Handcrafted fragrances that transcend time. Experience the pinnacle of olfactory artistry.",
    cta: "Explore Collection", ctaSecondary: "Shop Men's",
    bg: "from-gray-950 via-red-950 to-gray-950",
  },
  {
    id: 2, eyebrow: "For Him", title: "Command", titleAccent: "Attention",
    description: "Bold, sophisticated, unforgettable. Masculine scents engineered for the modern gentleman.",
    cta: "Shop Men's", ctaSecondary: "View All",
    bg: "from-gray-950 via-gray-900 to-black",
  },
  {
    id: 3, eyebrow: "For Her", title: "Pure", titleAccent: "Elegance",
    description: "Delicate yet powerful. Feminine fragrances that leave an unforgettable impression.",
    cta: "Shop Women's", ctaSecondary: "View All",
    bg: "from-red-950 via-gray-950 to-gray-900",
  },
];

const TRUST_BADGES = [
  { icon: Shield,     label: "100% Authentic"  },
  { icon: Award,      label: "Premium Quality" },
  { icon: TrendingUp, label: "Trending Now"    },
  { icon: Sparkles,   label: "Exclusive Scents"},
];

export default function HomePage() {
  const router = useRouter();
  const { data: products = [], isLoading } = useGetProductsQuery(undefined);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused]         = useState(false);
  const [isCartOpen, setIsCartOpen]     = useState(false);
  const [cartProduct, setCartProduct]   = useState<Product | null>(null);
  const [wishlist, setWishlist]         = useState<string[]>([]);

  const featured    = products.slice(0, 4);
  const bestSellers = products.slice(0, 3);
  const newArrivals = products.slice(4, 8);

  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide, isPaused]);

  const toggleWishlist    = (id: string) =>
    setWishlist((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]);

  const handleAddedToCart = (product: Product) => {
    setCartProduct(product);
    setIsCartOpen(true);
  };

  const SectionHeader = ({ eyebrow, title, href, linkLabel }: {
    eyebrow: string; title: string; href: string; linkLabel: string;
  }) => (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 mb-1.5">{eyebrow}</p>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900"
          style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>{title}</h2>
      </div>
      <button onClick={() => router.push(href)}
        className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-red-600 border-b-2 border-gray-900 hover:border-red-600 pb-0.5 transition-all">
        {linkLabel} <ArrowRight size={14} />
      </button>
    </div>
  );

  const Skeleton = ({ count, cols }: { count: number; cols: string }) => (
    <div className={`grid gap-4 ${cols}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200" style={{ aspectRatio: "3/4" }} />
          <div className="pt-2.5 space-y-2">
            <div className="h-2.5 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-white">

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        {HERO_SLIDES.map((slide, index) => (
          <div key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-gradient-to-br ${slide.bg} ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}>
            <div className="absolute top-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-64 h-64 bg-red-800/10 rounded-full blur-2xl" />
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6 max-w-7xl">
                <div className="max-w-2xl">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 border border-red-500/30 bg-red-500/10 rounded-full mb-5 transition-all duration-700 delay-100 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    <Sparkles size={13} className="text-red-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-300">{slide.eyebrow}</span>
                  </div>
                  <h1 className={`text-5xl md:text-7xl font-black leading-none mb-4 transition-all duration-700 delay-200 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ fontFamily: FONT }}>
                    <span className="text-white">{slide.title} </span>
                    <span className="text-red-500">{slide.titleAccent}</span>
                  </h1>
                  <p className={`text-base text-gray-300 mb-8 max-w-lg leading-relaxed transition-all duration-700 delay-300 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    {slide.description}
                  </p>
                  <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-500 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    <button onClick={() => router.push("/homebase")}
                      className="group flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-900/40 hover:-translate-y-0.5">
                      {slide.cta} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => router.push("/homebase")}
                      className="px-7 py-3.5 border-2 border-white/30 hover:border-white text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:bg-white/10">
                      {slide.ctaSecondary}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={prevSlide} className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-red-600 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm">
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextSlide} className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-red-600 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm">
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"}`} />
          ))}
        </div>
        <div className="absolute bottom-7 right-7 text-white/40 text-xs font-bold tracking-widest">
          {String(currentSlide + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
        </div>
      </section>

      {/* ═══ TRUST BADGES ══════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2.5">
                <item.icon size={18} className="text-red-600 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BEST SELLERS ══════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader eyebrow="Top Picks" title="Best Sellers" href="/homebase?sort=popular" linkLabel="View All" />
          {isLoading ? <Skeleton count={3} cols="grid-cols-1 md:grid-cols-3" /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bestSellers.map((product, idx) => (
                <ProductTile key={product.productId} product={product} rank={idx + 1}
                  isWishlisted={wishlist.includes(product.productId)}
                  onWishlist={() => toggleWishlist(product.productId)}
                  onAddedToCart={handleAddedToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ PROMO ══════════════════════════════════════════ */}
      <section className="bg-red-600 text-white py-14">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">Limited Time</p>
              <h3 className="text-2xl md:text-3xl font-black" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
                Up to 60% Off<br /><span className="text-red-200">Presidents&apos; Day Sale</span>
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push("/homebase?filter=sale")}
                className="px-7 py-3.5 bg-white text-red-600 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg">
                Shop the Sale
              </button>
              <button onClick={() => router.push("/homebase")}
                className="px-7 py-3.5 border-2 border-white/50 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:border-white hover:bg-white/10 transition-all">
                All Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED COLLECTION ═══════════════════════════ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader eyebrow="Curated For You" title="Featured Collection" href="/homebase" linkLabel="Shop All" />
          {isLoading ? <Skeleton count={4} cols="grid-cols-2 lg:grid-cols-4" /> : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <ProductTile key={product.productId} product={product}
                  isWishlisted={wishlist.includes(product.productId)}
                  onWishlist={() => toggleWishlist(product.productId)}
                  onAddedToCart={handleAddedToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ NEW ARRIVALS ══════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader eyebrow="Just Dropped" title="New Arrivals" href="/homebase?filter=new" linkLabel="See All New" />
          {isLoading ? <Skeleton count={4} cols="grid-cols-2 lg:grid-cols-4" /> : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductTile key={product.productId} product={product} badge="New"
                  isWishlisted={wishlist.includes(product.productId)}
                  onWishlist={() => toggleWishlist(product.productId)}
                  onAddedToCart={handleAddedToCart} />
              ))}
            </div>
          )}
          <div className="text-center mt-10 md:hidden">
            <button onClick={() => router.push("/homebase")}
              className="px-7 py-3.5 border-2 border-gray-900 text-gray-900 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ════════════════════════════════════ */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">Stay In The Loop</p>
          <h3 className="text-2xl md:text-3xl font-black mb-3"
            style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>Join Our Exclusive Circle</h3>
          <p className="text-gray-400 mb-7 max-w-md mx-auto text-sm">
            Get early access to new releases, exclusive offers, and 15% off your first order.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-5 py-3 rounded-full text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-400" />
            <button type="submit"
              className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} product={cartProduct} />
    </main>
  );
}
