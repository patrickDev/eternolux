"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSendResetCodeMutation } from "@/app/api/api";

function getErrorMessage(err: unknown): string {
  const e = err as any;
  return e?.data?.message || "Failed to send reset email.";
}

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [sendResetCode, { isLoading, isSuccess }] =
    useSendResetCodeMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await sendResetCode({ email }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-2">Reset password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email and we’ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
              Reset code sent. Check your email.
            </div>
          )}

          <button
            disabled={isLoading}
            className="w-full rounded-xl bg-black py-3 text-white font-semibold disabled:opacity-60"
          >
            {isLoading ? "Sending…" : "Send reset code"}
          </button>
        </form>

        <button
          onClick={() => router.push("/signin")}
          className="mt-4 text-sm font-semibold hover:underline"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
