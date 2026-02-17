// src/app/profile/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Lock, MapPin, ShoppingBag,
  Check, Eye, EyeOff, Plus, Trash2,
  ChevronRight, Package, ArrowRight,
  AlertCircle,
} from "lucide-react";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

type Tab = "account" | "password" | "addresses" | "orders";

// ── Placeholder data (replace with real auth/API) ─────────
const MOCK_USER = {
  firstName: "Alex",
  lastName:  "Johnson",
  email:     "alex.johnson@email.com",
  phone:     "+1 (555) 234-5678",
};

const MOCK_ORDERS = [
  { orderId: "EL-928471", date: "Feb 14, 2026", status: "Delivered",  total: 399.98, items: 2 },
  { orderId: "EL-847231", date: "Feb 01, 2026", status: "Processing", total: 249.99, items: 1 },
  { orderId: "EL-773920", date: "Jan 18, 2026", status: "Delivered",  total: 579.97, items: 3 },
];

const MOCK_ADDRESSES = [
  { id: "addr-1", label: "Home",   line1: "123 Luxury Lane",  city: "Beverly Hills", state: "CA", zip: "90210", isDefault: true  },
  { id: "addr-2", label: "Office", line1: "456 Business Ave", city: "Los Angeles",   state: "CA", zip: "90001", isDefault: false },
];

