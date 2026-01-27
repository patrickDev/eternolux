"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractErrorMessage = (err: unknown) => {
    // RTK Query errors can be several shapes; handle common ones safely
    if (typeof err === "object" && err !== null) {
      const anyErr = err as any;
      if (typeof anyErr?.data === "string") return anyErr.data;
      if (typeof anyErr?.data?.message === "string") return anyErr.data.message;
      if (typeof anyErr?.error === "string") return anyErr.error;
      if (typeof anyErr?.message === "string") return anyErr.message;
    }
    return "Registration failed. Please try again.";
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

      setSuccessMessage("Account created successfully! Redirecting...");
      setErrors({});

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      });

      // If you want to go to sign-in instead, change this route
      setTimeout(() => router.push("/checkout"), 800);
    } catch (err) {
      setSuccessMessage("");
      const message = extractErrorMessage(err);

      setErrors((prev) => ({
        ...prev,
        email: message.toLowerCase().includes("email") ? message : prev.email,
        form: !message.toLowerCase().includes("email") ? message : "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        {/* next/image cannot use src="" — use a real logo later */}
        <div
          className="w-[60px] h-[60px] rounded bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => router.push("/")}
          aria-label="Go to home"
          role="button"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p>Join EternoLux to continue to checkout</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full border ${
                  errors.firstName ? "border-red-300" : "border-gray-300"
                } rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black`}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full border ${
                  errors.lastName ? "border-red-300" : "border-gray-300"
                } rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black`}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border ${
                errors.email ? "border-red-300" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black`}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border ${
                errors.phone ? "border-red-300" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black`}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border ${
                errors.password ? "border-red-300" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black`}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border ${
                errors.confirmPassword ? "border-red-300" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black`}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/signin" className="font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
