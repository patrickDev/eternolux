// src/store/api.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Product,
  ApiProductsResponse,
  ApiProductResponse,
} from "@/app/types/product.types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api-wwd.eternolux.com";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Products", "Product", "Wishlist", "Profile", "Orders"],
  endpoints: (builder) => ({

    // ── PRODUCTS ─────────────────────────────────────────────
    getProducts: builder.query<Product[], void>({
      query: () => "/api/products",
      transformResponse: (raw: ApiProductsResponse): Product[] => {
        if (!Array.isArray(raw?.products)) return [];
        return raw.products.map(normalizeProduct);
      },
      providesTags: ["Products"],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/api/products/${id}`,
      transformResponse: (raw: ApiProductResponse): Product => {
        if (raw?.product) return normalizeProduct(raw.product);
        return normalizeProduct(raw as any);
      },
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    // ── SEARCH ───────────────────────────────────────────────
    // GET /api/search?search=query&category=...&minPrice=...&maxPrice=...
    searchProducts: builder.query<Product[], {
      search:    string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    }>({
      query: ({ search, category, minPrice, maxPrice }) => {
        const params = new URLSearchParams({ search });
        if (category) params.set("category", category);
        if (minPrice !== undefined) params.set("minPrice", String(minPrice));
        if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
        return `/api/search?${params.toString()}`;
      },
      transformResponse: (raw: any): Product[] => {
        // Handle both { products: [...] } and { results: [...] } shapes
        const list = raw?.products || raw?.results || raw?.data || raw;
        if (!Array.isArray(list)) return [];
        return list.map(normalizeProduct);
      },
      providesTags: ["Products"],
    }),

    // ── WISHLIST ─────────────────────────────────────────────
    // GET  /api/users/:userId/wishlist
    getWishlist: builder.query<Product[], string>({
      query: (userId) => `/api/users/${userId}/wishlist`,
      transformResponse: (raw: any): Product[] => {
        const list = raw?.wishlist || raw?.products || raw?.data || raw;
        if (!Array.isArray(list)) return [];
        return list.map((item: any) => {
          // Wishlist items may have product nested inside
          const p = item.product || item;
          return normalizeProduct(p);
        });
      },
      providesTags: ["Wishlist"],
    }),

    // POST /api/users/:userId/wishlist { productId }
    addToWishlist: builder.mutation<void, { userId: string; productId: string }>({
      query: ({ userId, productId }) => ({
        url:    `/api/users/${userId}/wishlist`,
        method: "POST",
        body:   { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // DELETE /api/users/:userId/wishlist/:productId
    removeFromWishlist: builder.mutation<void, { userId: string; productId: string }>({
      query: ({ userId, productId }) => ({
        url:    `/api/users/${userId}/wishlist/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // ── PROFILE ──────────────────────────────────────────────
    // GET /api/users/:userId
    getProfile: builder.query<any, string>({
      query: (userId) => `/api/users/${userId}`,
      transformResponse: (raw: any) => raw?.user || raw,
      providesTags: ["Profile"],
    }),

    // PUT /api/users/:userId
    updateProfile: builder.mutation<any, { userId: string; data: any }>({
      query: ({ userId, data }) => ({
        url:    `/api/users/${userId}`,
        method: "PUT",
        body:   data,
      }),
      invalidatesTags: ["Profile"],
    }),

    // PUT /api/users/:userId/password
    changePassword: builder.mutation<any, {
      userId:      string;
      currentPassword: string;
      newPassword: string;
    }>({
      query: ({ userId, currentPassword, newPassword }) => ({
        url:    `/api/users/${userId}/password`,
        method: "PUT",
        body:   { currentPassword, newPassword },
      }),
    }),

    // ── ORDERS ───────────────────────────────────────────────
    // GET /api/users/:userId/orders
    getOrders: builder.query<any[], string>({
      query: (userId) => `/api/users/${userId}/orders`,
      transformResponse: (raw: any) => raw?.orders || raw?.data || raw || [],
      providesTags: ["Orders"],
    }),
  }),
});

// ─────────────────────────────────────────────────────────────
// fixImageUrl & normalizeProduct
// ─────────────────────────────────────────────────────────────
function fixImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  if (url.includes("images.eternolux.com")) return url;
  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=800&q=80&fm=webp&fit=crop&auto=format`;
  }
  return url;
}

function normalizeProduct(p: any): Product {
  const rawPrimary =
    p.imageUrl  ?? p.image_url ?? p.image ?? p.thumbnail ??
    (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null);

  const imageUrl = fixImageUrl(rawPrimary);

  const images: string[] = [];
  if (imageUrl) images.push(imageUrl);
  if (Array.isArray(p.images)) {
    for (const img of p.images) {
      const fixed = fixImageUrl(img);
      if (fixed && !images.includes(fixed)) images.push(fixed);
    }
  }

  const dimensions = p.dimensions
    ? typeof p.dimensions === "string" ? JSON.parse(p.dimensions) : p.dimensions
    : null;

  const tags: string[] | null = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === "string" ? JSON.parse(p.tags) : null;

  return {
    productId:         p.productId    || p.product_id || p.id || "",
    name:              p.name         || "Unnamed",
    description:       p.description  ?? null,
    sku:               p.sku          || "",
    brand:             p.brand        ?? null,
    category:          p.category     || "",
    tags,
    price:             Number(p.price         ?? 0),
    originalPrice:     p.originalPrice  != null ? Number(p.originalPrice)  : null,
    costPrice:         p.costPrice      != null ? Number(p.costPrice)      : null,
    stock:             Number(p.stock         ?? 0),
    lowStockThreshold: p.lowStockThreshold != null ? Number(p.lowStockThreshold) : null,
    imageUrl,
    images,
    weight:            p.weight     != null ? Number(p.weight) : null,
    dimensions,
    rating:            p.rating      != null ? Number(p.rating)      : null,
    reviewCount:       p.reviewCount != null ? Number(p.reviewCount) : null,
    sellerId:          p.sellerId    ?? null,
    status:            p.status      || "active",
    isFeatured:        Boolean(p.isFeatured),
    slug:              p.slug            ?? null,
    metaTitle:         p.metaTitle       ?? p.meta_title       ?? null,
    metaDescription:   p.metaDescription ?? p.meta_description ?? null,
    views:             p.views     != null ? Number(p.views)     : null,
    purchases:         p.purchases != null ? Number(p.purchases) : null,
    createdAt:         p.createdAt  || p.created_at || "",
    updatedAt:         p.updatedAt  ?? p.updated_at ?? null,
  };
}

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetOrdersQuery,
} = api;
