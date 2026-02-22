// src/app/checkout/cartModal.tsx

"use client";

import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  Tag,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/app/types/product.types";

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
    cartTotalAmount,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCart();

  const isEmpty = cartItems.length === 0;

  const portalTarget = useMemo(() => {
    if (typeof window === "undefined") return null;
    return document.body;
  }, []);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen || !portalTarget) return null;

  const getImage = (item: any): string => {
    if (item.imageUrl) return item.imageUrl;
    if (item.images?.[0]) return item.images[0];
    return "/placeholder.png";
  };

  const handleCheckout = () => {
    if (isEmpty) return;
    onClose();
    router.push("/checkout");
  };

  const ui = (
    <div
      className="fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="absolute top-0 right-0 h-full w-full max-w-[480px] bg-white flex flex-col shadow-2xl animate-slideInRight">

        {/* Red accent top line */}
        <div className="h-1 bg-red-600 flex-shrink-0" />

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-red-600" strokeWidth={2} />
            <div>
              <h2
                id="cart-title"
                className="font-black text-lg text-gray-900 leading-none"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                Shopping Bag
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {cartTotalCount} {cartTotalCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Recently Added Banner */}
        {product && (
          <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 flex-shrink-0 animate-fadeIn">
            <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-800 font-semibold truncate">
              <span className="font-black">{product.name}</span> added to bag!
            </p>
          </div>
        )}

        {/* ── CART ITEMS ── */}
        <div className="flex-1 overflow-y-auto">
          {!isEmpty ? (
            <div className="px-6 py-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="group flex gap-4 p-4 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-md transition-all duration-300"
                >
                  {/* Image */}
                  <div
                    className="relative w-24 h-24 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                    onClick={() => { onClose(); router.push(`/homebase/${item.productId}`); }}
                  >
                    <Image
                      src={getImage(item)}
                      alt={item.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      sizes="96px"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="font-black text-sm text-gray-900 line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => { onClose(); router.push(`/homebase/${item.productId}`); }}
                        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 capitalize">
                      {item.category === "men" ? "For Him" : item.category === "women" ? "For Her" : "Signature"}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Qty Controls */}
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => decrementQuantity(item.productId)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementQuantity(item.productId)}
                          disabled={item.quantity >= item.stock}
                          className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-black text-gray-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">
                          ${Number(item.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {item.quantity >= item.stock && (
                      <p className="text-[10px] text-red-600 font-bold mt-1">
                        Max stock reached
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={52} className="text-gray-200" strokeWidth={1} />
              </div>
              <h3
                className="text-xl font-black text-gray-900 mb-2"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                Your bag is empty
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                Discover our premium fragrance collection
              </p>
              <button
                onClick={() => { onClose(); router.push("/homebase"); }}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300"
              >
                Explore Collection
              </button>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        {!isEmpty && (
          <div className="border-t border-gray-100 px-6 py-6 flex-shrink-0 space-y-5 bg-white">
            {/* Promo Code */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Promo code"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-400 transition-colors"
                />
              </div>
              <button className="px-5 py-2.5 bg-gray-900 hover:bg-red-600 text-white text-sm font-bold rounded-full transition-all duration-300">
                Apply
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartTotalCount} items)</span>
                <span className="font-semibold">${Number(cartTotalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="text-gray-400">At checkout</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span
                className="font-black text-base text-gray-900"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                Estimated Total
              </span>
              <span
                className="font-black text-2xl text-gray-900"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                ${Number(cartTotalAmount).toFixed(2)}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5"
              >
                Proceed to Checkout
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => { onClose(); router.push("/homebase"); }}
                className="w-full py-3.5 border-2 border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>

            {/* Trust Row */}
            <div className="flex items-center justify-around pt-2 border-t border-gray-50">
              <div className="flex flex-col items-center gap-1">
                <Shield size={18} className="text-red-600" strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck size={18} className="text-red-600" strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Free Ship</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={18} className="text-red-600" strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Returns</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
        .animate-fadeIn      { animation: fadeIn      0.3s ease-out; }
        .animate-slideInRight{ animation: slideInRight 0.4s cubic-bezier(0.16,1,0.3,1); }
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f9fafb; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>
    </div>
  );

  return createPortal(ui, portalTarget);
};

export default CartModal;