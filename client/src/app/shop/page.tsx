"use client";

import React from "react";
import Image from "next/image";
import { Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/cartContext"; // Ensure path is correct
import type { Product } from "@/app/api/api";
import image1 from "@/state/images/product1.png";

const ProductTile = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative aspect-square mb-6 overflow-hidden rounded-[1.5rem] bg-gray-50">
        <Image
          src={image1} // Use product.imageUrl in production
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
        />
        {/* Quick Add Overlay */}
        <button 
          onClick={() => addToCart(product)}
          className="absolute bottom-4 right-4 h-12 w-12 bg-black text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-red-600 shadow-lg"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-black uppercase tracking-tight truncate w-3/4">
            {product.name}
          </h3>
          <span className="text-xs font-black italic text-red-600">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-2 mb-4">
          {product.description || "Signature Collection"}
        </p>
      </div>

      {/* Main Action Button */}
      <button 
        onClick={() => addToCart(product)}
        className="w-full bg-gray-50 text-black py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-black group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
      >
        <ShoppingBag size={14} /> Add to Collection
      </button>
    </div>
  );
};

export default ProductTile;