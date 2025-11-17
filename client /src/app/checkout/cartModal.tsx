"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartContext";
import Image from "next/image";
import { Product } from "@/state/api";
import image1 from "@/state/images/product1.png";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, product }) => {
  const {
    cartItems,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    cartTotalAmount,
  } = useCart();
  const { cartTotalCount } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      onClose();
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25">
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white rounded-l-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-black">
          <h2 className="text-xl font-bold">
            My Cart <span className="px-2 py-1 border border-black rounded-full">{cartTotalCount}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-black text-2xl focus:outline-none"
            aria-label="Close Cart"
          >
            &times;
          </button>
        </div>

        {/* Optional product details */}
        {product && (
          <div className="p-4 border-b border-black">
            <h3 className="font-semibold">{product.name}</h3>
            <p>${Number(product.price).toFixed(2)}</p>
            {product.rating !== undefined && (
              <p className="text-sm">Rating: {product.rating} Stars</p>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 160px)" }}>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 border-b border-black pb-4 last:border-b-0"
              >
                <Image
                  src={image1}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg border border-black"
                />
                <div className="flex-1">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-sm">${Number(item.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => decrementQuantity(item.productId)}
                    className="w-8 h-8 border border-black text-black rounded-full flex items-center justify-center disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{item.quantity}</span>
                  <button
                    onClick={() => incrementQuantity(item.productId)}
                    className="w-8 h-8 border border-black text-black rounded-full flex items-center justify-center disabled:opacity-50"
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-black text-sm focus:outline-none"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-center">Your cart is empty.</p>
          )}
        </div>

        {/* Total and Checkout */}
        {cartItems.length > 0 && (
          <div className="sticky bottom-0 bg-white p-4 border-t border-black">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-semibold text-lg">${cartTotalAmount?.toFixed(2) || "0.00"}</span>
            </div>
            <button
              className="w-full border border-black text-black py-3 rounded font-medium focus:outline-none"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
