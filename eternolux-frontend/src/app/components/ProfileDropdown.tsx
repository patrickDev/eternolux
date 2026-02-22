// src/app/components/ProfileDropdown.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  ShoppingBag, 
  UserCircle, 
  Heart, 
  LogOut, 
  Mail,
  X,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/");
  };

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Here you would normally send to your backend
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  const lastName = user?.lastName || "Guest";

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40 animate-fadeIn" onClick={onClose} />

      {/* Dropdown Panel */}
      <div
        ref={dropdownRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slideInRight"
        style={{ fontFamily: FONT }}
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium opacity-90">Welcome back,</p>
              <h2 className="text-2xl font-black mt-1">Hi, {lastName}!</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          {user?.email && (
            <p className="text-sm opacity-90">{user.email}</p>
          )}
        </div>

        {/* Newsletter Section */}
        {!subscribed ? (
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm mb-1">
                  Join Our Newsletter
                </h3>
                <p className="text-xs text-gray-600">
                  Get exclusive offers, new arrivals & beauty tips!
                </p>
              </div>
            </div>
            
            <form onSubmit={handleNewsletterSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="font-bold text-green-900 text-sm">Subscribed!</p>
                <p className="text-xs text-green-700">Check your inbox for a welcome offer.</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="p-4">
          <nav className="space-y-1">
            {/* My Account */}
            <button
              onClick={() => handleNavigation("/profile")}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
                <UserCircle size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">My Account</p>
                <p className="text-xs text-gray-500">View and edit your profile</p>
              </div>
            </button>

            {/* Purchases and Returns */}
            <button
              onClick={() => handleNavigation("/orders")}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
                <ShoppingBag size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Purchases & Returns</p>
                <p className="text-xs text-gray-500">Track orders and manage returns</p>
              </div>
            </button>

            {/* Profile */}
            <button
              onClick={() => handleNavigation("/profile/edit")}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
                <User size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Profile</p>
                <p className="text-xs text-gray-500">Update your information</p>
              </div>
            </button>

            {/* Wish List */}
            <button
              onClick={() => handleNavigation("/wishlist")}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
                <Heart size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Wish List</p>
                <p className="text-xs text-gray-500">View your saved items</p>
              </div>
            </button>
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut size={18} className="text-gray-700 group-hover:text-red-600 transition-colors" />
            <span className="font-bold text-sm text-gray-700 group-hover:text-red-600 transition-colors uppercase tracking-widest">
              Sign Out
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
