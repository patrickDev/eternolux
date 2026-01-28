import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  CSSProperties,
} from "react";
import { CartItem } from "@/app/api/api";
import { Product } from "@/app/api/api";

// Context Type
interface CartContextType {
  cartItems: CartItem[];
  cartTotalCount: number;
  cartTotalAmount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Style for white background and black text
const containerStyle: CSSProperties = {
  backgroundColor: "white",
  color: "black",
  minHeight: "100vh",
  padding: "1rem",
  fontFamily: "Arial, sans-serif",
};

// Cart Provider Component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartTotalCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotalAmount = useMemo(
    () =>
      cartItems.reduce((total, item) => total +Number(item.quantity) * Number(item.price), 0),
    [cartItems]
  );

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === product.productId
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  const incrementQuantity = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item
      )
    );
  };

  const decrementQuantity = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotalCount,
        cartTotalAmount,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
      }}
    >
      <div style={containerStyle}>{children}</div>
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
