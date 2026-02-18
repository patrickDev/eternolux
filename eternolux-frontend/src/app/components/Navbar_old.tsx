// src/app/components/Navbar.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, User, Heart, Menu, Search, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartTotalCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wishlistCount } = useWishlist();
  

  const deals = [
    { text: "Up to 60% off", highlight: "Presidents' Day deals" },
    { text: "Up to 70% off", highlight: "fragrance sale" },
    { text: "30-50% off", highlight: "luxury scents" },
    { text: "20-50% off", highlight: "gift sets" },
  ];

  const mainNav = [
    { name: "Women", href: "/homebase?category=women" },
    { name: "Men", href: "/homebase?category=men" },
    { name: "New Arrivals", href: "/homebase?filter=new" },
    { name: "Best Sellers", href: "/homebase?sort=popular" },
    { name: "Gift Sets", href: "/homebase?type=sets" },
    { name: "Luxury", href: "/homebase?filter=luxury" },
    { name: "Sale", href: "/homebase?filter=sale", special: true },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* ── TOP DEALS BANNER ── RED ── */}
      <div className="bg-red-600 text-white text-xs py-2.5 overflow-x-hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-4 whitespace-nowrap overflow-x-auto scrollbar-hide">
            <span className="font-bold tracking-widest uppercase">
              Today&apos;s Deals
            </span>
            {deals.map((deal, idx) => (
              <React.Fragment key={idx}>
                <span className="text-red-200">|</span>
                <span>
                  <span className="font-bold">{deal.text}</span>{" "}
                  <span className="text-red-100">{deal.highlight}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── WHITE ── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6">

          {/* Logo + Search + Icons Row */}
          <div className="flex items-center justify-between py-4 gap-6">

            {/* ── LOGO ── */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center gap-2.5">
                {/* Star */}
                <div className="w-9 h-9 bg-red-600 group-hover:bg-black rounded-full flex items-center justify-center transition-all duration-300 shadow-md">
                  <span className="text-white text-lg font-bold leading-none">★</span>
                </div>

                {/* Brand Name */}
                <div
                  className="text-2xl leading-none"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                  }}
                >
                       <span className="text-black group-hover:text-red-600 transition-colors duration-300">
                 
                    Eterno
                  </span>
                   <span className="text-red-600 group-hover:text-black transition-colors duration-300">
                    LUX
                  </span>
                </div>
              </div>
            </Link>

            {/* ── SEARCH BAR ── */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <SearchBar />
              </div>
            </div>

            {/* ── RIGHT ICONS ── */}
            <div className="flex items-center gap-5">

              {/* Profile */}
              <button
                onClick={() => router.push("/profile")}
                className="hidden md:flex flex-col items-center gap-0.5 text-gray-700 hover:text-red-600 transition-colors group"
              >
                <User size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-semibold tracking-wide">Account</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => router.push("/wishlist")}>
                 <div className="relative">
                     <Heart size={22} />
                      {wishlistCount > 0 && (
                       <span className="badge">{wishlistCount > 9 ? "9+" : wishlistCount}</span>
                    )}
                 </div>
              </button>

              {/* Cart */}
              <button
                onClick={() => router.push("/checkout")}
                className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-red-600 transition-colors"
              >
                <div className="relative">
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {cartTotalCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                      {cartTotalCount > 9 ? "9+" : cartTotalCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">Bag</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* ── NAV LINKS BAR ── */}
        <div className="border-t border-gray-100">
          <div className="container mx-auto px-6">
            <nav className="hidden md:flex items-center gap-7 py-2.5 overflow-x-auto scrollbar-hide">

              {/* Shop All */}
              <button
                onClick={() => router.push("/homebase")}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-red-600 transition-colors whitespace-nowrap"
              >
                <Menu size={16} strokeWidth={2} />
                Shop All
              </button>

              {/* Divider */}
              <span className="text-gray-300 text-lg">|</span>

              {/* Nav Links */}
              {mainNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap ${
                    item.special
                      ? "text-red-600 font-bold hover:text-red-700"
                      : isActive(item.href)
                      ? "text-red-600"
                      : "text-gray-800 hover:text-red-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1 shadow-lg">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
                <SearchBar />
            </div>

            {/* Shop All */}
            <Link
              href="/homebase"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2.5 text-sm font-bold text-gray-900 hover:text-red-600 transition-colors"
            >
              <Menu size={16} />
              Shop All
            </Link>

            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 text-sm font-semibold transition-colors border-b border-gray-50 ${
                  item.special ? "text-red-600" : "text-gray-800 hover:text-red-600"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Bottom Links */}
            <div className="flex gap-6 pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={() => { setMobileMenuOpen(false); router.push("/profile"); }}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
              >
                <User size={18} /> Account
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); router.push("/wishlist"); }}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
              >
                <Heart size={18} /> Wishlist
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}