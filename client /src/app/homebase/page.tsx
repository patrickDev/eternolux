"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/cartContext";
import { Product } from "@/state/api";
import { useGetShopDataQuery } from "@/state/api";
import dynamic from "next/dynamic";
import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import image1 from "@/state/images/product1.png";

// Dynamically import CartModal with SSR disabled
const CartModal = dynamic(() => import("../checkout/cartModal"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Homebase: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data, isError, isLoading } = useGetShopDataQuery();
  const { addToCart } = useCart();

  if (isLoading) {
    return <div className="py-4 text-center text-black">Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  const products: Product[] = data.popularProducts || [];

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white text-black py-32 px-10 text-center mt-24">
        <h1 className="text-5xl font-extrabold mb-6">Thank you for choosing Eternolux!</h1>
        <p className="text-xl mb-8">
          Discover a world of captivating scents and luxurious beauty.
        </p>
        <Link href="#products">
          <button className="bg-black text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-800 transition-all">
            Explore Products
          </button>
        </Link>
        
      </div>

      {/* Product Section */}
      <div id="products" className="mx-auto px-10 py-5">
        <h1 className="text-4xl font-bold text-black mb-6 text-center">
          MOST POPULAR
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div
              key={product.productId}
              className="border border-gray-300 shadow-md rounded-md p-4 flex flex-col items-center text-center bg-white"
            >
              <Link href={`/homebase/${product.productId}`} className="w-full">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <Image
                  src={image1}
                  alt={product.name}
                  width={220}
                  height={220}
                  className="rounded-2xl object-cover mx-auto"
                />
                <p className="mt-2">${product.price ?? 1}</p>
              </Link>
              <button
                onClick={() => handleAddToCart(product)}
                className="bg-black text-white px-4 py-2 mt-4 rounded-lg hover:bg-gray-800 transition-all"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />

      <Footer />
    </div>
  );
};

export default Homebase;
