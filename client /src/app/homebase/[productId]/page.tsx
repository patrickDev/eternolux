"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/app/context/cartContext";
import { useGetProductsQuery, type Product } from "@/app/api/api";

import CartModal from "@/app/checkout/cartModal";
import image2 from "@/state/images/product1.png";

type CartItem = Product & { quantity: number };

const ProductDetails = ({ params }: { params: { productId: string } }) => {
  const { productId } = params;
  const router = useRouter();

  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: products = [], isError, isLoading } = useGetProductsQuery();

  const product = useMemo(
    () => products.find((p) => p.productId === productId),
    [products, productId]
  );

  // More items (exclude current product)
  const moreItems = useMemo(() => {
    return products.filter((p) => p.productId !== productId).slice(0, 10);
  }, [products, productId]);

  // Keep quantity within stock
  useEffect(() => {
    if (product?.stock != null && product.stock > 0) {
      setQuantity((q) => Math.min(q, product.stock));
      return;
    }
    setQuantity(1);
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center">
          <div className="text-sm text-gray-600">Loading product…</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-red-600">
            We couldn’t load this product
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please try again, or return to the catalog.
          </p>
          <button
            className="mt-6 rounded-xl bg-black text-white px-5 py-2.5 font-semibold hover:bg-gray-900 transition"
            onClick={() => router.push("/homebase")}
          >
            Back to Homebase
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
          <p className="mt-2 text-sm text-gray-600">
            The item may have been removed or is temporarily unavailable.
          </p>
          <button
            className="mt-6 rounded-xl bg-black text-white px-5 py-2.5 font-semibold hover:bg-gray-900 transition"
            onClick={() => router.push("/homebase")}
          >
            Back to Homebase
          </button>
        </div>
      </div>
    );
  }

  const incrementQuantity = () => {
    if (product.stock > 0) setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    const item: CartItem = { ...product, quantity };
    addToCart(item as unknown as Product);
    setIsCartOpen(true);
  };

  const price = Number(product.price);
  const inStock = product.stock > 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl mt-20">
      {/* Subtle breadcrumb / back */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/homebase")}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline transition"
        >
          ← Back to catalog
        </button>
      </div>

      {/* TOP: 2-column hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="flex justify-center items-start">
          <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
              <Image
                src={image2}
                alt={product.name}
                width={900}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Trust row (optional UI cues) */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
              <div className="rounded-lg border border-gray-200 bg-white py-2">
                Secure checkout
              </div>
              <div className="rounded-lg border border-gray-200 bg-white py-2">
                Fast shipping
              </div>
              <div className="rounded-lg border border-gray-200 bg-white py-2">
                Easy returns
              </div>
            </div>
          </div>
        </div>

        {/* Purchase / Info */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-end justify-between gap-4 mb-4">
            <p className="text-2xl text-gray-900 font-semibold">
              ${price.toFixed(2)}
            </p>

            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {(product.rating ?? 0).toFixed(1)} ★
              </div>
              <div className="text-xs text-gray-500">
                {product.rating ?? 0} reviews
              </div>
            </div>
          </div>

          <p className="text-base text-gray-600 leading-relaxed mb-6">
            {product.description ?? ""}
          </p>

          {/* Stock badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border ${
                inStock
                  ? "border-gray-200 bg-white text-gray-900"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Buy box */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Quantity */}
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

                <div className="px-4 py-2 text-center min-w-[56px] font-semibold text-gray-900">
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

              {/* CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex justify-center items-center rounded-xl bg-black text-white px-8 py-3 font-semibold hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!inStock}
              >
                {inStock ? "Add to Cart" : "Unavailable"}
              </button>

              <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>

            {/* Order summary line */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                ${(price * quantity).toFixed(2)}
              </span>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-900 hover:bg-gray-50 transition"
                onClick={() => router.push("/homebase")}
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAILS (professional full-width section) */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Product Details</h2>
            <p className="text-sm text-gray-600">
              Key information to help you purchase with confidence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Description */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">
                Overview
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description ?? "No description available."}
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Specifications
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-700 font-semibold">SKU</span>
                <span className="text-gray-600">{product.productId}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-700 font-semibold">Price</span>
                <span className="text-gray-600">${price.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-700 font-semibold">Availability</span>
                <span className="text-gray-600">{inStock ? "In stock" : "Out of stock"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Rating</span>
                <span className="text-gray-600">
                  {(product.rating ?? 0).toFixed(1)} ★
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MORE ITEMS (premium horizontal carousel) */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">More items</h2>
            <p className="text-sm text-gray-600">
              Customers also explore these products.
            </p>
          </div>

          <button
            type="button"
            className="text-sm font-semibold text-gray-900 hover:underline"
            onClick={() => router.push("/homebase")}
          >
            View all
          </button>
        </div>

        {moreItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No other products yet.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {moreItems.map((p) => (
              <button
                key={p.productId}
                type="button"
                onClick={() => router.push(`/homebase/${p.productId}`)}
                className="min-w-[260px] text-left rounded-2xl border border-gray-200 bg-white p-3 hover:bg-gray-50 transition flex-shrink-0 shadow-sm"
              >
                <div className="h-40 w-full rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                  <Image
                    src={image2}
                    alt={p.name}
                    width={520}
                    height={520}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-3">
                  <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-600 truncate">
                    {p.description ?? "Eau de Parfum"}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-900">${Number(p.price).toFixed(2)}</div>
                    {typeof p.rating === "number" ? (
                      <div className="text-xs text-gray-600">
                        {Number(p.rating).toFixed(1)} ★
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
