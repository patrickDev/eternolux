"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/app/context/cartContext";
import type { Product } from "@/app/api/api";
import image1 from "@/state/images/product1.png";

type CartItem = Product & { quantity: number };

function parsePrice(price: Product["price"]): number {
  // SQLite/Drizzle returns decimals as TEXT ("7.99")
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

const Checkout = () => {
  const router = useRouter();
  const { cartItems } = useCart();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    // If you're using HttpOnly cookies, this token check is optional.
    // Keeping your logic as-is.
    const token = localStorage.getItem("token");
    if (!token) router.push("/signin");
  }, [router]);

  const subtotal = useMemo(() => {
    return (cartItems as CartItem[]).reduce((total, item) => {
      return total + parsePrice(item.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  const taxes = useMemo(() => subtotal * 0.1, [subtotal]);
  const grandTotal = useMemo(() => subtotal + taxes, [subtotal, taxes]);

  const handlePlaceOrder = () => {
    if (!(cartItems as CartItem[]).length) {
      alert("Your cart is empty.");
      return;
    }
    if (!address.trim()) {
      alert("Please enter your shipping address.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    // TODO: call your backend order endpoint here
    alert("Order placed successfully!");
  };

  const items = cartItems as CartItem[];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="py-4 px-8">
        <h1 className="text-2xl font-bold">Checkout</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <section className="lg:col-span-2 p-6 space-y-6 border border-gray-200 rounded-2xl">
            {/* Shipping Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* Payment Options */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Select Payment Method</option>
                <option value="creditCard">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bankTransfer">Bank Transfer</option>
              </select>
            </div>

            {/* Item Image and Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Item Details</h2>

              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4">
                      <Image
                        src={image1}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-xl border border-gray-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {item.description ?? ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">Your cart is empty.</p>
              )}
            </div>

            {/* Total Price and Place Order Button */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total</p>
                <p className="text-lg font-bold">${grandTotal.toFixed(2)}</p>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-black text-white py-3 rounded-xl mt-6 font-semibold hover:bg-gray-900 transition"
              >
                Place Your Order
              </button>
            </div>
          </section>

          {/* Right Section: Order Summary */}
          <section className="p-6 border border-gray-200 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {items.map((item, idx) => {
                const lineTotal = parsePrice(item.price) * item.quantity;
                const withBorder = idx !== items.length - 1;

                return (
                  <div
                    key={item.productId}
                    className={`flex justify-between items-center ${
                      withBorder ? "border-b border-gray-200 pb-4" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Image
                        src={image1}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-xl border border-gray-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">${lineTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6 border-t border-gray-200 pt-4">
              <p className="font-semibold">Subtotal</p>
              <p className="text-lg font-bold">${subtotal.toFixed(2)}</p>
            </div>

            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">Taxes</p>
              <p className="text-lg font-bold">${taxes.toFixed(2)}</p>
            </div>

            <div className="flex justify-between items-center mt-6 border-t border-gray-200 pt-4">
              <p className="font-semibold">Total</p>
              <p className="text-lg font-bold">${grandTotal.toFixed(2)}</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full bg-black text-white py-3 rounded-xl mt-6 font-semibold hover:bg-gray-900 transition"
            >
              Place Your Order
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
