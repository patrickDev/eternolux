"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/app/context/cartContext";
import { useGetProductsQuery, type Product } from "@/app/api/api";

import CartModal from "@/app/checkout/cartModal";
import fallbackImg from "@/state/images/product1.png";

type CartItem = Product & { quantity: number };

interface ProductDetailsProps {
  params: {
    productId: string; // ✅ Next.js params are strings
  };
}

export default function ProductDetails({ params }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const { data: products = [], isLoading, isError } = useGetProductsQuery();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => {
    const pid = String(params.productId);
    return products.find((p) => String(p.productId) === pid);
  }, [products, params.productId]);

  // Keep quantity within stock
  useEffect(() => {
    if (product?.stock != null && product.stock > 0) {
      setQuantity((q) => Math.min(Math.max(q, 1), product.stock));
    } else {
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) {
    return <div className="text-center py-10 text-gray-700">Loading…</div>;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 lg:px-10 py-20 max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Failed to fetch product details
          </h2>
          <button
            className="mt-6 rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
            onClick={() => router.push("/shop")}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 lg:px-10 py-20 max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
          <p className="mt-2 text-sm text-gray-600">
            The item may be unavailable or removed.
          </p>
          <button
            className="mt-6 rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
            onClick={() => router.push("/shop")}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const price = Number(product.price);

  const incrementQuantity = () => {
    if (!inStock) return;
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    if (!inStock) return;

    const item: CartItem = { ...product, quantity };

    // Keep your cart typing compatible with Product, as you’ve done elsewhere
    addToCart(item as unknown as Product);

    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-6 lg:px-10 py-10 max-w-6xl mt-20">
        {/* Top back link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline transition"
          >
            ← Back to Shop
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-b from-gray-50 to-white blur-xl" />
            <div className="relative rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50">
                <Image
                  src={product.imageUrl ?? fallbackImg}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-end justify-between gap-6">
              <div className="text-2xl font-semibold text-gray-900">
                {Number.isFinite(price) ? `$${price.toFixed(2)}` : `$${product.price}`}
              </div>

              {typeof product.rating === "number" ? (
                <div className="text-sm font-semibold text-gray-700">
                  {product.rating.toFixed(1)} ★
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {product.description ?? ""}
            </p>

            {/* Stock status */}
            <div className="mt-6">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border ${
                  inStock
                    ? "border-gray-200 bg-white text-gray-900"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {inStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            {/* Quantity + CTA */}
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-50 transition disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>

                  <div className="px-4 py-2 min-w-[60px] text-center font-semibold">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={incrementQuantity}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-50 transition disabled:opacity-50"
                    disabled={!inStock || quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 inline-flex justify-center rounded-xl bg-black px-6 py-3 text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>

                <CartModal
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {Number.isFinite(price) ? `$${(price * quantity).toFixed(2)}` : "—"}
                </span>
              </div>
            </div>

            {/* Optional details block */}
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Product Details</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-900">SKU</span>
                  <span className="text-gray-600">{product.productId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-900">Availability</span>
                  <span className="text-gray-600">{inStock ? "In stock" : "Out of stock"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-900">Price</span>
                  <span className="text-gray-600">
                    {Number.isFinite(price) ? `$${price.toFixed(2)}` : `$${product.price}`}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-900">Stock</span>
                  <span className="text-gray-600">{product.stock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-10" />
      </div>
    </div>
  );
}
