"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/state/api"; // Ensure the Product type is imported
import { useCart } from "@/app/context/cartContext";
import { useGetShopDataQuery } from "@/state/api";
import CartModal from "@/app/checkout/cartModal";
import image2 from "@/state/images/product1.png";

const ProductDetails = ({ params }: { params: { productId: string } }) => {
  const { productId } = params; // Access productId from params
  const router = useRouter();
  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Using the custom hook to fetch data
  const { data, isError, isLoading } = useGetShopDataQuery();

  useEffect(() => {
    if (!isLoading && data && data.popularProducts) {
      const foundProduct = data.popularProducts.find(
        (prod: Product) => prod.productId === productId
      );
      setProduct(foundProduct || null); // Handle case if product is not found
    }
  }, [data, isLoading, productId]);

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (isError || !data || !data.popularProducts) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">
          Failed to fetch product details
        </h2>
        <button
          className="mt-4 bg-[#008081] text-white px-4 py-2 rounded"
          onClick={() => router.push("/homebase")}
        >
          Go Back to Homebase
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <button
          className="mt-4 bg-[#008081] text-white px-4 py-2 rounded"
          onClick={() => router.push("/homebase")}
        >
          Go Back to Homebase
        </button>
      </div>
    );
  }

  const incrementQuantity = () => {
    if (product.stock && quantity < product.stock) {
      setQuantity((prev) => Math.min(prev + 1, product.stock)); // Limit to stock quantity
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)); // Minimum of 1
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product); // Add to cart multiple times to account for quantity
      }
      setTimeout(() => setIsCartOpen(true), 0);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8 max-w-5xl mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="flex justify-center items-center">
            <Image
              src={image2}
              alt={product.name}
              width={500}
              height={500}
              className="rounded-lg shadow-lg border-4 border-[#008081]"
            />
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-2xl text-gray-700 font-semibold mb-6">
              ${Number(product.price).toFixed(2)}
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 font-bold text-lg">
                {product.rating} ★
              </span>
              <span className="ml-2 text-gray-500">
                (Based on {product.rating} reviews)
              </span>
            </div>

            {/* Stock Info */}
            <p
              className={`font-semibold mb-4 ${
                product.stock > 0 ? "text-[#008081]" : "text-red-600"
              }`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            {/* Quantity Selector and Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-12 text-center text-lg border-none focus:outline-none"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  disabled={quantity >= (product.stock || 0)}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-[#008081] text-white px-8 py-4 text-lg rounded-lg hover:bg-[#006a6a] transition-all transform hover:scale-105"
              >
                Add to Cart
              </button>
              {/* Cart Modal */}
              <CartModal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
