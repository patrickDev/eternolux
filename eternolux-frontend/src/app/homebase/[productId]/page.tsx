// src/app/homebase/[productId]/page.tsx

"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, ShoppingBag, Heart, Share2, Star,
  ShieldCheck, Truck, RotateCcw, Check, Plus,
  Minus, ChevronLeft, ChevronRight, Sparkles,
  Award, Clock, PackageCheck, X,
} from "lucide-react";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/app/types/product.types";
import CartModal from "@/app/checkout/cartModal";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
type Tab = "description" | "reviews" | "shipping";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { productId } = use(params);
  const decodedId = decodeURIComponent(productId || "").trim();

  const { data: product, isLoading, isError } = useGetProductByIdQuery(decodedId, { skip: !decodedId });
  const { data: products = [] } = useGetProductsQuery(undefined);

  const [quantity, setQuantity]         = useState(1);
  const [imageIndex, setImageIndex]     = useState(0);
  const [imgError, setImgError]         = useState(false);
  const [wishlisted, setWishlisted]     = useState(false);
  const [tab, setTab]                   = useState<Tab>("description");
  const [cartOpen, setCartOpen]         = useState(false);
  const [justAdded, setJustAdded]       = useState(false);

  const related = useMemo(
    () => products.filter((p) => p.productId !== decodedId && p.category === product?.category).slice(0, 4),
    [products, decodedId, product]
  );

  const more = useMemo(
    () => products.filter((p) => p.productId !== decodedId).slice(0, 4),
    [products, decodedId]
  );

  useEffect(() => {
    setImgError(false); setImageIndex(0); setTab("description"); setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [decodedId]);

  const getAllImages = (p?: Product): string[] => {
    if (!p) return ["/placeholder-product.jpg"];
    const imgs: string[] = [];
    if (p.imageUrl) imgs.push(p.imageUrl);
    if (p.images?.length) imgs.push(...p.images);
    return imgs.length ? imgs : ["/placeholder-product.jpg"];
  };

  const getImg = (p?: Product) => getAllImages(p)[0];

  const handleAddToCart = () => {
    if (!product || !inStock) return;
    addToCart({ ...product, quantity } as any);
    setJustAdded(true);
    setCartOpen(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Loading</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────
  if (isError || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-5">😕</div>
        <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: FONT }}>
          Product Not Found
        </h2>
        <p className="text-gray-500 mb-8">This fragrance may have been discontinued or removed.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-200 hover:border-gray-900 text-gray-700 rounded-full font-bold text-sm uppercase tracking-widest transition-all">
            Go Back
          </button>
          <button onClick={() => router.push("/homebase")} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all">
            Shop All
          </button>
        </div>
      </div>
    </div>
  );

  const inStock  = (product.stock ?? 0) > 0;
  const price    = Number(product.price || 0);
  const msrp     = +(price * 1.45).toFixed(2);
  const discount = Math.round(((msrp - price) / msrp) * 100);
  const savings  = msrp - price;
  const allImgs  = getAllImages(product);

  const deliveryDate = () => {
    const d = new Date(); d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Success Toast */}
      {justAdded && (
        <div className="fixed top-24 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm animate-slideInToast">
          <Check size={18} /> Added to cart!
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6 py-3.5 flex items-center gap-2 text-sm flex-wrap">
          <button onClick={() => router.push("/")} className="text-gray-500 hover:text-red-600 transition-colors">Home</button>
          <span className="text-gray-300">/</span>
          <button onClick={() => router.push("/homebase")} className="text-gray-500 hover:text-red-600 transition-colors">Shop</button>
          <span className="text-gray-300">/</span>
          {product.category && (
            <>
              <button onClick={() => router.push(`/homebase?category=${product.category}`)} className="text-gray-500 hover:text-red-600 capitalize transition-colors">
                {product.category}
              </button>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="font-semibold text-gray-900 truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-7xl">

        {/* ── PRODUCT SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative bg-gray-50 rounded-3xl overflow-hidden group sticky top-24">
              <div className="aspect-square relative">
                {!imgError ? (
                  <Image
                    src={allImgs[imageIndex]}
                    alt={product.name}
                    fill
                    className="object-contain p-10 group-hover:scale-105 transition-transform duration-700"
                    onError={() => setImgError(true)}
                    priority={imageIndex === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-300 font-bold">No Image</span>
                  </div>
                )}

                {/* Nav arrows */}
                {allImgs.length > 1 && !imgError && (
                  <>
                    <button onClick={() => setImageIndex((p) => (p - 1 + allImgs.length) % allImgs.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setImageIndex((p) => (p + 1) % allImgs.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="absolute top-5 left-5 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                    {discount}% OFF
                  </div>
                )}

                {/* Wishlist + Share */}
                <div className="absolute top-5 right-5 flex gap-2">
                  <button onClick={() => setWishlisted(!wishlisted)}
                    className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-all">
                    <Heart size={18} className={wishlisted ? "text-red-600 fill-red-600" : "text-gray-500"} />
                  </button>
                  <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                    className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all">
                    <Share2 size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {allImgs.map((img, i) => (
                  <button key={i} onClick={() => setImageIndex(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      imageIndex === i ? "border-red-600 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-400"
                    }`}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} width={80} height={80}
                      className="object-contain w-full h-full p-1.5 bg-gray-50"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full">
              <Sparkles size={14} className="text-red-600" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-red-700">
                {product.category === "men" ? "For Him" : product.category === "women" ? "For Her" : "Premium Fragrance"}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1
                className="text-4xl md:text-5xl font-black text-gray-900 leading-none mb-4"
                style={{ fontFamily: FONT, letterSpacing: "-0.03em" }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#E21A23" className="text-red-600" />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">4.9</span>
                <span className="text-sm text-gray-400">(248 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="py-5 border-y border-gray-100">
              <div className="flex items-baseline gap-3 flex-wrap mb-1">
                <span className="text-5xl font-black text-gray-900" style={{ fontFamily: FONT }}>
                  ${price.toFixed(2)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-2xl text-gray-400 line-through font-bold">${msrp.toFixed(2)}</span>
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-black rounded-full">
                      SAVE {discount}%
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm font-bold text-green-600">You save ${savings.toFixed(2)}</p>
              )}
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${inStock ? "bg-green-50" : "bg-red-50"}`}>
              {inStock
                ? <><PackageCheck size={20} className="text-green-600" /><span className="font-bold text-green-700">In Stock</span>
                    {product.stock < 10 && <span className="text-sm text-red-600 font-bold ml-1">— Only {product.stock} left!</span>}</>
                : <><X size={20} className="text-red-600" /><span className="font-bold text-red-700">Out of Stock</span></>
              }
            </div>

            {/* Delivery */}
            <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={18} className="text-red-600 flex-shrink-0" />
                <span><strong>Free Shipping</strong> on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={18} className="text-red-600 flex-shrink-0" />
                <span>Estimated delivery by <strong>{deliveryDate()}</strong></span>
              </div>
            </div>

            {/* Qty + Cart */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-600">Quantity</label>
              <div className="flex gap-4 items-center">
                {/* Counter */}
                <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-14 text-center font-black text-lg">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(q + 1, product.stock))}
                    disabled={!inStock || quantity >= product.stock}
                    className="px-4 py-3 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                {inStock && <span className="text-sm text-gray-500">{product.stock} available</span>}
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} disabled={!inStock}
                className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                  justAdded
                    ? "bg-green-600 text-white shadow-green-200"
                    : inStock
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200 hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}>
                {justAdded ? <><Check size={20} /> Added to Cart!</> : <><ShoppingBag size={20} /> {inStock ? "Add to Cart" : "Out of Stock"}</>}
              </button>

              {/* View Cart */}
              {justAdded && (
                <button onClick={() => router.push("/checkout")}
                  className="w-full py-4 border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 rounded-full font-black text-sm uppercase tracking-widest transition-all">
                  View Cart & Checkout
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Authentic" },
                { icon: Award, label: "Premium" },
                { icon: RotateCcw, label: "30-Day Returns" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="text-center p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                  <Icon size={22} className="mx-auto mb-1.5 text-red-600" strokeWidth={1.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mb-20">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {([
                { id: "description", label: "Description" },
                { id: "reviews", label: "Reviews (248)" },
                { id: "shipping", label: "Shipping & Returns" },
              ] as { id: Tab; label: string }[]).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`pb-4 font-black uppercase text-sm tracking-widest whitespace-nowrap border-b-2 transition-all ${
                    tab === t.id ? "border-red-600 text-red-600" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl">
            {tab === "description" && (
              <div className="space-y-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description || "A masterfully crafted signature scent that defines presence and elegance."}
                </p>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
                  <h4 className="font-black text-xl mb-6 flex items-center gap-2" style={{ fontFamily: FONT }}>
                    <Sparkles size={20} className="text-red-600" /> Scent Profile
                  </h4>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: "Top Notes", notes: "Citrus, Bergamot" },
                      { label: "Heart Notes", notes: "Jasmine, Rose" },
                      { label: "Base Notes", notes: "Amber, Musk" },
                    ].map((n) => (
                      <div key={n.label} className="bg-white/60 rounded-2xl p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 mb-2">{n.label}</div>
                        <p className="text-sm font-medium text-gray-700">{n.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  {[
                    ["Category", product.category ? (product.category === "men" ? "For Him" : "For Her") : "Signature"],
                    ["Concentration", "Eau de Parfum"],
                    ["Size", "50ml / 1.7oz"],
                    ["Longevity", "8–12 hours"],
                  ].map(([k, v], i) => (
                    <div key={k} className={`flex justify-between py-4 px-6 text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <dt className="font-bold text-gray-700">{k}</dt>
                      <dd className="text-gray-600 capitalize">{v}</dd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-8">
                <div className="text-center pb-8 border-b border-gray-100">
                  <div className="text-6xl font-black mb-3" style={{ fontFamily: FONT }}>4.9</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#E21A23" className="text-red-600" />)}
                  </div>
                  <p className="text-gray-500 text-sm">Based on 248 verified reviews</p>
                </div>
                {[
                  { name: "Sarah M.", date: "2 weeks ago", rating: 5, title: "Absolutely stunning!", comment: "This is my new signature scent. Lasts all day and I get so many compliments. Worth every penny!" },
                  { name: "James T.", date: "1 month ago", rating: 5, title: "Perfect for any occasion", comment: "Sophisticated, bold, and uniquely captivating. I've tried dozens of fragrances and this is by far the best." },
                  { name: "Emily R.", date: "2 months ago", rating: 4, title: "Great quality fragrance", comment: "Beautiful scent that evolves throughout the day. Wish it came in a larger bottle!" },
                ].map((r, i) => (
                  <div key={i} className="pb-8 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-gray-900">{r.name}</span>
                          <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={10} /> Verified
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <div className="flex">
                        {[...Array(r.rating)].map((_, j) => <Star key={j} size={16} fill="#E21A23" className="text-red-600" />)}
                      </div>
                    </div>
                    <h4 className="font-bold mb-1">{r.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "shipping" && (
              <div className="space-y-6">
                {[
                  { title: "Standard Shipping", sub: "3–5 business days", price: "FREE on orders over $50" },
                  { title: "Express Shipping", sub: "1–2 business days", price: "$15.00" },
                  { title: "Next Day Delivery", sub: "Next business day", price: "$25.00" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl">
                    <Truck size={22} className="text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{s.title}</p>
                      <p className="text-sm text-gray-500">{s.sub}</p>
                    </div>
                    <span className={`font-black text-sm ${s.price.includes("FREE") ? "text-green-600" : "text-gray-900"}`}>
                      {s.price}
                    </span>
                  </div>
                ))}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <h4 className="font-black text-lg mb-3 flex items-center gap-2">
                    <RotateCcw size={20} className="text-green-600" /> 30-Day Return Policy
                  </h4>
                  {["Free returns on all orders", "Items must be unopened in original packaging", "Refund processed within 5–7 business days"].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      <Check size={16} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <RelatedSection
            title="Similar Products"
            subtitle="Same category"
            products={related}
            router={router}
            getImg={getImg}
          />
        )}

        {/* ── MORE ── */}
        <RelatedSection
          title="You May Also Like"
          subtitle="Explore more"
          products={more}
          router={router}
          getImg={getImg}
        />
      </div>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} product={product} />

      <style jsx global>{`
        @keyframes slideInToast {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slideInToast { animation: slideInToast 0.4s cubic-bezier(0.16,1,0.3,1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}

// ── Related Section ───────────────────────────────────────────
function RelatedSection({ title, subtitle, products, router, getImg }: {
  title: string; subtitle: string;
  products: Product[]; router: any;
  getImg: (p: Product) => string;
}) {
  return (
    <div className="mb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600 mb-1">{subtitle}</p>
          <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            {title}
          </h2>
        </div>
        <button onClick={() => router.push("/homebase")}
          className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-red-600 border-b-2 border-gray-900 hover:border-red-600 pb-1 transition-all">
          View All <ArrowLeft size={14} className="rotate-180" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const pr = Number(p.price || 0);
          const ms = +(pr * 1.45).toFixed(2);
          const dc = Math.round(((ms - pr) / ms) * 100);
          return (
            <button key={p.productId} onClick={() => router.push(`/homebase/${p.productId}`)}
              className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-red-300 hover:shadow-xl transition-all duration-300 text-left">
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Image src={getImg(p)} alt={p.name} fill
                  className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                />
                {dc > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    -{dc}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                  {p.category === "men" ? "For Him" : p.category === "women" ? "For Her" : "Signature"}
                </div>
                <h3 className="font-black text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors" style={{ fontFamily: FONT }}>
                  {p.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-gray-900">${pr.toFixed(2)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#E21A23" className="text-red-600" />)}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}