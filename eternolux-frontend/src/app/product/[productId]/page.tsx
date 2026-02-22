// src/app/product/[productId]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Heart, ShoppingBag, ArrowLeft, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import ProductTile from "@/app/components/ProductTitle";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const { data: product, isLoading, error } = useGetProductByIdQuery(productId);
  const { data: allProducts } = useGetProductsQuery();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const isInWishlist = product ? isWishlisted(product.productId) : false;

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(p => p.category === product.category && p.productId !== product.productId)
      .slice(0, 5);
  }, [product, allProducts]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      images: product.images ?? (product.imageUrl ? [product.imageUrl] : ["/placeholder.png"]),
      imageUrl: product.imageUrl ?? product.images?.[0] ?? "/placeholder.png",
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: FONT }}>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/homebase")}
            className="bg-gray-900 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.imageUrl 
    ? [product.imageUrl] 
    : ["/placeholder.png"];

  // Fixed: Use ?? consistently for all originalPrice references
  const discount = (product.originalPrice ?? 0) > (product.price ?? 0)
    ? Math.round((((product.originalPrice ?? 0) - (product.price ?? 0)) / (product.originalPrice ?? 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: FONT }}>
      
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          <div>
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
                  {discount}% OFF
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-red-600" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">
              {product.category || "Fragrance"}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
            
            {(product.rating ?? 0) > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">({product.reviewCount || 0} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-black text-red-600">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through font-medium">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {product.description && (
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-lg transition-colors">−</button>
                <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-lg transition-colors">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addedToCart}
                className={`flex-1 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  addedToCart ? "bg-green-600 text-white" : product.stock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-red-600 text-white"
                }`}
              >
                {addedToCart ? (<><Check size={20} />Added to Bag</>) : product.stock === 0 ? "Out of Stock" : (<><ShoppingBag size={20} />Add to Bag</>)}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isInWishlist ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                <Heart size={22} fill={isInWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            {product.stock > 0 && product.stock < 10 && (
              <p className="text-sm text-red-600 font-bold mb-6">Only {product.stock} left in stock!</p>
            )}

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              <Feature icon={<Truck size={24} />} text="Free Shipping" />
              <Feature icon={<Shield size={24} />} text="Authentic" />
              <Feature icon={<RotateCcw size={24} />} text="Easy Returns" />
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-gray-200">
            <h2 className="text-3xl font-black text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductTile key={p.productId} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2 text-gray-700">{icon}</div>
      <p className="text-xs font-bold text-gray-600">{text}</p>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: FONT }}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse mb-4" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
