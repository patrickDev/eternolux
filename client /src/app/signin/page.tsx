"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/state/api"; 
import { useSigninMutation } from "@/state/api";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"signin" | "forgotPassword" | "resetPassword">("signin");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();
  const [signinMutation] = useSigninMutation();

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await signinMutation({ email, password }).unwrap();

      if (response.user) {
        setUserData(response.user);
        setIsLoggedIn(true);
        router.push("/shop");
      } else {
        throw new Error("Sign-in failed. No token received.");
      }
    } catch (error: any) {
      const backendMessage = error?.data?.error || error.message || "Sign-in failed. Please try again.";
      setErrorMessage(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
      <div className="absolute top-4 left-4">
        <Image
          src="ƒ"
          alt="eternolux"
          width={80}
          height={80}
          className="rounded cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>
      <h1 className="text-4xl font-bold text-center mb-2">
        <span className="text-black">Welcome</span>
      </h1>
      <p className="text-center text-lg text-gray-700 mb-6">
        {view === "signin" ? "Sign in to access your EternoLux account." : "Reset your password."}
      </p>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-10 border border-gray-300">
        {view === "signin" && (
          <>
            <h3 className="text-lg font-bold text-black mb-6">Sign In</h3>
            <form onSubmit={handleSigninSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm text-black mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
              <div className="mb-2">
                <label htmlFor="password" className="block text-sm text-black mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
              {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
              <p className="text-sm text-black mb-4">
                <a onClick={() => setView("forgotPassword")} className="text-black hover:underline cursor-pointer">
                  Forgot your password?
                </a>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <p className="mt-6 text-sm text-black">
              Don't have an account?{" "}
              <Link href="/register" className="text-black hover:underline">
                Register here
              </Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Signin;
