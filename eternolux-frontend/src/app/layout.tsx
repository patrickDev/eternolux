// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers }        from "./providers";
import { AuthProvider }     from "@/contexts/AuthContext";
import { CartProvider }     from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "EternoLux — Luxury Fragrances",
  description: "Discover handcrafted premium fragrances. Shop the finest colognes and perfumes at EternoLux.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        className="antialiased bg-white text-gray-900"
      >
        <Providers>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <Navbar />
                  <main>{children}</main>
                  <Footer />
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
