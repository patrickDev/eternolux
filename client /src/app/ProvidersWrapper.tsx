'use client';

import React from 'react';
import StoreProvider from "@/app/redux";
import { CartProvider } from "@/app/context/cartContext";
import { UserProvider } from "@/app/context/userContext";

const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <UserProvider> {/* 👈 Wrap with UserProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </UserProvider>
    </StoreProvider>
  );
};

export default ProvidersWrapper;
