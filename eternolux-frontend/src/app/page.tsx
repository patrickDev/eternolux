// src/app/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Sparkles,
  Award,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  Heart,
  Check,
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/app/types/product.types";
import CartModal from "@/app/checkout/cartModal";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// ─── Hero Slides ───────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "New Collection 2025",
    title: "Born From",
    titleAccent: "Luxury",
    description:
      "Handcrafted fragrances that transcend time. Experience the pinnacle of olfactory artistry.",
    cta: "Explore Collection",
    ctaSecondary: "Shop Men's",
    bg: "from-gray-950 via-red-950 to-gray-950",
  },
  {
    id: 2,
    eyebrow: "For Him",
    title: "Command",
    titleAccent: "Attention",
    description:
      "Bold, sophisticated, unforgettable. Masculine scents engineered for the modern gentleman.",
    cta: "Shop Men's",
    ctaSecondary: "View All",
    bg: "from-gray-950 via-gray-900 to-black",
  },
  {
    id: 3,
    eyebrow: "For Her",
    title: "Pure",
    titleAccent: "Elegance",
    description:
      "Delicate yet powerful. Feminine fragrances that leave an unforgettable impression.",
    cta: "Shop Women's",
    ctaSecondary: "View All",
    bg: "from-red-950 via-gray-950 to-gray-900",
  },
];

const TRUST_BADGES = [
  { icon: Shield,     label: "100% Authentic"  },
  { icon: Award,      label: "Premium Quality" },
  { icon: TrendingUp, label: "Trending Now"    },
  { icon: Sparkles,   label: "Exclusive Scents"},
];

// ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: products = [], isLoading } = useGetProductsQuery(undefined);

  const [currentSlide, setCurrentSlide]   = useState(0);
  const [isCartOpen, setIsCartOpen]       = useState(false);
  const [addedProduct, setAddedProduct]   = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [wishlist, setWishlist]           = useState<string[]>([]);
  const [isPaused, setIsPaused]           = useState(false);

  const featured    = products.slice(0, 4);
  const bestSellers = products.slice(0, 3);
  const newArrivals = products.slice(4, 8);

  // ── Slideshow ──────────────────────────────────────────────
  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide, isPaused]);

  // ── Handlers ───────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 } as any);
    setAddedProduct(product);
    setAddedProductId(product.productId);
    setIsCartOpen(true);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const toggleWishlist = (productId: string) =>
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

  const getProductImage = (p: Product): string =>
    p.imageUrl ?? p.images?.[0] ?? "/placeholder-product.jpg";

  // ── Section header helper ──────────────────────────────────
  const SectionHeader = ({
    eyebrow, title, href, linkLabel,
  }: { eyebrow: string; title: string; href: string; linkLabel: string }) => (
    <div className="flex items-end justify-between mb-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 mb-1.5">
          {eyebrow}
        </p>
        <h2
          className="text-2xl md:text-3xl font-black text-gray-900"
          style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
      </div>
      <button
        onClick={() => router.push(href)}
        className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-red-600 border-b-2 border-gray-900 hover:border-red-600 pb-0.5 transition-all"
      >
        {linkLabel} <ArrowRight size={15} />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">

      {/* ══════════════════════════════════════
          HERO SLIDESHOW
      ══════════════════════════════════════ */}
      <section
        className="relative h-[85vh] min-h-[580px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-gradient-to-br ${slide.bg} ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <div className="absolute top-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-64 h-64 bg-red-800/10 rounded-full blur-2xl" />

            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-3xl">
                  {/* Eyebrow */}
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 border border-red-500/30 bg-red-500/10 rounded-full mb-5 transition-all duration-700 delay-100 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                    <Sparkles size={13} className="text-red-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-300">
                      {slide.eyebrow}
                    </span>
                  </div>

                  {/* Title */}
                  <h1
                    className={`text-5xl md:text-7xl font-black leading-none mb-4 transition-all duration-700 delay-200 ${
                      index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ fontFamily: FONT }}
                  >
                    <span className="text-white">{slide.title} </span>
                    <span className="text-red-500">{slide.titleAccent}</span>
                  </h1>

                  {/* Description */}
                  <p className={`text-base text-gray-300 mb-9 max-w-xl leading-relaxed transition-all duration-700 delay-300 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                    {slide.description}
                  </p>

                  {/* CTAs */}
                  <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 ${
                    index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                    <button
                      onClick={() => router.push("/homebase")}
                      className="group flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-red-900/40 hover:-translate-y-0.5"
                    >
                      {slide.cta}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => router.push("/homebase")}
                      className="px-7 py-3.5 border-2 border-white/30 hover:border-white text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:bg-white/10"
                    >
                      {slide.ctaSecondary}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-red-600 border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm">
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-red-600 border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm">
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute bottom-7 right-7 text-white/40 text-xs font-bold tracking-widest">
          {String(currentSlide + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST BADGES
      ══════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2.5">
                <item.icon size={18} className="text-red-600 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BEST SELLERS
      ══════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader
            eyebrow="Top Picks"
            title="Best Sellers"
            href="/homebase?sort=popular"
            linkLabel="View All"
          />
          {isLoading ? (
            <SkeletonGrid count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bestSellers.map((product, idx) => (
                <BestSellerCard
                  key={product.productId}
                  product={product}
                  rank={idx + 1}
                  isWishlisted={wishlist.includes(product.productId)}
                  justAdded={addedProductId === product.productId}
                  onAddToCart={() => handleAddToCart(product)}
                  onWishlist={() => toggleWishlist(product.productId)}
                  onClick={() => router.push(`/homebase/${product.productId}`)}
                  getProductImage={getProductImage}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════ */}
      <section className="bg-red-600 text-white py-14">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">
                Limited Time
              </p>
              <h3
                className="text-2xl md:text-3xl font-black"
                style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}
              >
                Up to 60% Off
                <br />
                <span className="text-red-200">Presidents&apos; Day Sale</span>
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/homebase?filter=sale")}
                className="px-7 py-3.5 bg-white text-red-600 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg"
              >
                Shop the Sale
              </button>
              <button
                onClick={() => router.push("/homebase")}
                className="px-7 py-3.5 border-2 border-white/50 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:border-white hover:bg-white/10 transition-all"
              >
                All Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED COLLECTION
      ══════════════════════════════════════ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <SectionHeader
            eyebrow="Curated For You"
            title="Featured Collection"
            href="/homebase"
            linkLabel="Shop All"
          />
          {isLoading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <FeaturedCard
                  key={product.productId}
                  product={product}
                  isWishlisted={wishlist.includes(product.productId)}
                  justAdded={addedProductId === product.productId}
                  onAddToCart={() => handleAddToCart(product)}
                  onWishlist={() => toggleWishlist(product.productId)}
                  onClick={() => router.push(`/homebase/${product.productId}`)}
                  getProductImage={getProductImage}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader
            eyebrow="Just Dropped"
            title="New Arrivals"
            href="/homebase?filter=new"
            linkLabel="See All New"
          />
          {isLoading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <FeaturedCard
                  key={product.productId}
                  product={product}
                  isWishlisted={wishlist.includes(product.productId)}
                  justAdded={addedProductId === product.productId}
                  onAddToCart={() => handleAddToCart(product)}
                  onWishlist={() => toggleWishlist(product.productId)}
                  onClick={() => router.push(`/homebase/${product.productId}`)}
                  getProductImage={getProductImage}
                  badge="New"
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <button
              onClick={() => router.push("/homebase")}
              className="px-7 py-3.5 border-2 border-gray-900 text-gray-900 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════ */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">
            Stay In The Loop
          </p>
          <h3
            className="text-2xl md:text-3xl font-black mb-3"
            style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}
          >
            Join Our Exclusive Circle
          </h3>
          <p className="text-gray-400 mb-7 max-w-md mx-auto text-sm">
            Get early access to new releases, exclusive offers, and 15% off your first order.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3 rounded-full text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} product={addedProduct} />
    </main>
  );
}

// ══════════════════════════════════════════════════════════════
// BEST SELLER CARD  — tall portrait, Macy's style
// ══════════════════════════════════════════════════════════════
function BestSellerCard({
  product, rank, isWishlisted, justAdded,
  onAddToCart, onWishlist, onClick, getProductImage,
}: {
  product: Product;
  rank: number;
  isWishlisted: boolean;
  justAdded: boolean;
  onAddToCart: () => void;
  onWishlist: () => void;
  onClick: () => void;
  getProductImage: (p: Product) => string;
}) {
  const [imgError, setImgError] = useState(false);
  const price    = Number(product.price || 0);
  const msrp     = +(price * 1.45).toFixed(2);
  const discount = Math.round(((msrp - price) / msrp) * 100);

  return (
    <div className="group relative bg-white flex flex-col">

      {/* ── IMAGE  3:4 portrait ── */}
      <div
        className="relative overflow-hidden bg-gray-100 cursor-pointer"
        style={{ aspectRatio: "3/4" }}
        onClick={onClick}
      >
        {!imgError ? (
          <Image
            src={getProductImage(product)}
            alt={product.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs font-semibold">No Image</span>
          </div>
        )}

        {/* Rank badge */}
        <div className="absolute top-3 left-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
          #{rank}
        </div>

        {/* Sale badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-12 bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-sm shadow">
            Sale
          </div>
        )}

        {/* Hover: Add to Bag + Wishlist */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 shadow-lg transition-all duration-200 ${
              justAdded
                ? "bg-green-600 text-white"
                : "bg-white hover:bg-red-600 hover:text-white text-gray-900"
            }`}
          >
            {justAdded
              ? <><Check size={13} strokeWidth={3} /> Added!</>
              : <><ShoppingBag size={13} /> Add to Bag</>
            }
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onWishlist(); }}
            className="w-10 bg-white hover:bg-red-600 hover:text-white rounded-sm flex items-center justify-center shadow-lg transition-all duration-200"
            aria-label="Wishlist"
          >
            <Heart size={16} className={isWishlisted ? "fill-red-600 text-red-600" : ""} />
          </button>
        </div>
      </div>

      {/* ── TEXT below image ── */}
      <div className="pt-2.5 pb-1">
        {/* Category */}
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-600 mb-1">
          {product.category === "men" ? "For Him" : product.category === "women" ? "For Her" : "Signature"}
        </p>

        {/* Name — small like Macy's */}
        <h3
          onClick={onClick}
          className="text-[13px] leading-snug text-gray-800 font-normal line-clamp-2 cursor-pointer hover:text-red-600 transition-colors mb-1.5"
          style={{ fontFamily: FONT }}
        >
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill="#E21A23" className="text-red-600" />
          ))}
          <span className="text-[11px] text-gray-500 ml-1">(4.9)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[15px] font-bold text-gray-900" style={{ fontFamily: FONT }}>
            ${price.toFixed(2)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[13px] text-gray-400 line-through">${msrp.toFixed(2)}</span>
              <span className="text-[11px] font-black text-red-600">({discount}% off)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FEATURED CARD  — compact Macy's tile
// ══════════════════════════════════════════════════════════════
function FeaturedCard({
  product, isWishlisted, justAdded,
  onAddToCart, onWishlist, onClick, getProductImage, badge,
}: {
  product: Product;
  isWishlisted: boolean;
  justAdded: boolean;
  onAddToCart: () => void;
  onWishlist: () => void;
  onClick: () => void;
  getProductImage: (p: Product) => string;
  badge?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const price    = Number(product.price || 0);
  const msrp     = +(price * 1.45).toFixed(2);
  const discount = Math.round(((msrp - price) / msrp) * 100);

  return (
    <div className="group relative bg-white flex flex-col">

      {/* ── IMAGE  3:4 portrait ── */}
      <div
        className="relative overflow-hidden bg-gray-100 cursor-pointer"
        style={{ aspectRatio: "3/4" }}
        onClick={onClick}
      >
        {!imgError ? (
          <Image
            src={getProductImage(product)}
            alt={product.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}

        {/* Badge */}
        {(badge || discount > 0) && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest shadow">
            {badge ?? "Sale"}
          </div>
        )}

        {/* Hover: Add to Bag + Wishlist */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-1 shadow-lg transition-all duration-200 ${
              justAdded
                ? "bg-green-600 text-white"
                : "bg-white hover:bg-red-600 hover:text-white text-gray-900"
            }`}
          >
            {justAdded
              ? <><Check size={12} strokeWidth={3} /> Added!</>
              : <><ShoppingBag size={12} /> Add to Bag</>
            }
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onWishlist(); }}
            className="w-9 bg-white hover:bg-red-600 hover:text-white rounded-sm flex items-center justify-center shadow-lg transition-all duration-200"
            aria-label="Wishlist"
          >
            <Heart size={15} className={isWishlisted ? "fill-red-600 text-red-600" : ""} />
          </button>
        </div>
      </div>

      {/* ── TEXT below image ── */}
      <div className="pt-2.5 pb-1">
        {/* Category */}
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1">
          {product.category === "men" ? "For Him" : product.category === "women" ? "For Her" : "Signature"}
        </p>

        {/* Name — small, 2 lines */}
        <h3
          onClick={onClick}
          className="text-[13px] leading-snug text-gray-800 font-normal line-clamp-2 cursor-pointer hover:text-red-600 transition-colors mb-1.5"
          style={{ fontFamily: FONT }}
        >
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill="#E21A23" className="text-red-600" />
          ))}
          <span className="text-[11px] text-gray-500 ml-1">(4.8)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[15px] font-bold text-gray-900" style={{ fontFamily: FONT }}>
            ${price.toFixed(2)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[13px] text-gray-400 line-through">${msrp.toFixed(2)}</span>
              <span className="text-[11px] font-black text-red-600">({discount}% off)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className={`grid gap-4 ${count === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200" style={{ aspectRatio: "3/4" }} />
          <div className="pt-2.5 space-y-2">
            <div className="h-2.5 bg-gray-200 rounded-full w-1/4" />
            <div className="h-3 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
