"use client";

import React from "react";
import Image from "next/image";

// 假数据：商品
const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description:
      "Experience crystal-clear sound with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design.",
    price: 199.99,
    image: "/logo.png",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    description:
      "Work in comfort with our ergonomic office chair. Designed to support proper posture, reduce back pain, and provide all-day comfort for your home office.",
    price: 249.99,
    image: "/logo.png",
    category: "Furniture",
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    description:
      "Track your fitness goals with our advanced smart watch. Features heart rate monitoring, sleep tracking, step counter, and over 20 exercise modes.",
    price: 129.99,
    image: "/logo.png",
    category: "Electronics",
  },
  {
    id: 4,
    name: "Organic Cotton T-Shirt",
    description:
      "Stay comfortable in our premium organic cotton t-shirt. Ethically sourced materials, breathable fabric, and available in multiple colors.",
    price: 34.99,
    image: "/logo.png",
    category: "Clothing",
  },
  {
    id: 5,
    name: "Professional Chef Knife Set",
    description:
      "Elevate your cooking with our professional-grade chef knife set. Includes 8-inch chef knife, santoku knife, paring knife, and sharpening steel.",
    price: 89.99,
    image: "/logo.png",
    category: "Kitchen",
  },
  {
    id: 6,
    name: "Portable Bluetooth Speaker",
    description:
      "Take your music anywhere with our waterproof, portable Bluetooth speaker. 20-hour battery life, immersive 360° sound, and rugged design for outdoor use.",
    price: 79.99,
    image: "/logo.png",
    category: "Electronics",
  },
  {
    id: 7,
    name: "Natural Bamboo Cutting Board",
    description:
      "Chop ingredients in style with our premium bamboo cutting board. Naturally antibacterial, easy on knives, and includes juice groove and handles.",
    price: 42.99,
    image: "/logo.png",
    category: "Kitchen",
  },
  {
    id: 8,
    name: "Professional DSLR Camera",
    description:
      "Capture stunning photos with our professional DSLR camera. 24.1 megapixel sensor, 4K video recording, and includes 18-55mm lens kit.",
    price: 899.99,
    image: "/logo.png",
    category: "Electronics",
  },
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative h-48 w-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-4"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                  {product.category}
                </span>
              </div>
              <button className="mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
