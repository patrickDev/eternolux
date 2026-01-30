"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";

import { useSigninMutation } from "@/app/api/api";

function getErrorMessage(err: unknown): string {
  const e = err as any;
  return (
    e?.data?.message ||
    e?.data?.error ||
    e?.error ||
    e?.message ||
    "Sign-in failed. Please try again."
  );
}

export default function Signin() {
  const router = useRouter();
  const [signin, { isLoading }] = useSigninMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await signin({ email, password }).unwrap();
      router.refresh();
      router.push("/shop");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back to Home Navigation */}
        <button
          onClick={() => router.push("/")}
          className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition"
        >
          <ArrowLeft size={14} /> Back to Collection
        </button>

        {/* Brand Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          {/* LOGO: Updated to EternoLux */}
          <div className="flex items-center min-w-[120px] lg:min-w-[180px]">
            <Link
              href="/"
              className="group cursor-pointer"
            >
              <span className="text-2xl font-black tracking-tighter italic uppercase group-hover:text-red-600 transition">
                Eterno<span className="text-gray-400 group-hover:text-black">Lux</span>
              </span>
            </Link>
          </div>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Access the EternoLux Circle
          </p>
        </div>

        {/* Sign-in Card */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSigninSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Identity (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@email.com"
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Access Key
                </label>
                {/* ✅ FIXED: Removed 'size' prop which caused the TS error */}
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline transition"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-[11px] font-bold text-red-600 uppercase tracking-tight text-center border border-red-100 italic">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-black px-6 py-4 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-600 transition shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Unlocking..." : "Enter the Circle"}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-10 text-center pt-6 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Not a member of the circle?
            </p>
            <Link
              href="/register"
              className="text-sm font-black italic uppercase tracking-tighter border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition"
            >
              Request Access / Register
            </Link>
          </div>
        </div>

        {/* Footer Legal */}
        <p className="mt-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          © {new Date().getFullYear()} EternoLux By DADEM Co. LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}