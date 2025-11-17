"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, User, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartContext";
import { useLazyGetProductsQuery } from "@/state/api";
import CartModal from "@/app/checkout/cartModal";
import { Product } from "@/types/product";
import debounce from "lodash/debounce";
import { useUser } from "@/app/context/userContext";

const Navbar = () => {
  const { cartTotalCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const router = useRouter();
  const [trigger] = useLazyGetProductsQuery();
  const { user, login, logout } = useUser();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown") && !target.closest(".user-button")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search logic
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) return setFilteredProducts([]);
      const result = await trigger(query).unwrap();
      setFilteredProducts(result || []);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(true);
    debouncedSearch(value);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setShowSearchResults(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleResultClick = (name: string) => {
    setSearchTerm(name);
    router.push(`/shop?search=${encodeURIComponent(name)}`);
    setShowSearchResults(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <header className="w-full fixed top-0 z-50 shadow-lg bg-white">
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center py-4">
        {/* Left Side: Logo & Nav */}
        <div className="flex items-center gap-6">
          <Image
            src={`https://s3-inventorymanagement12.s3.us-east-2.amazonaws.com/logo.png`}
            alt="dadem-logo"
            width={60}
            height={40}
            className="rounded cursor-pointer"
            onClick={() => router.push("/")}
            priority
          />

          <nav className="hidden lg:flex gap-6">
            <a href="/shop" className="text-black font-medium hover:text-gray-700">
              Shop
            </a>
            <a href="/contact" className="text-black font-medium hover:text-gray-700">
              Contact
            </a>
          </nav>
        </div>

        {/* Center: Search */}
        <div className="flex flex-grow justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search for products..."
              className="pl-3 pr-10 py-2 w-full border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-gray-700 text-sm text-black"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              className="absolute inset-y-0 right-3 flex items-center hover:bg-gray-200 rounded-full p-1"
              onClick={handleSearch}
            >
              <Search className="text-gray-500 hover:text-black" size={24} />
            </button>

            {showSearchResults && searchTerm.trim() && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg z-10 rounded-md mt-2 max-h-64 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.productId}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onClick={() => handleResultClick(product.name)}
                    >
                      {product.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart & User */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Cart */}
          <div className="relative cursor-pointer">
            <button onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-7 h-7 text-black" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs rounded-full px-2">
                  {cartTotalCount}
                </span>
              )}
            </button>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>

          {/* User Menu */}
          <div className="relative user-dropdown">
            <button
              className="px-4 py-4 bg-white rounded-full hover:bg-gray-200 user-button border border-gray-300"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-label="User menu"
            >
              <User className="w-6 h-6 text-black" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-black font-semibold">{user.fname}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        router.push("/account");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                    >
                      Account
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/signin"
                      className="block px-4 py-2 text-black hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Sign In
                    </a>
                    <a
                      href="/register"
                      className="block px-4 py-2 text-black hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Create Account
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
