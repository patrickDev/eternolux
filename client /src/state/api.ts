import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stock: number;
  description : string;

}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stock: number;
  description?: string;
}

 export interface CartItem extends Product {
    quantity: number;
  }

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  tagTypes: ["Products", "User"],
  endpoints: (build) => ({
    getShopData: build.query<{ popularProducts: Product[] }, void>({
      query: () => "/shop",
      providesTags: ["Products"],
    }),
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),

    register: build.mutation<
      { token: string },
      {
        fname: string;
        lname: string;
        email: string;
        password: string;
        phone: string;
      }
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    signin: build.mutation<
    {
      token: string;
      user: User;
    },
    { email: string; password: string }
  >({
    query: (body) => ({
      url: "/signin",
      method: "POST",
      body,
    }),
    invalidatesTags: ["User"],
  }),

    logout: build.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    sendResetCode: build.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/auth/send-reset-code",
        method: "POST",
        body,
      }),
    }),

    resetPassword: build.mutation<
      void,
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

export const {
  useGetShopDataQuery,
  useLazyGetProductsQuery,
  useGetProductsQuery,
  useRegisterMutation,
  useSigninMutation,
  useLogoutMutation,
  useSendResetCodeMutation,
  useResetPasswordMutation,
} = api;
