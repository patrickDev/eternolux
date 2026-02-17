// src/app/checkout/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Shield,
  Truck,
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

type Step = "information" | "shipping" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotalAmount, clearCart } = useCart();
  const [step, setStep] = useState<Step>("information");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber] = useState(`EL-${Math.floor(Math.random() * 900000 + 100000)}`);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"amazon" | "card">("amazon");

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    saveInfo: false,
  });

  const shipping = 0;
  const tax = Number(cartTotalAmount) * 0.08;
  const total = Number(cartTotalAmount) + shipping + tax;

  const getImage = (item: any): string => {
    if (item.imageUrl) return item.imageUrl;
    if (item.images?.[0]) return item.images[0];
    return "/placeholder-product.jpg";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── ORDER CONFIRMED ────────────────────────────────────────
  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" strokeWidth={2.5} />
          </div>
          <div className="inline-block bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Order Confirmed
            </span>
          </div>
          <h1
            className="text-4xl font-black text-gray-900 mb-3"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: "-0.03em" }}
          >
            Thank You!
          </h1>
          <p className="text-gray-500 mb-2">
            Your order <span className="font-black text-gray-900">{orderNumber}</span> has been placed.
          </p>
          <p className="text-sm text-gray-400 mb-10">
            A confirmation has been sent to <strong>{form.email || "your email"}</strong>
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left mb-8 shadow-sm">
            <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-widest">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Order Number</span>
                <span className="font-bold text-gray-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total</span>
                <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery</span>
                <span className="font-bold text-gray-900">3-5 Business Days</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => router.push("/homebase")}
              className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-900 text-gray-700 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── EMPTY CART ─────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Your bag is empty
          </h2>
          <p className="text-gray-500 mb-8">Add products before checking out.</p>
          <button
            onClick={() => router.push("/homebase")}
            className="px-8 py-4 bg-red-600 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            Shop Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── CHECKOUT HEADER ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/homebase")}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to shop
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-black">★</span>
              </div>
              <span
                className="text-xl font-black"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                <span className="text-red-600">Eterno</span>
                <span className="text-gray-900">LUX</span>
              </span>
            </div>

            {/* Secure badge */}
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Lock size={14} className="text-green-600" />
              <span className="hidden sm:inline font-semibold">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEPS ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            {(["information", "shipping", "payment"] as Step[]).map((s, idx) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => {
                    if (s === "shipping" && step === "payment") setStep("shipping");
                    if (s === "information") setStep("information");
                  }}
                  className={`px-4 py-1.5 rounded-full transition-all ${
                    step === s
                      ? "bg-red-600 text-white"
                      : idx < ["information", "shipping", "payment"].indexOf(step)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {idx < ["information", "shipping", "payment"].indexOf(step) ? "✓ " : `${idx + 1}. `}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
                {idx < 2 && <span className="text-gray-300">›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">

          {/* ════════════════════════════════
              LEFT - FORM
          ════════════════════════════════ */}
          <div className="flex-1">

            {/* ── STEP 1: INFORMATION ── */}
            {step === "information" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2
                  className="text-2xl font-black text-gray-900 mb-6"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: "-0.02em" }}
                >
                  Contact Information
                </h2>

                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                    />
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        First Name *
                      </label>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Last Name *
                      </label>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Phone
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                    />
                  </div>

                  <hr className="border-gray-100" />
                  <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                    <MapPin size={18} className="text-red-600" />
                    Shipping Address
                  </h3>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Street Address *
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                    />
                  </div>

                  {/* City / State / ZIP */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        City *
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        State *
                      </label>
                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="NY"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        ZIP *
                      </label>
                      <input
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        placeholder="10001"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Save Info */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      name="saveInfo"
                      type="checkbox"
                      checked={form.saveInfo}
                      onChange={handleChange}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm text-gray-600">
                      Save this information for next time
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => setStep("shipping")}
                  className="mt-8 w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  Continue to Shipping
                  <ArrowLeft size={18} className="rotate-180" />
                </button>
              </div>
            )}

            {/* ── STEP 2: SHIPPING ── */}
            {step === "shipping" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2
                  className="text-2xl font-black text-gray-900 mb-6"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: "-0.02em" }}
                >
                  Shipping Method
                </h2>

                <div className="space-y-3">
                  {[
                    { id: "standard", label: "Standard Shipping", sub: "3-5 business days", price: "FREE" },
                    { id: "express", label: "Express Shipping", sub: "1-2 business days", price: "$15.00" },
                    { id: "overnight", label: "Next Day Delivery", sub: "Next business day", price: "$25.00" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-red-300 rounded-xl cursor-pointer transition-all has-[:checked]:border-red-600 has-[:checked]:bg-red-50"
                    >
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" defaultChecked={opt.id === "standard"} className="accent-red-600" />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                          <p className="text-xs text-gray-500">{opt.sub}</p>
                        </div>
                      </div>
                      <span className={`font-black text-sm ${opt.price === "FREE" ? "text-green-600" : "text-gray-900"}`}>
                        {opt.price}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep("information")}
                    className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-900 text-gray-700 rounded-full font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT ── */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2
                  className="text-2xl font-black text-gray-900 mb-6"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: "-0.02em" }}
                >
                  Payment
                </h2>

                {/* Payment Method Toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod("amazon")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === "amazon"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {/* Amazon Pay Logo */}
                    <svg viewBox="0 0 120 38" className="h-6 w-auto" fill="none">
                      <rect width="120" height="38" rx="4" fill="#FF9900"/>
                      <text x="8" y="26" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="white">amazon</text>
                      <text x="82" y="26" fontFamily="Arial" fontWeight="bold" fontSize="13" fill="white">Pay</text>
                    </svg>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === "card"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <CreditCard size={20} />
                    Credit / Debit Card
                  </button>
                </div>

                {/* Amazon Pay */}
                {paymentMethod === "amazon" && (
                  <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg viewBox="0 0 120 38" className="h-8 w-auto">
                        <rect width="120" height="38" rx="4" fill="#FF9900"/>
                        <text x="8" y="26" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="white">amazon</text>
                        <text x="82" y="26" fontFamily="Arial" fontWeight="bold" fontSize="13" fill="white">Pay</text>
                      </svg>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-2">Pay with Amazon</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Use your Amazon account for a fast, secure checkout experience.
                    </p>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={16} />
                      Place Order with Amazon Pay
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      You will be redirected to Amazon to complete your payment securely.
                    </p>
                  </div>
                )}

                {/* Credit Card */}
                {paymentMethod === "card" && (
                  <div className="space-y-5">
                    {/* Card logos */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Visa */}
                      <div className="h-8 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 60 20" className="h-5 w-auto">
                          <text x="0" y="16" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#1A1F71">VISA</text>
                        </svg>
                      </div>
                      {/* Mastercard */}
                      <div className="h-8 px-2 bg-white border border-gray-200 rounded-lg flex items-center gap-1">
                        <div className="w-5 h-5 bg-red-500 rounded-full opacity-90" />
                        <div className="w-5 h-5 bg-yellow-400 rounded-full -ml-2.5 opacity-90" />
                      </div>
                      {/* Amex */}
                      <div className="h-8 px-3 bg-blue-600 border border-blue-600 rounded-lg flex items-center">
                        <span className="text-white text-xs font-black tracking-wider">AMEX</span>
                      </div>
                      {/* Discover */}
                      <div className="h-8 px-3 bg-white border border-gray-200 rounded-lg flex items-center">
                        <span className="text-orange-500 text-xs font-black tracking-wider">DISCOVER</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <input
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                        />
                        <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    {/* Card Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Name on Card *
                      </label>
                      <input
                        name="cardName"
                        value={form.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                      />
                    </div>

                    {/* Expiry + CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          name="cardExpiry"
                          value={form.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM / YY"
                          maxLength={7}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                          CVV *
                        </label>
                        <input
                          name="cardCvv"
                          value={form.cardCvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                    >
                      <Lock size={16} />
                      Place Order — ${total.toFixed(2)}
                    </button>
                  </div>
                )}

                {/* Back */}
                <button
                  onClick={() => setStep("shipping")}
                  className="mt-4 w-full py-3.5 border-2 border-gray-200 hover:border-gray-900 text-gray-700 rounded-full font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Shipping
                </button>
              </div>
            )}
          </div>

          {/* ════════════════════════════════
              RIGHT - ORDER SUMMARY
          ════════════════════════════════ */}
          <div className="lg:w-96">
            {/* Mobile Toggle */}
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="lg:hidden w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-2xl mb-4 font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-red-600" />
                Order Summary ({cartItems.length} items)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-900">${total.toFixed(2)}</span>
                {showOrderSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Summary Box */}
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${!showOrderSummary ? "hidden lg:block" : ""}`}>
              <div className="p-6 border-b border-gray-100">
                <h3
                  className="font-black text-gray-900 text-base"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  Order Summary
                </h3>
              </div>

              {/* Items */}
              <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <Image
                        src={getImage(item)}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                    </div>
                    <p className="font-black text-sm text-gray-900 flex-shrink-0">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${Number(cartTotalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span
                    className="font-black text-gray-900"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    Total
                  </span>
                  <span
                    className="font-black text-2xl text-gray-900"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust */}
              <div className="px-6 pb-6 space-y-2.5">
                {[
                  { icon: Shield, text: "SSL encrypted & secure" },
                  { icon: Truck, text: "Free shipping on this order" },
                  { icon: Check, text: "30-day easy returns" },
                ].map(({ icon: Icon, text }, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-500">
                    <Icon size={14} className="text-red-600 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Import inside checkout page for ShoppingBag icon
import { ShoppingBag } from "lucide-react";