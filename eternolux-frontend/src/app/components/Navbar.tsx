// src/app/components/Navbar.tsx - CLICK DROPDOWN FIXED
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Heart, ShoppingBag, X, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGetProductsQuery } from "@/store/api";
import ProfileDropdown from "./ProfileDropdown";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartTotalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { data: products = [] } = useGetProductsQuery();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Search suggestions based on query
  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const matches = products
      .filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
      .slice(0, 8);

    return matches;
  }, [searchQuery, products]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // CLICK to toggle dropdown (not hover!)
  const handleAccountClick = () => {
    if (user) {
      setShowProfileDropdown(true);
      setShowAuthDropdown(false);
    } else {
      // Toggle dropdown on/off
      setShowAuthDropdown(!showAuthDropdown);
    }
  };

  const handleSignInClick = () => {
    setShowAuthDropdown(false);
    setShowLoginModal(true);
  };

  const handleRegisterClick = () => {
    setShowAuthDropdown(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{ fontFamily: FONT }}>
        <div className="container mx-auto px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div 
              onClick={() => router.push("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-black">★</span>
              </div>
              <span className="text-2xl font-black">
                <span className="text-red-600">Eterno</span>
                <span className="text-gray-900">LUX</span>
              </span>
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  placeholder="What are you looking for today?"
                  className="w-full px-4 py-2.5 pl-11 pr-10 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-all"
                />
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-red-600 transition-colors" 
                  size={18}
                  onClick={() => handleSearch()}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {suggestions.map((product) => (
                      <button
                        key={product.productId}
                        onClick={() => handleSuggestionClick(product.productId)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <img
                            src={product.imageUrl || product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {product.brand} • {product.category}
                          </p>
                        </div>
                        <p className="font-bold text-sm text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                      </button>
                    ))}
                    
                    {/* View All Results */}
                    <button
                      onClick={() => handleSearch()}
                      className="w-full px-4 py-3 bg-gray-50 text-center text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              {/* Account - CLICK DROPDOWN (FIXED!) */}
              <div ref={authDropdownRef} className="relative">
                <button
                  onClick={handleAccountClick}
                  className="flex flex-col items-center gap-1 text-gray-700 hover:text-red-600 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <User size={24} />
                    {!user && (
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-200 ${showAuthDropdown ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {user ? "Account" : "Sign In"}
                  </span>
                </button>

                {/* LUXURIOUS DROPDOWN - STAYS OPEN! */}
                {!user && showAuthDropdown && (
                  <div 
                    className="absolute top-full right-0 mt-4 w-80 bg-white shadow-2xl overflow-hidden animate-slideDown"
                    style={{
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {/* Premium Header */}
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                      <h3 className="text-lg font-light tracking-tight text-gray-900 mb-1">
                        Welcome to EternoLUX
                      </h3>
                      <p className="text-xs text-gray-500 font-light">
                        Experience luxury shopping
                      </p>
                    </div>

                    {/* RED Buttons */}
                    <div className="px-8 py-8 space-y-4">
                      {/* Sign In Button - RED */}
                      <button
                        onClick={handleSignInClick}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-md"
                      >
                        Sign In
                      </button>

                      {/* Elegant Divider */}
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-4 text-xs text-gray-400 font-light tracking-wider">
                            OR
                          </span>
                        </div>
                      </div>

                      {/* Create Account Button - RED */}
                      <button
                        onClick={handleRegisterClick}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-md"
                      >
                        Create Account
                      </button>
                    </div>

                    {/* Premium Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                      <p className="text-[10px] text-gray-500 text-center font-light uppercase tracking-widest">
                        Exclusive Access • Premium Service
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => router.push("/wishlist")}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-red-600 transition-colors relative"
              >
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
                <span className="text-xs font-medium">Wishlist</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => router.push("/checkout")}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-red-600 transition-colors relative"
              >
                <ShoppingBag size={24} />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                )}
                <span className="text-xs font-medium">Bag</span>
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center justify-center gap-8 py-3 border-t border-gray-100">
            <button
              onClick={() => router.push("/product")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              Shop All
            </button>
            <button
              onClick={() => router.push("/search?q=women")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              Women
            </button>
            <button
              onClick={() => router.push("/search?q=men")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              Men
            </button>
            <button
              onClick={() => router.push("/product")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              New Arrivals
            </button>
            <button
              onClick={() => router.push("/product")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              Best Sellers
            </button>
            <button
              onClick={() => router.push("/product")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              Gift Sets
            </button>
            <button
              onClick={() => router.push("/product")}
              className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-red-600 transition-colors"
            >
              Luxury
            </button>
            <button
              onClick={() => router.push("/product")}
              className="text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors"
            >
              Sale
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Dropdown (Logged In) */}
      <ProfileDropdown 
        isOpen={showProfileDropdown} 
        onClose={() => setShowProfileDropdown(false)} 
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
