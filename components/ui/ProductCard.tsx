"use client";

import React from "react";
import Image from "next/image";

interface Product {
  id: number;
  brand: string;
  name: string;
  price: string;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  return (
    <article className="product-card bg-product-bg rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="product-media aspect-square bg-white flex items-center justify-center p-8">
        {product.image ? (
          <Image
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            width={200}
            height={200}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">Product Image</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="product-title text-lg font-semibold mb-2">
          {product.brand}
        </h3>
        <div className="product-meta text-gray-600 mb-4">
          {product.name} <br /> {product.price}
        </div>
        <button
          onClick={handleAddToCart}
          className="product-cta w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors duration-200"
        >
          Add To Cart
        </button>
      </div>
    </article>
  );
}
