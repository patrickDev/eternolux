"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, User, ShoppingCart, Menu, X, ShieldCheck, Truck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import debounce from "lodash/debounce";

import { useCart } from "@/app/context/cartContext";
import CartModal from "@/app/checkout/cartModal";
import { useLazyGetProductsQuery, type Product } from "@/app/api/api";
import { useUser } from "@/app/context/userContext";

function normalizeQuery(q: string) {
  return q.replace(/\s+/g, " ").trim();
}

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { cartTotalCount } = useCart();
  const { user, logout } = useUser();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [trigger] = useLazyGetProductsQuery();

  // Close UI elements on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown") && !target.closest(".user-button")) setIsDropdownOpen(false);
      if (!target.closest(".search-wrap")) setShowSearchResults(false);
      if (!target.closest(".mobile-menu") && !target.closest(".hamburger-btn")) setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowSearchResults(false);
    setFilteredProducts([]);
  }, [pathname]);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      const q = normalizeQuery(query);
      if (!q) { setFilteredProducts([]); return; }
      try {
        const result = await trigger(q).unwrap();
        setFilteredProducts(result ?? []);
      } catch (err) {
        setFilteredProducts([]);
      }
    }, 250),
    [trigger]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const goToSearchPage = (qRaw?: string) => {
    const q = normalizeQuery(qRaw ?? searchTerm);
    if (!q) return;
    router.push(`/shop?search=${encodeURIComponent(q)}`);
    setShowSearchResults(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const q = normalizeQuery(value);
    setShowSearchResults(!!q);
    debouncedSearch(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goToSearchPage();
    if (e.key === "Escape") setShowSearchResults(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Trust Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="mx-auto max-w-7xl flex justify-center md:justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <div className="hidden md:flex items-center gap-4">
             <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-gray-400"/> 100% Authentic</span>
             <span className="flex items-center gap-1"><Truck size={14} className="text-gray-400"/> Free US Shipping</span>
          </div>
          <p>Flash Sale: Up to 75% Off Retail Prices</p>
          <div className="hidden md:flex items-center gap-4 italic text-gray-400">
             Rated A+ by BBB
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* LOGO: Updated to EternoLux */}
          <div className="flex items-center min-w-[120px] lg:min-w-[180px]">
            <Link
              href="/"
              className="group cursor-pointer"
            >
              <span className="text-2xl font-black tracking-tighter italic uppercase group-hover:text-red-600 transition">
                Eterno<span className="text-gray-400 group-hover:text-black">Lux</span>
              </span>
            </Link>
          </div>

          {/* CENTER: Search Bar */}
          <div className="flex-1 hidden md:flex justify-center">
            <div className="search-wrap relative w-full max-w-xl">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition" />
                <input
                  type="text"
                  placeholder="Search 20,000+ Genuine Fragrances..."
                  className="w-full rounded-full border-2 border-gray-100 bg-gray-50 px-12 py-3 text-sm font-medium focus:bg-white focus:border-black transition-all outline-none"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
                <button 
                  onClick={() => goToSearchPage()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase hover:bg-red-600 transition"
                >
                  Find
                </button>
              </div>

              {/* Live Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 w-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl z-50">
                   {filteredProducts.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {filteredProducts.slice(0, 5).map((p) => (
                        <button
                          key={p.productId}
                          onClick={() => { setSearchTerm(p.name); goToSearchPage(p.name); }}
                          className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center gap-4 border-b border-gray-50"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-900">{p.name}</div>
                            <div className="text-[10px] text-red-600 font-bold uppercase">Now: ${p.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                   ) : (
                    <div className="p-5 text-sm text-gray-500 italic">No perfumes found for "{searchTerm}"</div>
                   )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Menu Links and Actions */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-[120px] lg:min-w-[180px] justify-end">
            <nav className="hidden xl:flex items-center gap-6 mr-4">
              <Link href="/shop" className="text-xs font-black uppercase tracking-widest hover:text-red-600 transition">Shop</Link>
              <Link href="/contact" className="text-xs font-black uppercase tracking-widest hover:text-red-600 transition">Contact</Link>
            </nav>

            {/* Mobile Search Trigger */}
            <button className="md:hidden p-2 text-gray-900"><Search size={22}/></button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:scale-110 transition"
            >
              <ShoppingCart size={22} className="text-gray-900" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg">
                  {cartTotalCount}
                </span>
              )}
            </button>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* User Dropdown */}
            <div className="relative user-dropdown hidden sm:block">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 hover:scale-110 transition user-button">
                <User size={22} className="text-gray-900" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                  {user ? (
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-black uppercase text-gray-400">Logged in as</p>
                      <p className="text-sm font-bold truncate">{user.email}</p>
                      <button onClick={logout} className="mt-3 text-xs font-bold text-red-600 uppercase hover:underline">Logout</button>
                    </div>
                  ) : (
                    <div className="p-2 flex flex-col">
                      <Link href="/signin" className="p-3 text-sm font-bold hover:bg-gray-50 rounded-lg">Sign In</Link>
                      <Link href="/register" className="p-3 text-sm font-bold bg-black text-white rounded-lg text-center mt-1">Register</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger Button for Mobile */}
            <button 
                className="hamburger-btn lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="mobile-menu lg:hidden border-t border-gray-200 bg-white py-6 px-4">
            <nav className="flex flex-col gap-4">
              <Link href="/shop" className="text-lg font-black uppercase italic" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              <Link href="/contact" className="text-lg font-black uppercase italic" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
              <div className="h-px bg-gray-100 my-2" />
              {!user && (
                <div className="flex flex-col gap-2">
                  <Link href="/signin" className="p-4 border border-gray-200 rounded-xl text-center font-bold" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  <Link href="/register" className="p-4 bg-black text-white rounded-xl text-center font-bold" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;