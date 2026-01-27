"use client";

import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/app/context/cartContext";
import type { Product } from "@/app/api/api";
import image1 from "@/state/images/product1.png";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, product }) => {
  const router = useRouter();

  const {
    cartItems,
    cartTotalCount,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    cartTotalAmount,
  } = useCart();

  const isEmpty = cartItems.length === 0;

  const portalTarget = useMemo(() => {
    if (typeof window === "undefined") return null;
    return document.body;
  }, []);

  /* ESC key */
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !portalTarget) return null;

  const handleCheckout = () => {
    if (isEmpty) return;
    const token = localStorage.getItem("token");
    onClose();
    router.push(token ? "/checkout" : "/signin");
  };

  const ui = (
    <div className="fixed inset-0 z-[2147483647]" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* RIGHT SIDE PANEL */}
      <aside
        className={[
          "absolute top-0 right-0 h-full w-full max-w-md",
          "bg-white shadow-2xl",
          "flex flex-col",
          "transform transition-transform duration-300 ease-out",
          "translate-y-0",
        ].join(" ")}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            My Cart
            <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white">
              {cartTotalCount}
            </span>
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1 text-sm font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {/* Highlight product */}
        {product && (
          <div className="p-4 border-b bg-gray-50">
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm">${Number(product.price).toFixed(2)}</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 border-b pb-4"
              >
                <Image
                  src={image1}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg border"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-sm">${Number(item.price).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decrementQuantity(item.productId)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 border rounded-full disabled:opacity-50"
                  >
                    −
                  </button>

                  <span className="font-semibold">{item.quantity}</span>

                  <button
                    onClick={() => incrementQuantity(item.productId)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 border rounded-full disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 mt-10">
              Your cart is empty.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex justify-between mb-3">
            <span className="font-semibold">Total</span>
            <span className="font-bold">
              ${Number(cartTotalAmount ?? 0).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isEmpty}
            className={[
              "w-full py-3 rounded-xl font-semibold transition",
              isEmpty
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900",
            ].join(" ")}
          >
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );

  return createPortal(ui, portalTarget);
};

export default CartModal;
