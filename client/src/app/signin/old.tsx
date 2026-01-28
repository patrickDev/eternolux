"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useSigninMutation } from "@/app/api/api";
import logoImg from "@/state/images/product1.png"; // replace with your logo

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
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Go to homepage"
            className="inline-flex items-center"
          >
            <Image
              src={logoImg}
              alt="EternoLux"
              width={56}
              height={56}
              className="rounded-lg border border-gray-200"
              priority
            />
          </button>
        </div>

        {/* Sign-in Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">
              Access your EternoLux account
            </p>
          </div>

          <form onSubmit={handleSigninSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs font-semibold text-gray-700 hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-black px-6 py-3 text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="font-semibold text-gray-900 hover:underline"
            >
              Forgot password?
            </Link>

            <Link
              href="/register"
              className="font-semibold text-gray-900 hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EternoLux
        </p>
      </div>
    </div>
  );
}
