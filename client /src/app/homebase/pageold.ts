// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useCart } from "@/app/context/cartContext";
// import { Product } from "@/types/product";
// //import CartModal from "../checkout/cartModal";
// import { useGetShopDataQuery } from "@/state/api";
// import dynamic from "next/dynamic";

// const CartModal = dynamic(() => import("../checkout/cartModal"), {
//   ssr: false, // Disable SSR if the component depends on the browser environment
//   loading: () => <p>Loading...</p>, // Optional loading fallback
// });

// const Homebase: React.FC = () => {
//   // Hooks are always at the top level
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const { data, isError, isLoading } = useGetShopDataQuery();
//   const { addToCart } = useCart();

//   // Conditional rendering logic
//   if (isLoading) {
//     return <div className="py-4">Loading...</div>;
//   }

//   if (isError || !data) {
//     return (
//       <div className="text-center text-red-500 py-4">
//         Failed to fetch products
//       </div>
//     );
//   }

  
//   const products: Product[] = data.popularProducts || [];

//   // const products: Product[] = data.popularProducts.map((product) => ({
//   //   ...product,
//   //   price: Number(product.price)
//   // }));

//   const handleAddToCart = (product: Product) => {
//     addToCart(product);
//     setIsCartOpen(true);
//   };

//   const handleCloseCart = () => {
//     setIsCartOpen(false);
//   };

//   return (
//     <div>
//       {/* Component content */}
//       <div className="bg-gradient-to-b from-gray-800 via-teal-600 to-gray-800 text-white py-32 px-10 text-center mt-24">
//         <h1 className="text-5xl font-extrabold mb-6">
//           Welcome to Our Spice Store!
//         </h1>
//         <p className="text-xl mb-8">
//           Discover a world of rich flavors and aromatic spices to elevate your
//           cooking.
//         </p>
//         <Link href="#products">
//           <button className="bg-white text-teal-700 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-200 transition-all">
//             Explore Products
//           </button>
//         </Link>
//       </div>

//       {/* Product Section */}
//       <div id="products" className="mx-auto px-10 py-5">
//         <h1 className="text-4xl font-bold text-[#008081] mb-6 text-center">
//           MUST POPULAR
//         </h1>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
//           {products.map((product) => (
//             <div key={product.productId} className="border shadow rounded-md p-4">
//               <Link href={`/homebase/${product.productId}`}>
//                 <h3 className="text-lg text-[#008081] font-semibold">
//                   {product.name}
//                 </h3>
//                 <Image
//                   src={`https://s3-inventorymanagement12.s3.us-east-2.amazonaws.com/product${Math.floor(Math.random() * 3 + 1)}.png`}
//                   alt={product.name}
//                   width={149}
//                   height={250}
//                   className="rounded-2xl"
//                 />
//                 <p className="text-[#008081]">${Number(product.price).toFixed(2)}</p>
//               </Link>
//               <button
//                 onClick={() => handleAddToCart(product)}
//                 className="bg-[#008081] text-white px-4 py-2 mt-4 rounded-lg hover:bg-[#006a6a] transition-all"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           ))}
//         </div>
//         <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />
//       </div>
//     </div>
//   );
// };

// export default Homebase;
