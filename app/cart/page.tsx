"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "../contexts/ShopContext";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";
interface CartRequestBody {
  product_id: string[];
  qty: number[];
  variable_id: string[];
  token?: string;
  cart_id?: string;
}
export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    getTotalPrice,
    getTotalItems,
  } = useShop();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total price
  const subtotal = getTotalPrice();

  // Calculate discount amount
  const discountAmount = appliedCoupon
    ? subtotal * (appliedCoupon.discount / 100)
    : 0;

  // Calculate final price
  const finalTotal = subtotal - discountAmount;

  // Apply coupon code
  const applyCoupon = () => {
    // Simulate coupon validation
    if (couponCode.toLowerCase() === "discount10") {
      setAppliedCoupon({ code: couponCode, discount: 10 });
      setCouponError("");
    } else if (couponCode.toLowerCase() === "discount20") {
      setAppliedCoupon({ code: couponCode, discount: 20 });
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon code");
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Send cart to backend and proceed to checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      // Prepare data for API request
      const productIds = cart.map((item) => item.product._id);
      const quantities = cart.map((item) => item.quantity);
      // For this implementation, we're assuming variable_id is empty
      const variableIds = cart.map(() => "");

      // Get token and cartId from localStorage if available
      let token = null;
      let cartId = null;

      if (typeof window !== "undefined") {
        token = localStorage.getItem("userToken");
        cartId = localStorage.getItem("cartId");
      }

      // Prepare request body

      const requestBody: CartRequestBody = {
        product_id: productIds,
        qty: quantities,
        variable_id: variableIds,
      };

      // Add optional fields if they exist
      if (token) {
        requestBody.token = token;
      }

      if (cartId) {
        requestBody.cart_id = cartId;
      }

      // Send request to backend
      const response = await fetch(`${API_BASE_URL}/order/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to submit cart");
      }

      const data = await response.json();

      // Save cart_id to localStorage
      if (data.cart_id && typeof window !== "undefined") {
        localStorage.setItem("cartId", data.cart_id);
      }

      // Navigate to checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      // Here you could add error handling UI
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-page-bg-primary min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Shopping Cart
          </h1>
          <p className="text-lg text-gray-600 mb-8">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-page-bg-primary min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Total <span className="font-medium">{getTotalItems()}</span>{" "}
                items
              </p>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li
                  key={`${item.product._id}-${item.quantity}`}
                  className="p-4 sm:p-6"
                >
                  <div className="flex items-center sm:items-start">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={
                          item.product.images.length > 0
                            ? item.product.images[0]
                            : "/logo.png"
                        }
                        alt={item.product.name}
                        fill
                        className="object-contain object-center"
                      />
                    </div>

                    <div className="ml-6 flex-1 text-sm">
                      <div className="font-medium text-gray-900 sm:flex sm:justify-between">
                        <h3>{item.product.name}</h3>
                        <p className="mt-1 sm:mt-0">
                          ¥
                          {(
                            (item.product.discount_price * item.quantity) /
                            100
                          ).toFixed(2)}
                        </p>
                      </div>
                      <p className="hidden text-gray-500 sm:block mt-1">
                        {item.product.description}
                      </p>

                      <div className="mt-4 sm:flex sm:items-center">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            type="button"
                            className="p-2 text-gray-600 hover:text-gray-500"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateCartItemQuantity(
                                  item.product._id,
                                  item.quantity - 1
                                );
                              }
                            }}
                          >
                            <span className="sr-only">Decrease</span>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="px-4 py-1 text-center w-12">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="p-2 text-gray-600 hover:text-gray-500"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.product._id,
                                item.quantity + 1
                              )
                            }
                          >
                            <span className="sr-only">Increase</span>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:ml-4">
                          <button
                            type="button"
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                            onClick={() => removeFromCart(item.product._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order summary */}
        <div className="mt-8 lg:mt-0 lg:col-span-4">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>

            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">
                  ¥{subtotal.toFixed(2)}
                </dd>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">
                    Discount ({appliedCoupon.discount}%)
                    <button
                      type="button"
                      className="ml-2 text-xs text-red-600 hover:text-red-500"
                      onClick={removeCoupon}
                    >
                      Remove
                    </button>
                  </dt>
                  <dd className="text-sm font-medium text-red-600">
                    -¥{discountAmount.toFixed(2)}
                  </dd>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-gray-900">
                  ¥{finalTotal.toFixed(2)}
                </dd>
              </div>
            </dl>

            {/* Coupon input */}
            <div className="mt-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="coupon"
                  name="coupon"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="mt-2 text-sm text-red-600">{couponError}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Available coupons: DISCOUNT10, DISCOUNT20
              </p>
            </div>

            {/* Checkout button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-gray-800 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  "结账"
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/products"
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
