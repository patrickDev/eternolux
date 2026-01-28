"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResetPasswordMutation } from "@/app/api/api";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword({ email, resetCode, newPassword }).unwrap();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border p-8"
      >
        <h1 className="text-2xl font-bold mb-4">Set new password</h1>

        <input
          className="w-full border rounded-xl px-4 py-3 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-xl px-4 py-3 mb-3"
          placeholder="Reset code"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full border rounded-xl px-4 py-3 mb-4"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          Reset password
        </button>
      </form>
    </div>
  );
}
