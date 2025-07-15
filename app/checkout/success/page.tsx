"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "../../contexts/ShopContext";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { cart, getTotalPrice } = useShop();

  // Generate random order number
  const orderNumber = React.useMemo(() => {
    return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  // Generate random delivery date (3-5 days later)
  const estimatedDelivery = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(3 + Math.random() * 3));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // If cart is empty, redirect to products page
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/products");
    }
  }, [cart, router]);

  if (cart.length === 0) {
    return null; // Wait for redirect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully
            processed.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          </div>
          <div className="p-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Order Number
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {orderNumber}
                </dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Order Date
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Estimated Delivery Date
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {estimatedDelivery}
                </dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Total Amount
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  ¥{(getTotalPrice() * 1.1).toFixed(2)}
                </dd>
              </div>
              <div className="py-4 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  Payment Status
                </dt>
                <dd className="text-sm font-medium">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Paid
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Purchased Items
            </h2>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li
                key={`${item.product._id}-${item.quantity}`}
                className="p-6 flex"
              >
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-900">
                      ¥
                      {(
                        (item.product.discount_price * item.quantity) /
                        100
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-1 flex text-sm">
                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-6">
            Order confirmation email has been sent to your email address.
            <br />
            If you have any questions, please contact our customer service team.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/products"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
