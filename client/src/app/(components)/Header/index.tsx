import React from "react";
import Link from "next/link"; // Ensure Link is imported

type HeaderProps = {
  name: string;
};

const Header = ({ name }: HeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        {/* Brand Identity inside Header */}
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
          EternoLux Official
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
          {name}
        </h1>
      </div>

      {/* Quick Navigation Links */}
      <nav className="flex items-center gap-6">
        <Link 
          href="/shop" 
          className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black hover:underline underline-offset-8 transition"
        >
          Shop
        </Link>
        <Link 
          href="/contact" 
          className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black hover:underline underline-offset-8 transition"
        >
          Contact
        </Link>
      </nav>
    </div>
  );
};

export default Header;