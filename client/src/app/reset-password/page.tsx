"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Key, ArrowLeft, ShieldCheck } from "lucide-react";
import { useResetPasswordMutation } from "@/app/api/api";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    try {
      await resetPassword({ email, resetCode, newPassword }).unwrap();
      // branded success notification could go here
      router.push("/signin");
    } catch (err: any) {
      setErrorMessage(err?.data?.message || "Reset failed. Please verify your code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] px-6 py-12">
      <div className="w-full max-w-md">
        
        {/* Navigation Back */}
        <button
          onClick={() => router.push("/signin")}
          className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </button>

        {/* Brand Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="h-12 w-12 bg-black flex items-center justify-center rounded-xl mb-4 shadow-xl">
            <span className="text-white font-black text-2xl italic leading-none">E</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Reset <br /> <span className="text-gray-400">Vault</span>
          </h1>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Secure Access Recovery
          </p>
        </div>

        {/* Reset Card */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Verified Identity
              </label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Reset Code Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Recovery Code
              </label>
              <div className="relative">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="000000"
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                New Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-14 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
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
              disabled={isLoading}
              className="w-full rounded-full bg-black px-6 py-4 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-600 transition shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Updating Vault..." : "Update Access Key"}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
            <ShieldCheck size={14} className="text-gray-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
              End-to-End Encrypted Recovery
            </span>
          </div>
        </div>

        {/* Footer Legal */}
        <p className="mt-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          © {new Date().getFullYear()} EternoLux Business Group
        </p>
      </div>
    </div>
  );
}