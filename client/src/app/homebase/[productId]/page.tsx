"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Truck, RotateCcw, Star, ArrowLeft } from "lucide-react";

import { useCart } from "@/app/context/cartContext";
import { useGetProductByIdQuery, useGetProductsQuery, type Product } from "@/app/api/api";

import CartModal from "@/app/checkout/cartModal";
import image2 from "@/state/images/product1.png";

type CartItem = Product & { quantity: number };

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const resolvedParams = use(params);
  const productId = decodeURIComponent(resolvedParams.productId || "").trim();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId, { skip: !productId });
  const { data: products = [] } = useGetProductsQuery(undefined);

  const moreItems = useMemo(
    () => products.filter((p) => p.productId !== productId).slice(0, 10),
    [products, productId]
  );

  useEffect(() => {
    if (product?.stock && product.stock > 0) {
      setQuantity((q) => Math.min(q, product.stock));
    } else {
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black uppercase italic tracking-widest">Loading Scent...</div>;

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <h2 className="text-4xl font-black uppercase italic italic tracking-tighter">Product Lost</h2>
        <button onClick={() => router.push("/")} className="mt-8 bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs">Back to EternoLux</button>
      </div>
    );
  }

  const inStock = (product.stock ?? 0) > 0;
  const price = Number(product.price || 0);
  const msrp = price * 1.45; // Price Anchoring

  const incrementQuantity = () => inStock && setQuantity((prev) => Math.min(prev + 1, product.stock));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({ ...product, quantity } as unknown as Product);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-40 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-10 hover:text-red-600 transition"
        >
          <ArrowLeft size={14} /> Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7">
            <div className="sticky top-40 bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 overflow-hidden group">
               <Image
                src={image2}
                alt={product.name}
                width={1000}
                height={1000}
                className="w-full h-auto object-contain group-hover:scale-105 transition duration-700"
                priority
              />
              <div className="absolute top-8 left-8 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                Save {Math.round(((msrp - price) / msrp) * 100)}%
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-gray-400">Designer Fragrance</div>
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
               <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
               </div>
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Verified 4.9/5 Rating</span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-black tracking-tighter">${price.toFixed(2)}</span>
              <span className="text-xl text-gray-300 line-through font-bold">${msrp.toFixed(2)}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-10 font-medium">
              {product.description || "A masterfully crafted signature scent that defines presence and elegance. Experience the long-lasting projection of premium oils."}
            </p>

            {/* Scent Pyramid Feature */}
            <div className="grid grid-cols-3 gap-4 mb-10 py-6 border-y border-gray-200">
               <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Top Notes</div>
                  <div className="text-xs font-bold">Citrus, Bergamot</div>
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Heart Notes</div>
                  <div className="text-xs font-bold">Jasmine, Rose</div>
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Base Notes</div>
                  <div className="text-xs font-bold">Amber, Musk</div>
               </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-full border-2 border-gray-200 bg-white overflow-hidden h-14">
                  <button onClick={decrementQuantity} className="px-6 hover:bg-gray-50 transition font-black text-xl">–</button>
                  <span className="w-12 text-center font-black">{quantity}</span>
                  <button onClick={incrementQuantity} className="px-6 hover:bg-gray-50 transition font-black text-xl">+</button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 h-14 bg-black text-white rounded-full font-black uppercase tracking-widest hover:bg-red-600 transition shadow-xl disabled:opacity-50"
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4">
                 <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-gray-100">
                    <ShieldCheck size={20} className="mb-1 text-gray-400" />
                    <span className="text-[8px] font-black uppercase">Authentic</span>
                 </div>
                 <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-gray-100">
                    <Truck size={20} className="mb-1 text-gray-400" />
                    <span className="text-[8px] font-black uppercase">Free Ship</span>
                 </div>
                 <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-gray-100">
                    <RotateCcw size={20} className="mb-1 text-gray-400" />
                    <span className="text-[8px] font-black uppercase">Returns</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Items Section */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter">You May Also Like</h2>
             <button onClick={() => router.push("/shop")} className="text-xs font-black uppercase border-b-2 border-black pb-1">Shop All</button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
            {moreItems.map((p) => (
              <button
                key={p.productId}
                onClick={() => router.push(`/homebase/${p.productId}`)}
                className="min-w-[280px] bg-white rounded-[2rem] p-6 text-left border border-gray-50 hover:shadow-xl transition duration-500 group"
              >
                <div className="aspect-square relative mb-6 overflow-hidden rounded-2xl bg-[#F9F8F6] p-4">
                   <Image src={image2} alt={p.name} fill className="object-contain p-4 group-hover:scale-110 transition duration-500" />
                </div>
                <div className="text-[10px] font-black uppercase text-red-600 mb-1">New Arrival</div>
                <div className="font-black text-lg uppercase truncate tracking-tighter">{p.name}</div>
                <div className="font-bold text-gray-400 mt-1">${Number(p.price).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}