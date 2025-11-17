"use client";

import React, { useState } from "react";
import Header from "../(components)/Header";
import Navbar from "../(components)/Navbar";
import Footer from "../(components)/Footer";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/cartContext";
import { Product } from "@/state/api";
import CartModal from "../checkout/cartModal";
import { useGetShopDataQuery } from "@/state/api";
import image1 from "@/state/images/product1.png";

const ITEMS_PER_PAGE = 8;

const Shop = () => {
  const { data, isError, isLoading } = useGetShopDataQuery();
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (isLoading) return <div className="py-4 text-black">Loading...</div>;
  if (isError || !data)
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );

  const products: Product[] = data.popularProducts.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setSelectedProduct(product);
  };

  const handleCloseCart = () => setSelectedProduct(null);
  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div className="w-full bg-white text-black">
      <Navbar />
      <Header name="Shop" />
      <div id="products" className="mx-auto px-10 py-5 w-full mt-5">
        <h1 className="text-4xl font-bold mb-6 text-center mt-16">
  All Products
         </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {currentProducts.map((product) => (
            <div
              key={product.productId}
              className="border shadow rounded-md p-4 flex flex-col items-center justify-center text-center"
            >
              <Link
                href={`/shop/${product.productId}`}
                className="w-full flex flex-col items-center"
              >
                <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                <Image
                  src={image1}
                  alt={product.name}
                  width={220}
                  height={500}
                  className="mb-3 rounded-2xl object-cover"
                />
                <p className="mt-2">${product.price.toFixed(2)}</p>
              </Link>
              <button
                onClick={() => handleAddToCart(product)}
                className="bg-black text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-800 transition-all mt-4"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`mr-4 px-6 py-2 rounded-md text-white ${
              currentPage === 1 ? "bg-gray-400" : "bg-black hover:bg-gray-800"
            }`}
          >
            &#8592;
          </button>
          <span className="font-bold mx-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`ml-4 px-6 py-2 rounded-md text-white ${
              currentPage === totalPages
                ? "bg-gray-400"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            &#8594;
          </button>
        </div>

        <CartModal
          isOpen={!!selectedProduct}
          onClose={handleCloseCart}
          product={selectedProduct}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
