"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, ArrowLeft, CreditCard, Calendar, Hash, User as UserIcon, Truck } from "lucide-react";

import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import { useCart } from "@/app/context/cartContext";
import type { Product } from "@/app/api/api";
import image1 from "@/state/images/product1.png";

type CartItem = Product & { quantity: number };

function parsePrice(price: Product["price"]): number {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

const Checkout = () => {
  const router = useRouter();
  const { cartItems } = useCart();

  // State for form fields
  const [address, setAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(cartItems as CartItem[]).length) {
      alert("The vault is empty.");
      return;
    }
    alert("Transaction Authorized. Your EternoLux scent is being prepared.");
  };

  const items = cartItems as CartItem[];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-48 pb-20 px-6">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition mb-4"
          >
            <ArrowLeft size={14} /> Return to Portfolio
          </button>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            Secure <br /> <span className="text-gray-400">Checkout</span>
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Checkout Forms */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. SHIPPING */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Shipping Details</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street, Suite, City, State, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-8 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                />
              </div>
            </section>

            {/* 2. CARD INFORMATION (THE NEW FORM) */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Payment Information</h2>
              </div>
              
              <div className="space-y-6">
                {/* Card Name */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cardholder Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type="text"
                      placeholder="FULL NAME"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Card Number</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Expiry Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CVV</label>
                    <div className="relative">
                      <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Simple Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm sticky top-40">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 pb-4 border-b border-gray-50">
                Order <span className="text-gray-400">Summary</span>
              </h2>

              <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 truncate">
                      <div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                        <Image src={image1} alt={item.name} width={48} height={48} className="object-contain" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-black uppercase truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-xs font-black">${(parsePrice(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Sales Tax (10%)</span>
                  <span className="text-black">${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-black uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black tracking-tighter italic text-red-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition shadow-xl mt-10"
              >
                Authorize Purchase
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 opacity-30 grayscale pointer-events-none">
                 <div className="text-[8px] font-black border border-black px-1">VISA</div>
                 <div className="text-[8px] font-black border border-black px-1">AMEX</div>
                 <div className="text-[8px] font-black border border-black px-1">DISCOVER</div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;