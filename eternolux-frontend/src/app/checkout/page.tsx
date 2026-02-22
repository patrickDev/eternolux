// eternolux-frontend/src/app/checkout/page.tsx
// FIXED CHECKOUT - Address saving, quantity control, validation, no navbar

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Shield, Truck, Lock, Check, ChevronDown, ChevronUp,
  MapPin, CreditCard, ShoppingBag, Loader2, Plus, Minus, X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Step = "information" | "shipping" | "payment";
type ShippingMethod = "standard" | "express" | "overnight";
type PaymentMethod = "stripe" | "amazon";

const SHIPPING_OPTIONS = {
  standard: { price: 0, label: "Standard Shipping", sub: "3-5 business days" },
  express: { price: 15, label: "Express Shipping", sub: "1-2 business days" },
  overnight: { price: 25, label: "Next Day Delivery", sub: "Next business day" },
};

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// ═══════════════════════════════════════════════════════════
// STRIPE PAYMENT FORM
// ═══════════════════════════════════════════════════════════
function StripeCheckoutForm({ 
  total, 
  onSuccess,
  customerInfo,
}: { 
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  customerInfo: any;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: customerInfo.email,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <PaymentElement 
          options={{
            layout: "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock size={16} />
            Place Order — ${total.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Secured by Stripe. Your card details are never stored.
      </p>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN CHECKOUT PAGE
// ═══════════════════════════════════════════════════════════
export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cartItems, 
    cartTotalAmount, 
    cartTotalCount,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCart();
  
  const [step, setStep] = useState<Step>("information");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber] = useState(`EL-${Math.floor(Math.random() * 900000 + 100000)}`);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", address: "",
    city: "", state: "", zip: "", phone: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = SHIPPING_OPTIONS[shippingMethod].price;
  const tax = Number(cartTotalAmount) * 0.08;
  const total = Number(cartTotalAmount) + shippingCost + tax;

  // Load Stripe Payment Intent
  useEffect(() => {
    if (step === "payment" && paymentMethod === "stripe" && !clientSecret) {
      createPaymentIntent();
    }
  }, [step, paymentMethod]);

  const createPaymentIntent = async () => {
    setIsLoadingPayment(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "usd",
          customerInfo: form,
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Failed to create payment intent:", error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleAmazonPay = async () => {
    setIsLoadingPayment(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/amazon-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          customerInfo: form,
          items: cartItems,
        }),
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to initialize Amazon Pay");
        setIsLoadingPayment(false);
      }
    } catch (error) {
      console.error("Amazon Pay error:", error);
      alert("Failed to initialize Amazon Pay");
      setIsLoadingPayment(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          paymentIntentId,
          customerInfo: form,
          items: cartItems,
          shipping: shippingCost,
          tax,
          total,
          paymentMethod: "stripe",
        }),
      });

      setOrderPlaced(true);
      cartItems.forEach(item => removeFromCart(item.productId));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  // Save/Update Address in Database
  const saveAddress = async () => {
    setIsSavingAddress(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          phone: form.phone,
        }),
      });
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Validate Information Form
  const validateInformation = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.zip) newErrors.zip = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToShipping = async () => {
    if (validateInformation()) {
      await saveAddress(); // Save address to database
      setStep("shipping");
    } else {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getImage = (item: any): string => {
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    if (item.images?.[0]) return item.images[0];
    return "/placeholder.png";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ORDER CONFIRMED
  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: FONT }}>
            Thank You!
          </h1>
          <p className="text-gray-500 mb-2">
            Order <span className="font-black text-gray-900">{orderNumber}</span> confirmed.
          </p>
          <p className="text-sm text-gray-400 mb-10">
            Confirmation sent to <strong>{form.email}</strong>
          </p>
          <div className="flex gap-3">
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

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4" style={{ fontFamily: FONT }}>
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
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>
      {/* HEADER - SIMPLE (NO NAVBAR) */}
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

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-black">★</span>
              </div>
              <span className="text-xl font-black">
                <span className="text-red-600">Eterno</span>
                <span className="text-gray-900">LUX</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Lock size={14} className="text-green-600" />
              <span className="hidden sm:inline font-semibold">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEPS */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            {(["information", "shipping", "payment"] as Step[]).map((s, idx) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => {
                    if (idx < ["information", "shipping", "payment"].indexOf(step)) {
                      setStep(s);
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full transition-all ${
                    step === s
                      ? "bg-red-600 text-white"
                      : idx < ["information", "shipping", "payment"].indexOf(step)
                      ? "text-green-600 cursor-pointer hover:bg-green-50"
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

          {/* LEFT - FORMS */}
          <div className="flex-1">

            {/* STEP 1: INFORMATION */}
            {step === "information" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        First Name *
                      </label>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                          errors.firstName ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        Last Name *
                      </label>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                          errors.lastName ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all"
                    />
                  </div>

                  <hr className="border-gray-100" />
                  <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                    <MapPin size={18} className="text-red-600" />
                    Shipping Address
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Street Address *
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                        errors.address ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        City *
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                          errors.city ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        State *
                      </label>
                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                          errors.state ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                        ZIP *
                      </label>
                      <input
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 text-sm transition-all ${
                          errors.zip ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.zip && (
                        <p className="text-red-500 text-xs mt-1">{errors.zip}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinueToShipping}
                  disabled={isSavingAddress}
                  className="mt-8 w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to Shipping
                      <ArrowLeft size={18} className="rotate-180" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: SHIPPING */}
            {step === "shipping" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Shipping Method
                </h2>

                <div className="space-y-3">
                  {Object.entries(SHIPPING_OPTIONS).map(([key, option]) => (
                    <label
                      key={key}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        shippingMethod === key
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === key}
                          onChange={() => setShippingMethod(key as ShippingMethod)}
                          className="accent-red-600"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.sub}</p>
                        </div>
                      </div>
                      <span className={`font-black text-sm ${option.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                        {option.price === 0 ? "FREE" : `$${option.price.toFixed(2)}`}
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

            {/* STEP 3: PAYMENT */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Payment
                </h2>

                {/* Payment Method Toggle */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`py-4 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      paymentMethod === "stripe"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <CreditCard size={20} className="mx-auto mb-1" />
                    Credit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("amazon")}
                    className={`py-4 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      paymentMethod === "amazon"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <svg viewBox="0 0 120 38" className="h-6 w-auto mx-auto">
                      <rect width="120" height="38" rx="4" fill="#FF9900"/>
                      <text x="8" y="26" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="white">amazon</text>
                      <text x="82" y="26" fontFamily="Arial" fontWeight="bold" fontSize="13" fill="white">Pay</text>
                    </svg>
                  </button>
                </div>

                {/* STRIPE */}
                {paymentMethod === "stripe" && (
                  <div>
                    {isLoadingPayment ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
                        <p className="text-sm text-gray-500">Loading payment...</p>
                      </div>
                    ) : clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripeCheckoutForm
                          total={total}
                          onSuccess={handleStripeSuccess}
                          customerInfo={form}
                        />
                      </Elements>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Failed to load payment.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AMAZON PAY */}
                {paymentMethod === "amazon" && (
                  <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg viewBox="0 0 120 38" className="h-8 w-auto">
                        <rect width="120" height="38" rx="4" fill="#FF9900"/>
                        <text x="8" y="26" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="white">amazon</text>
                        <text x="82" y="26" fontFamily="Arial" fontWeight="bold" fontSize="13" fill="white">Pay</text>
                      </svg>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-2">Pay with Amazon</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Use your Amazon account for fast, secure checkout.
                    </p>
                    <button
                      onClick={handleAmazonPay}
                      disabled={isLoadingPayment}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                    >
                      {isLoadingPayment ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Pay with Amazon — ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setStep("shipping")}
                  className="mt-6 w-full py-3.5 border-2 border-gray-200 hover:border-gray-900 text-gray-700 rounded-full font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Shipping
                </button>
              </div>
            )}
          </div>

          {/* RIGHT - ORDER SUMMARY WITH QUANTITY CONTROLS */}
          <div className="lg:w-96">
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="lg:hidden w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-2xl mb-4 font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-red-600" />
                Order Summary ({cartTotalCount} items)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-900">${total.toFixed(2)}</span>
                {showOrderSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${!showOrderSummary ? "hidden lg:block" : ""}`}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-black text-gray-900 text-base">Order Summary</h3>
              </div>

              <div className="p-6 space-y-5 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <Image src={getImage(item)} alt={item.name} fill className="object-contain p-2" sizes="96px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-bold text-sm text-gray-900 line-clamp-2 flex-1">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                          <button
                            onClick={() => decrementQuantity(item.productId)}
                            className="p-1.5 hover:bg-gray-100 transition-colors rounded-l-lg"
                          >
                            <Minus size={14} className="text-gray-600" />
                          </button>
                          <span className="text-sm font-bold text-gray-900 px-2 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => incrementQuantity(item.productId)}
                            className="p-1.5 hover:bg-gray-100 transition-colors rounded-r-lg"
                          >
                            <Plus size={14} className="text-gray-600" />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <p className="font-black text-sm text-gray-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${Number(cartTotalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-bold ${shippingCost === 0 ? "text-green-600" : "text-gray-900"}`}>
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-2xl text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-2.5">
                {[
                  { icon: Shield, text: "SSL encrypted & secure" },
                  { icon: Truck, text: shippingCost === 0 ? "Free shipping" : `Shipping: $${shippingCost.toFixed(2)}` },
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
