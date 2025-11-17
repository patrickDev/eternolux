// app/context/Providers.tsx
'use client';

import React from 'react';
import HomeWrapper from './homeWrapper';
import CartProviderWrapper from './CartProviderWrapper';

import { CartProvider } from "@/app/context/cartContext";
import StoreProvider from "@/app/redux";


const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  // return (
  //   <HomeWrapper>
  //     <CartProviderWrapper>
  //       {children}
  //     </CartProviderWrapper>
  //   </HomeWrapper>
  // );
  return(
    <StoreProvider>
      <CartProvider>{children}</CartProvider>
    </StoreProvider>
  )
};

export default ProvidersWrapper;
