"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
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

  // search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [trigger] = useLazyGetProductsQuery();

  // Close dropdown / search results / mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".user-dropdown") && !target.closest(".user-button")) {
        setIsDropdownOpen(false);
      }
      if (!target.closest(".search-wrap")) {
        setShowSearchResults(false);
      }
      if (!target.closest(".mobile-menu") && !target.closest(".hamburger-btn")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear the live dropdown results when you navigate to a different page
  useEffect(() => {
    setShowSearchResults(false);
    setFilteredProducts([]);
  }, [pathname]);

  // Debounced search: calls RTK lazy query which hits GET /api/products?search=...
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      const q = normalizeQuery(query);
      if (!q) {
        setFilteredProducts([]);
        return;
      }

      try {
        // IMPORTANT: for RTK lazy query, pass preferCacheValue=false/undefined
        // You already set endpoint to params: { search }
        const result = await trigger(q).unwrap();
        setFilteredProducts(result ?? []);
      } catch (err) {
        console.error("Search failed:", err);
        setFilteredProducts([]);
      }
    }, 250),
    [trigger]
  );

  // Proper debounce cleanup
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const goToSearchPage = (qRaw?: string) => {
    const q = normalizeQuery(qRaw ?? searchTerm);
    if (!q) return;

    router.push(`/shop?search=${encodeURIComponent(q)}`);

    // close UI
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

  const handleResultClick = (name: string) => {
    // Use the clicked product name as the search query
    setSearchTerm(name);
    goToSearchPage(name);
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    router.refresh();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* LEFT */}
          <div className="flex items-center gap-3 lg:gap-6 min-w-[180px]">
            <div
              className="h-10 w-28 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-sm cursor-pointer hover:shadow transition"
              onClick={() => router.push("/")}
              aria-label="Go to homepage"
              role="button"
            />

            <nav className="hidden lg:flex items-center gap-6">
              <a
                href="/shop"
                className="text-sm font-semibold text-gray-900 hover:text-black hover:underline underline-offset-4"
              >
                Shop
              </a>
              <a
                href="/contact"
                className="text-sm font-semibold text-gray-900 hover:text-black hover:underline underline-offset-4"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* CENTER: Search */}
          <div className="flex-1 flex justify-center">
            <div className="search-wrap relative w-full max-w-2xl">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  placeholder="Search perfumes, notes, gifts..."
                  className={[
                    "w-full rounded-2xl border border-gray-200 bg-white px-10 py-2.5",
                    "text-sm text-gray-900 placeholder:text-gray-400",
                    "shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300",
                    "transition",
                  ].join(" ")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => {
                    const q = normalizeQuery(searchTerm);
                    setShowSearchResults(!!q);
                  }}
                />

                <button
                  type="button"
                  onClick={() => goToSearchPage()}
                  className={[
                    "absolute right-2 top-1/2 -translate-y-1/2",
                    "rounded-xl border border-gray-200 bg-white px-3 py-1.5",
                    "text-xs font-semibold text-gray-900",
                    "hover:bg-gray-50 hover:shadow-sm transition",
                  ].join(" ")}
                >
                  Search
                </button>
              </div>

              {/* Results dropdown (preview) */}
              {showSearchResults && normalizeQuery(searchTerm) && (
                <div className="absolute top-full left-0 w-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
                  {filteredProducts.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto">
                      {filteredProducts.slice(0, 8).map((product) => (
                        <button
                          key={product.productId}
                          type="button"
                          onClick={() => handleResultClick(product.name)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between"
                        >
                          <span className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </span>
                          <span className="text-xs text-gray-500">${product.price}</span>
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => goToSearchPage()}
                        className="w-full text-left px-4 py-3 border-t border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                      >
                        View all results →
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 lg:gap-3 min-w-[180px] justify-end">
            {/* Hamburger */}
            <button
              type="button"
              className="hamburger-btn lg:hidden inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm hover:bg-gray-50 transition"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Cart */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm hover:bg-gray-50 transition"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5 text-gray-900" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-black text-white text-[11px] font-semibold px-2 py-0.5 shadow">
                    {cartTotalCount}
                  </span>
                )}
              </button>

              <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>

            {/* User */}
            <div className="relative user-dropdown">
              <button
                type="button"
                className="user-button inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm hover:bg-gray-50 transition"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-label="User menu"
              >
                <User className="h-5 w-5 text-gray-900" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName ?? "User"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          router.push("/account");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                      >
                        Account
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href="/signin"
                        className="block px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Sign In
                      </a>
                      <a
                        href="/register"
                        className="block px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
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

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="mobile-menu lg:hidden border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4 grid gap-2">
              <a
                href="/shop"
                className="rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </a>
              <a
                href="/contact"
                className="rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href="/signin"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold hover:bg-gray-50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </a>
                <a
                  href="/register"
                  className="rounded-xl bg-black px-4 py-3 text-center font-semibold text-white hover:bg-gray-900 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create account
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
