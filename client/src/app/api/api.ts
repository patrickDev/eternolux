import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* =======================
   Product Types
======================= */

export interface Product {
  productId: string;
  name: string;
  description?: string | null;
  price: string; // SQLite/Drizzle stores decimals as TEXT
  rating?: number | null;
  stock: number;
  imageUrl?: string | null;
  createdAt?: string;
}

export interface NewProduct {
  name: string;
  description?: string;
  price: string;
  rating?: number;
  stock: number;
  imageUrl?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

/* =======================
   User / Auth Types
======================= */

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt?: string;
}

export type AuthResponse = {
  user: User;
  message?: string;
};

type ProductsResponse = {
  products: Product[];
};

/* =======================
   API Slice
======================= */

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api", // ✅ consistent base
    credentials: "include", // 🔐 HttpOnly cookies
  }),
  tagTypes: ["Products", "User"],
  endpoints: (builder) => ({
    /* ---------- PRODUCTS ---------- */

    getProducts: builder.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : undefined,
      }),
      transformResponse: (response: ProductsResponse) => response.products,
      providesTags: ["Products"],
    }),

    /* ---------- AUTH ---------- */

    register: builder.mutation<
      { message: string },
      {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone: string;
      }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    signin: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    me: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    logout: builder.mutation<{ message?: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    /* ---------- PASSWORD RESET ---------- */

    sendResetCode: builder.mutation<{ message?: string }, { email: string }>({
      query: (body) => ({
        url: "/auth/send-reset-code",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { message?: string },
      { email: string; resetCode: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

/* =======================
   Hooks
======================= */

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,

  useRegisterMutation,
  useSigninMutation,
  useMeQuery,
  useLogoutMutation,

  useSendResetCodeMutation,
  useResetPasswordMutation,
} = api;
