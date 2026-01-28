"use client";
import React from "react";
import { CartProvider } from "@/app/context/cartContext";
import StoreProvider from "./redux";

const CartProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <CartProvider>{children}</CartProvider>
    </StoreProvider>
  );
};

export default CartProviderWrapper;
