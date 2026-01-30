"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import { useGetProductsQuery } from "@/app/api/api";

import heroImg from "@/state/images/product1.png"; 

export default function HomePage() {
  const { data: products = [], isLoading, isError } = useGetProductsQuery();

  const bestsellers = useMemo(() => {
    return [...products].slice(0, 8);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-black">
      {/* NOTE: The Trust Bar is now inside the Navbar component's header 
         to prevent overlapping. If you still have it here, make sure 
         the Navbar is adjusted accordingly.
      */}
      <Navbar />

      {/* HERO SECTION - Increased pt-40 to account for the new double-header height */}
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-red-600 font-bold text-sm tracking-tighter uppercase">
                Authentic Designer Scents
              </span>
              <h1 className="mt-4 text-5xl md:text-7xl font-black leading-[0.85] tracking-tighter italic uppercase">
                Eterno<br />
                <span className="text-gray-400">Lux</span>
              </h1>
              <p className="mt-6 text-lg text-gray-700 leading-relaxed max-w-md">
                Experience the world's finest fragrances. From timeless classics to modern masterpieces, find your signature scent at EternoLux.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/shop" className="bg-black text-white px-10 py-4 rounded-full font-black uppercase text-sm hover:bg-red-600 transition shadow-2xl tracking-widest">
                  Shop the Collection
                </Link>
              </div>
            </div>

            {/* Visual Hero */}
            <div className="relative order-1 lg:order-2">
              <div className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white bg-white">
                <Image src={heroImg} alt="EternoLux Signature Fragrance" className="w-full h-auto" priority />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-black text-white p-6 rounded-2xl shadow-xl hidden md:block">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Limited Edition</div>
                <div className="text-xl font-black italic">Eterno Signature</div>
                <div className="text-red-500 font-bold mt-1">$84.50 <span className="text-gray-500 line-through text-sm ml-2">$120.00</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST GRID */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: "Guaranteed", desc: "100% Genuine Perfume" },
             { label: "Best Price", desc: "Unmatched Value" },
             { label: "Fast Shipping", desc: "Tracked US Delivery" },
             { label: "Returns", desc: "30-Day Policy" }
           ].map(item => (
             <div key={item.label} className="text-center">
               <div className="text-xs font-black uppercase tracking-[0.2em]">{item.label}</div>
               <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{item.desc}</div>
             </div>
           ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
               <h2 className="text-4xl font-black tracking-tighter uppercase italic">Bestsellers</h2>
               <p className="text-gray-500 text-sm font-medium">Most loved by the EternoLux community.</p>
            </div>
            <Link href="/shop" className="text-xs font-black uppercase border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition">
              View All Products
            </Link>
          </div>
          
          {isLoading ? (
            <div className="py-20 text-center font-bold text-gray-400 animate-pulse">Curating your selection...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {bestsellers.map((p) => {
                const msrp = Number(p.price) * 1.45;
                return (
                  <Link key={p.productId} href={`/homebase/${p.productId}`} className="group">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white mb-6 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                      <Image 
                        src={heroImg} 
                        alt={p.name} 
                        fill 
                        className="object-contain p-8 group-hover:scale-110 transition duration-700" 
                      />
                      <div className="absolute bottom-4 left-4">
                         <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                           TOP RATED
                         </span>
                      </div>
                    </div>
                    <div className="px-1 text-center">
                      <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">In Stock</div>
                      <div className="font-black text-lg truncate uppercase tracking-tighter">{p.name}</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="font-black text-xl">${Number(p.price).toFixed(2)}</span>
                        <span className="text-gray-400 line-through text-xs font-bold">${msrp.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-7xl bg-black rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
             {/* Optional decorative background pattern */}
          </div>
          <h3 className="text-4xl md:text-6xl font-black uppercase italic leading-none mb-6">
            Join the <br /> EternoLux <span className="text-gray-500">Circle</span>
          </h3>
          <p className="text-gray-400 max-w-lg mx-auto mb-10 font-medium">
            Unlock exclusive access to vaulted fragrances and member-only pricing.
          </p>
          <Link href="/register" className="inline-block bg-white text-black px-12 py-4 rounded-full font-black uppercase text-sm hover:bg-red-600 hover:text-white transition tracking-widest">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}