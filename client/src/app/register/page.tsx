"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowLeft } from "lucide-react";

import { useRegisterMutation } from "@/app/api/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters required";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.phone.trim() || !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Valid phone number required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      }).unwrap();

      setSuccessMessage("Account created! Opening the vault...");
      setTimeout(() => router.push("/shop"), 1000);
    } catch (err: any) {
      const message = err?.data?.message || "Registration failed.";
      setErrors({ form: message });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl">
        
        {/* Back Navigation */}
        <button
          onClick={() => router.push("/")}
          className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition"
        >
          <ArrowLeft size={14} /> Back to Collection
        </button>

        {/* Brand Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="h-12 w-12 bg-black flex items-center justify-center rounded-xl mb-4 shadow-xl">
            <span className="text-white font-black text-2xl italic leading-none">E</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Join <br /> <span className="text-gray-400">EternoLux</span>
          </h1>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Become a member of the circle
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full p-8 md:p-12 border border-gray-100">
          
          {successMessage && (
            <div className="mb-6 p-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-pulse">
              {successMessage}
            </div>
          )}

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold uppercase text-center border border-red-100">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="text" id="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-3 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
                {errors.firstName && <p className="text-[10px] font-bold text-red-500 italic ml-4">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="text" id="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-3 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
                {errors.lastName && <p className="text-[10px] font-bold text-red-500 italic ml-4">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Identity (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="email" id="email" value={formData.email} onChange={handleChange}
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-3 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-red-500 italic ml-4">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="tel" id="phone" value={formData.phone} onChange={handleChange}
                  className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-3 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                />
              </div>
              {errors.phone && <p className="text-[10px] font-bold text-red-500 italic ml-4">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="password" id="password" value={formData.password} onChange={handleChange}
                    className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-3 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500 italic ml-4">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className="w-full rounded-full border-2 border-gray-50 bg-gray-50 px-12 py-3 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
                {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 italic ml-4">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Validating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-10 text-center pt-6 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Already a member?</p>
            <Link href="/signin" className="text-sm font-black italic uppercase tracking-tighter border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition">
              Sign In to Your Account
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          © {new Date().getFullYear()} EternoLux Business Group
        </p>
      </div>
    </div>
  );
}