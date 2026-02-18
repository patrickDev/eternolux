// src/app/components/RegisterModal.tsx
"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff, AlertCircle, Loader2, User, Mail, Phone, Lock, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface RegisterModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    password:  "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);

  // ── Password validation (matches backend) ───────────────
  const validatePassword = (pwd: string): { strength: number; errors: string[] } => {
    const errors: string[] = [];
    let score = 0;

    if (pwd.length < 8) {
      errors.push("Must be at least 8 characters");
    } else {
      score += 1;
      if (pwd.length >= 12) score += 1;
      if (pwd.length >= 16) score += 1;
    }

    if (!/[A-Z]/.test(pwd)) {
      errors.push("Must contain uppercase letter");
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(pwd)) {
      errors.push("Must contain lowercase letter");
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(pwd)) {
      errors.push("Must contain number");
    } else {
      score += 1;
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      score += 1;
    }

    const commonPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(pwd.toLowerCase())) {
      errors.push("Password is too common");
      score = 0;
    }

    return { strength: score, errors };
  };

  const passwordValidation = form.password ? validatePassword(form.password) : { strength: 0, errors: [] };
  const passwordStrength = passwordValidation.strength <= 3 ? 1 : passwordValidation.strength <= 5 ? 2 : 3;

  const strengthColors = ["bg-gray-200", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordErrors([]);

    // Frontend validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordValidation.errors.length > 0) {
      setError("Password does not meet requirements");
      setPasswordErrors(passwordValidation.errors);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    const result = await register({
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      phone:     form.phone,
      password:  form.password,
    });
    setIsLoading(false);

    if (result.success) {
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
      onClose();
    } else {
      setError(result.error || "Registration failed");
      if (result.errors) {
        setPasswordErrors(result.errors);
      }
    }
  };

  const handleSwitch = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
    setError("");
    setPasswordErrors([]);
    onSwitchToLogin();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={onClose}
      style={{ fontFamily: FONT }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-600 to-red-700 text-white p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
          <h2 className="text-2xl font-black mb-1">Join EternoLux</h2>
          <p className="text-sm text-red-100">Create your account and start shopping</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
              <div className="flex items-start gap-2 text-red-600 text-sm mb-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="font-bold">{error}</span>
              </div>
              {passwordErrors.length > 0 && (
                <ul className="ml-6 mt-2 space-y-1">
                  {passwordErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-600">• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                First Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength meter */}
            {form.password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      passwordStrength >= s ? strengthColors[passwordStrength] : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className={`text-xs font-bold ${
                  passwordStrength === 1 ? "text-red-500" : passwordStrength === 2 ? "text-yellow-600" : "text-green-600"
                }`}>{strengthLabels[passwordStrength]}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-green-600 mt-2">
                <Check size={12} /> Passwords match
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gray-900 hover:bg-red-600 text-white rounded-full text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleSwitch}
                className="font-bold text-red-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