const STATUS_STYLES: Record<string, string> = {
  "Delivered":  "bg-green-50 text-green-700",
  "Processing": "bg-yellow-50 text-yellow-700",
  "Shipped":    "bg-blue-50 text-blue-700",
  "Cancelled":  "bg-red-50 text-red-600",
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "account",   label: "Account Info",     icon: User      },
    { id: "password",  label: "Change Password",  icon: Lock      },
    { id: "addresses", label: "Saved Addresses",  icon: MapPin    },
    { id: "orders",    label: "Order History",    icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: FONT }}>

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-6xl py-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 mb-1">My Account</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Welcome back, {MOCK_USER.firstName}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar Nav ─────────────────────────────── */}
          <aside className="md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              {TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all text-left ${
                    i < TABS.length - 1 ? "border-b border-gray-100" : ""
                  } ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab !== tab.id && (
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  )}
                </button>
              ))}
            </nav>

            {/* Sign out */}
            <button
              onClick={() => router.push("/")}
              className="w-full mt-3 px-5 py-3.5 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-bold uppercase tracking-widest hover:border-red-400 hover:text-red-500 transition-all"
            >
              Sign Out
            </button>
          </aside>

          {/* ── Content ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ACCOUNT INFO */}
            {activeTab === "account" && <AccountTab user={MOCK_USER} />}

            {/* CHANGE PASSWORD */}
            {activeTab === "password" && <PasswordTab />}

            {/* SAVED ADDRESSES */}
            {activeTab === "addresses" && <AddressesTab addresses={MOCK_ADDRESSES} />}

            {/* ORDER HISTORY */}
            {activeTab === "orders" && <OrdersTab orders={MOCK_ORDERS} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACCOUNT TAB
═══════════════════════════════════════════════════════════ */
function AccountTab({ user }: { user: typeof MOCK_USER }) {
  const [form,    setForm]    = useState(user);
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    // TODO: call updateProfile mutation
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-lg font-black text-gray-900 mb-6">Personal Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First Name" value={form.firstName}
          onChange={(v) => setForm({ ...form, firstName: v })} />
        <Field label="Last Name" value={form.lastName}
          onChange={(v) => setForm({ ...form, lastName: v })} />
        <Field label="Email Address" value={form.email} type="email"
          onChange={(v) => setForm({ ...form, email: v })} className="sm:col-span-2" />
        <Field label="Phone Number" value={form.phone} type="tel"
          onChange={(v) => setForm({ ...form, phone: v })} className="sm:col-span-2" />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
            saved ? "bg-green-600 text-white" : "bg-gray-900 hover:bg-red-600 text-white"
          }`}
        >
          {saved ? <><Check size={14} /> Saved!</> : "Save Changes"}
        </button>
        <button onClick={() => setForm(user)}
          className="text-sm font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PASSWORD TAB
═══════════════════════════════════════════════════════════ */
function PasswordTab() {
  const [form,    setForm]    = useState({ current: "", next: "", confirm: "" });
  const [show,    setShow]    = useState({ current: false, next: false, confirm: false });
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = () => {
    setError("");
    if (form.next.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.next !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    // TODO: call changePassword mutation
    setSaved(true);
    setForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setSaved(false), 2500);
  };

  const strength = form.next.length === 0 ? 0
    : form.next.length < 6  ? 1
    : form.next.length < 10 ? 2 : 3;

  const strengthColors = ["bg-gray-200", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-lg font-black text-gray-900 mb-6">Change Password</h2>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="space-y-5">
        <PasswordField label="Current Password" value={form.current}
          show={show.current} onToggle={() => setShow({ ...show, current: !show.current })}
          onChange={(v) => setForm({ ...form, current: v })} />

        <PasswordField label="New Password" value={form.next}
          show={show.next} onToggle={() => setShow({ ...show, next: !show.next })}
          onChange={(v) => setForm({ ...form, next: v })} />

        {/* Strength meter */}
        {form.next.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  strength >= s ? strengthColors[strength] : "bg-gray-200"}`} />
              ))}
            </div>
            <p className={`text-xs font-bold ${
              strength === 1 ? "text-red-500" : strength === 2 ? "text-yellow-600" : "text-green-600"
            }`}>{strengthLabels[strength]}</p>
          </div>
        )}

        <PasswordField label="Confirm New Password" value={form.confirm}
          show={show.confirm} onToggle={() => setShow({ ...show, confirm: !show.confirm })}
          onChange={(v) => setForm({ ...form, confirm: v })} />
      </div>

      <button onClick={handleSave}
        className={`mt-8 flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
          saved ? "bg-green-600 text-white" : "bg-gray-900 hover:bg-red-600 text-white"
        }`}
      >
        {saved ? <><Check size={14} /> Password Updated!</> : "Update Password"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADDRESSES TAB
═══════════════════════════════════════════════════════════ */
function AddressesTab({ addresses: init }: { addresses: typeof MOCK_ADDRESSES }) {
  const [addresses, setAddresses] = useState(init);
  const [adding,    setAdding]    = useState(false);
  const [newAddr,   setNewAddr]   = useState({ label: "", line1: "", city: "", state: "", zip: "" });

  const handleAdd = () => {
    if (!newAddr.line1 || !newAddr.city) return;
    setAddresses((prev) => [...prev, {
      id: `addr-${Date.now()}`,
      ...newAddr,
      isDefault: prev.length === 0,
    }]);
    setNewAddr({ label: "", line1: "", city: "", state: "", zip: "" });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div key={addr.id} className={`bg-white rounded-xl border p-5 flex items-start justify-between gap-4 shadow-sm ${
          addr.isDefault ? "border-red-300" : "border-gray-100"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              addr.isDefault ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              <MapPin size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-black text-gray-900">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-600 rounded-full uppercase tracking-widest">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{addr.line1}</p>
              <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
            </div>
          </div>
          <button
            onClick={() => setAddresses((prev) => prev.filter((a) => a.id !== addr.id))}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {/* Add new address */}
      {adding ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900">New Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Label (Home, Office...)" value={newAddr.label}
              onChange={(v) => setNewAddr({ ...newAddr, label: v })} className="col-span-2" />
            <Field label="Street Address" value={newAddr.line1}
              onChange={(v) => setNewAddr({ ...newAddr, line1: v })} className="col-span-2" />
            <Field label="City"  value={newAddr.city}  onChange={(v) => setNewAddr({ ...newAddr, city: v })} />
            <Field label="State" value={newAddr.state} onChange={(v) => setNewAddr({ ...newAddr, state: v })} />
            <Field label="ZIP Code" value={newAddr.zip} onChange={(v) => setNewAddr({ ...newAddr, zip: v })} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd}
              className="px-6 py-2.5 bg-gray-900 hover:bg-red-600 text-white rounded-full text-sm font-black uppercase tracking-widest transition-all">
              Save Address
            </button>
            <button onClick={() => setAdding(false)}
              className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 rounded-full text-sm font-bold uppercase tracking-widest hover:border-gray-400 transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-red-400 hover:text-red-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add New Address
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ORDERS TAB
═══════════════════════════════════════════════════════════ */
function OrdersTab({ orders }: { orders: typeof MOCK_ORDERS }) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <Package size={48} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
        <h3 className="text-lg font-black text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 text-sm mb-6">When you place an order, it will appear here.</p>
        <button onClick={() => router.push("/homebase")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all">
          Start Shopping <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.orderId}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-300 transition-all cursor-pointer"
          onClick={() => {}}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                Order #{order.orderId}
              </p>
              <p className="text-sm text-gray-600">{order.date} · {order.items} {order.items === 1 ? "item" : "items"}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-900">${order.total.toFixed(2)}</p>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}>
                {order.status}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <button className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1">
              View Details <ChevronRight size={13} />
            </button>
            {order.status === "Delivered" && (
              <button className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors">
                Reorder
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REUSABLE FIELD COMPONENTS
═══════════════════════════════════════════════════════════ */
function Field({ label, value, onChange, type = "text", className = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
      />
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 pr-11 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
