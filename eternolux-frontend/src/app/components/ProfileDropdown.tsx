// src/app/components/ProfileDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Heart, ShoppingBag, Package, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface ProfileDropdownProps {
  onOpenLogin:    () => void;
  onOpenRegister: () => void;
}

export default function ProfileDropdown({ onOpenLogin, onOpenRegister }: ProfileDropdownProps) {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ fontFamily: FONT }}
    >
      {/* Trigger Button */}
      <button className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-red-600 transition-colors">
        <User size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-semibold tracking-wide">Account</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
          
          {/* NOT LOGGED IN */}
          {!isLoggedIn && (
            <div className="p-5">
              <h3 className="text-base font-black text-gray-900 mb-2">Welcome to EternoLux</h3>
              <p className="text-xs text-gray-500 mb-5">
                Sign in to access your wishlist, orders, and exclusive benefits.
              </p>

              {/* Sign In */}
              <button
                onClick={() => { setIsOpen(false); onOpenLogin(); }}
                className="w-full py-3 bg-gray-900 hover:bg-red-600 text-white rounded-full text-sm font-black uppercase tracking-widest transition-all mb-2.5"
              >
                Sign In
              </button>

              {/* Create Account */}
              <button
                onClick={() => { setIsOpen(false); onOpenRegister(); }}
                className="w-full py-3 border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
              >
                Create Account
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Quick Links</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Guest Links */}
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate("/homebase")}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-all"
                >
                  <span className="font-medium">Shop All</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => handleNavigate("/homebase?filter=new")}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-all"
                >
                  <span className="font-medium">New Arrivals</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* LOGGED IN */}
          {isLoggedIn && user && (
            <div>
              {/* User Header */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={22} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest font-bold opacity-90">Welcome back</p>
                    <p className="text-base font-black truncate">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <MenuItem
                  icon={User}
                  label="My Profile"
                  onClick={() => handleNavigate("/profile")}
                />
                <MenuItem
                  icon={Heart}
                  label="Wishlist"
                  onClick={() => handleNavigate("/wishlist")}
                />
                <MenuItem
                  icon={Package}
                  label="Orders"
                  onClick={() => handleNavigate("/profile?tab=orders")}
                />
                <MenuItem
                  icon={ShoppingBag}
                  label="Shop All"
                  onClick={() => handleNavigate("/homebase")}
                />

                {/* Divider */}
                <div className="h-px bg-gray-100 my-2" />

                {/* Sign Out */}
                <MenuItem
                  icon={LogOut}
                  label="Sign Out"
                  onClick={handleLogout}
                  danger
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MENU ITEM
═══════════════════════════════════════════════════════════ */
function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
      }`}
    >
      <Icon size={16} strokeWidth={2} />
      <span className="flex-1 text-left">{label}</span>
      {!danger && <ChevronRight size={13} className="text-gray-300" />}
    </button>
  );
}
