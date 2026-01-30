"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-white text-black border-t border-gray-100 pt-16 pb-8">
      {/* Trust Row */}
      <div className="container mx-auto px-4 mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-b border-gray-50 pb-12">
        <div className="flex flex-col items-center">
          <ShieldCheck size={32} className="mb-2 text-gray-400" />
          <h5 className="font-black uppercase text-xs tracking-widest">100% Authentic</h5>
          <p className="text-[10px] text-gray-500 mt-1">Direct from EternoLux Partners</p>
        </div>
        <div className="flex flex-col items-center">
          <Truck size={32} className="mb-2 text-gray-400" />
          <h5 className="font-black uppercase text-xs tracking-widest">Free US Shipping</h5>
          <p className="text-[10px] text-gray-500 mt-1">Fast & Tracked Delivery</p>
        </div>
        <div className="flex flex-col items-center">
          <RotateCcw size={32} className="mb-2 text-gray-400" />
          <h5 className="font-black uppercase text-xs tracking-widest">Easy Returns</h5>
          <p className="text-[10px] text-gray-500 mt-1">30-Day Money Back Guarantee</p>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="md:col-span-1">
          <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4">
            Eterno<span className="text-gray-400">Lux</span>
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            The premium destination for signature scents. EternoLux brings you genuine designer fragrances at exceptional prices.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Customer Care</h4>
          <ul className="space-y-3 text-xs font-bold text-gray-600">
            <li><Link href="/shop" className="hover:text-black transition">Shop All</Link></li>
            <li><Link href="/contact" className="hover:text-black transition">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-black transition">Shipping & Returns</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">The EternoLux Insider</h4>
          <p className="text-xs text-gray-500 mb-4">
            Subscribe for exclusive drops and VIP-only fragrance deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-4 py-3 text-xs border-2 border-gray-100 rounded-full focus:border-black transition outline-none"
              required
            />
            <button
              type="submit"
              className="bg-black text-white text-xs font-black uppercase px-8 py-3 rounded-full hover:bg-red-600 transition"
            >
              Join
            </button>
          </form>
          
          <div className="flex space-x-6 mt-8">
            <a href="#" className="text-gray-400 hover:text-black transition"><Facebook size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-black transition"><Instagram size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-black transition"><Twitter size={20} /></a>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-gray-50 pt-8 text-center px-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} EternoLux By DADEM Co. LLC • All rights reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;