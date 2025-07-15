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

  // Mobile category filter state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Cart popup state
  const [cartPopupOpen, setCartPopupOpen] = useState(false);

  // Get products to display
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

  const renderCategoryItem = (category: Category) => {
    return (
      <div key={category._id} className="py-1">
        <button
          onClick={() => setSelectedCategoryId(category._id)}
          className={`flex w-full items-center text-sm text-left py-2 px-2 hover:bg-gray-100 ${
            selectedCategoryId === category._id
              ? "font-medium text-gray-900"
              : "text-gray-600"
          }`}
        >
          {category.name}
        </button>
        {category.childs && category.childs.length > 0 && (
          <div className="ml-4 border-l border-gray-200 pl-2 mt-1">
            {category.childs.map(renderCategoryItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <div
          className={`relative z-40 lg:hidden ${
            mobileFiltersOpen ? "" : "hidden"
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/25"
            aria-hidden="true"
            onClick={() => setMobileFiltersOpen(false)}
          ></div>

          <div className="fixed inset-0 z-40 flex">
            <div className="relative ml-auto flex size-full max-w-xs flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Categories
                </h2>
                <button
                  type="button"
                  className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="absolute -inset-0.5"></span>
                  <span className="sr-only">Close menu</span>
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Category navigation */}
              <form className="mt-4 border-t border-gray-200">
                <h3 className="sr-only">Categories</h3>
                <div className="px-4 py-3">
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className={`block w-full text-left px-2 py-3 ${
                      !selectedCategoryId
                        ? "font-medium text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map(renderCategoryItem)}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Cart popup */}
        <div
          className={`fixed bottom-4 right-4 z-50 ${
            cartPopupOpen ? "block" : "hidden"
          }`}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 w-72 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Cart</h2>
              <button
                onClick={() => setCartPopupOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-gray-600 mb-3">
              {getTotalItems()} items | Total: ¥{getTotalPrice().toFixed(2)}
            </div>
            <Link href="/cart" className="block w-full">
              <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors">
                View Cart
              </button>
            </Link>
          </div>
        </div>

        {/* Cart floating button */}
        <button
          onClick={() => setCartPopupOpen(!cartPopupOpen)}
          className="fixed bottom-4 right-4 z-40 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
        >
          <div className="relative">
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {getTotalItems()}
              </span>
            )}
          </div>
        </button>

        <main className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pt-24 pb-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              {selectedCategoryId
                ? `${
                    categories.find((c) => c._id === selectedCategoryId)
                      ?.name || "Category"
                  } Products`
                : "All Products"}
            </h1>

            <div className="flex items-center">
              <button
                type="button"
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filter</span>
                <svg
                  className="size-5"
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Category filter - Desktop, left side */}
            <div className="hidden lg:block w-64 shrink-0 border-r border-gray-200 pr-4">
              <div className="sticky top-24 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-4">
                  <div className="py-1">
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className={`text-sm w-full text-left ${
                        !selectedCategoryId
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      All Products
                    </button>
                  </div>
                  {categories.map(renderCategoryItem)}
                </div>
              </div>
            </div>

            {/* Product display area */}
            <div className="w-full lg:pl-8">
              <section
                aria-labelledby="products-heading"
                className="pt-6 pb-24"
              >
                <h2 id="products-heading" className="sr-only">
                  Products
                </h2>

                {/* Product grid */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            product.images.length > 0
                              ? product.images[0]
                              : "/logo.png"
                          }
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain p-4"
                        />
                      </div>
                      <div className="p-4">
                        <h2 className="text-xl font-semibold mb-2">
                          {product.name}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-lg font-bold text-red-600">
                              ¥{(product.discount_price / 100).toFixed(2)}
                            </span>
                            {product.base_price !== product.discount_price && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ¥{(product.base_price / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                            Stock: {product.qty}
                          </span>
                        </div>
                        <button
                          className="mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                          onClick={() => addToCart(product)}
                          disabled={product.qty === 0}
                        >
                          {product.qty === 0 ? "Sold Out" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
