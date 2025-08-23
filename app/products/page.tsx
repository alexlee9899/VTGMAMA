"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "../contexts/ShopContext";
import type { Category } from "../contexts/ShopContext";

export default function ProductsPage() {
  const {
    products,
    categories,
    cart,
    loading,
    error,
    selectedCategoryId,
    categoryProducts,
    addToCart,
    setSelectedCategoryId,
    getTotalPrice,
    getTotalItems,
  } = useShop();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cartPopupOpen, setCartPopupOpen] = useState(false);

  const displayProducts = selectedCategoryId ? categoryProducts : products;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="page">
      <main>
        {/* 顶部描述区：图片 + 文案 */}
        <section className="bg-page-bg-primary">
          <div className="container max-w-page mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-10">
            <figure className="overflow-hidden rounded">
              <div className="aspect-[867/488] relative">
                <Image
                  src="/logo.png"
                  alt="des"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <div>
              <h2 className="font-playfair text-3xl mb-3">SALES</h2>
              <p className="font-bai text-base leading-7 text-gray-800 whitespace-pre-line">
                Unearth a treasure trove of designer heritage—each gently worn
                piece tells its own story and is now priced at our Grand Finale
                sale. Rigorously authenticated and elegantly presented, our
                lineup spans iconic handbags, luxury accessories, and fine
                jewelry. From timeless Gucci and YSL to Louis Vuitton, Burberry,
                Chanel, and Hermès, indulge in pre-loved luxury at up to 50%
                off. Elevate your collection with these exclusive finds before
                they’re gone!
              </p>
            </div>
          </div>
        </section>
        <section className="container max-w-page mx-auto px-6 toolbar bg-page-bg-primary">
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div className="toolbar-group">
              <span className="text-gray-700">Sort By</span>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm ml-2">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Most Popular</option>
              </select>
            </div>
            <div className="toolbar-group">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </button>
            </div>
          </div>
        </section>

        <section className="container max-w-page mx-auto px-10 product-grid bg-page-bg-secondary page-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product) => (
              <article
                key={product._id}
                className="max-w-[380px] mx-auto bg-page-bg-primary transition-shadow duration-300"
              >
                <a
                  href={`/products/${product._id}`}
                  className="block aspect-[4/3] flex items-center justify-center p-6"
                >
                  <Image
                    src={product.images[0] || "/logo.png"}
                    alt={product.name}
                    width={280}
                    height={210}
                    className="max-w-full max-h-full object-contain"
                  />
                </a>
                <div className="p-5 text-left">
                  <a
                    href={`/products/${product._id}`}
                    className="product-title text-base font-semibold mb-1 clamp-2 min-h-[40px] hover:underline"
                  >
                    {product.name}
                  </a>
                  {/* {product.description && (
                    <div className="font-opensans text-xs text-gray-500 mb-2 clamp-3 min-h-[54px]">
                      {product.description}
                    </div>
                  )} */}
                  <div className="product-meta text-gray-600 mb-3 text-sm">
                    {(product.discount_price / 100).toLocaleString("en-AU", {
                      style: "currency",
                      currency: "AUD",
                    })}
                  </div>
                  <button
                    className="font-opensans product-cta inline-block bg-transparent text-black hover:text-white py-2 px-0 text-[20px] leading-[1] font-opensans font-semibold underline decoration-solid decoration-offset-0 tracking-normal"
                    onClick={() => addToCart(product)}
                    disabled={product.qty === 0}
                    style={{
                      textDecorationSkipInk: "auto",
                      textDecorationThickness: "0%",
                    }}
                  >
                    {product.qty === 0 ? "Sold Out" : "Add To Cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
