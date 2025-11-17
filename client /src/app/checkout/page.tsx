"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartContext";
import { Product } from "@/state/api";
import Image from "next/image";
import image1 from "@/state/images/product1.png";

type CartItem = Product & { quantity: number };

const Checkout = () => {
  const { cartItems } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin"); 
    }
  }, [router]);

  const calculateTotal = (): number =>
    cartItems.reduce((total, item: CartItem) => total + item.price * item.quantity, 0);

  const calculateTaxes = (total: number): number => total * 0.1;

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
  };

  const total = calculateTotal();
  const taxes = calculateTaxes(total);
  const grandTotal = total + taxes;

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
          <section className="lg:col-span-2 p-6 space-y-6">
            {/* Shipping Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full border border-black rounded px-4 py-3 focus:outline-none"
              />
            </div>

            {/* Payment Options */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full border border-black rounded px-4 py-3 focus:outline-none"
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
              {cartItems.map((item: CartItem, index: number) => (
                <div key={index} className="flex items-center mb-4">
                  <Image
                    src={image1}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price and Place Order Button */}
            <div className="border-t border-black pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total</p>
                <p className="text-lg font-bold">${grandTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full border border-black text-black py-3 rounded mt-6"
              >
                Place Your Order
              </button>
            </div>
          </section>

          {/* Right Section: Order Summary */}
          <section className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item: CartItem, index: number) => (
                <div
                  key={index}
                  className={`flex justify-between items-center ${index !== cartItems.length - 1 ? 'border-b border-black pb-4' : ''}`}
                >
                  <div className="flex items-center">
                    <Image
                      src={image1}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6 border-t border-black pt-4">
              <p className="font-semibold">Subtotal</p>
              <p className="text-lg font-bold">${total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">Taxes</p>
              <p className="text-lg font-bold">${taxes.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mt-6 border-t border-black pt-4">
              <p className="font-semibold">Total</p>
              <p className="text-lg font-bold">${grandTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              className="w-full border border-black text-black py-3 rounded mt-6"
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
