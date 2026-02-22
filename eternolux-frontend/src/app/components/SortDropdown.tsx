// src/app/components/SortDropdown.tsx
"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "name-az", label: "Name: A-Z" },
  { value: "name-za", label: "Name: Z-A" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="relative" style={{ fontFamily: FONT }}>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
        <ArrowUpDown size={16} />
        Sort by:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-2 px-4 py-2 border-2 border-gray-200 rounded-lg font-bold text-sm focus:outline-none focus:border-red-400 transition-all cursor-pointer bg-white hover:border-gray-300"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
