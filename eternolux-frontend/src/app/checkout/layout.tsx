// eternolux-frontend/src/app/checkout/layout.tsx
// CHECKOUT LAYOUT - Hides navbar

import React from 'react';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* No navbar here - checkout has its own header */}
      {children}
    </div>
  );
}
