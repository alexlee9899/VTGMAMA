"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useShop } from "../contexts/ShopContext";
import { API_BASE_URL } from "@/lib/config";

// addressBody类型
interface AddressBody {
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  is_default: boolean;
  token?: string;
}

// orderBody类型
interface OrderBody {
  cart_id: string | null;
  address_id: string | null;
  payment_method: string;
  discount_id?: string | null;
  token?: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice } = useShop();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"personal" | "payment">(
    "personal"
  );

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "NSW",
    postcode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "Credit Card",
  });

  // Form error state
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postcode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "",
  });

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear corresponding error message
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate personal information and shipping address
  const validatePersonalInfo = () => {
    let isValid = true;
    const errors = { ...formErrors };

    if (!formData.firstName.trim()) {
      errors.firstName = "Please enter first name";
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Please enter last name";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = "Please enter email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = "Please enter phone number";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid Australian phone number";
      isValid = false;
    }
    if (!formData.street.trim()) {
      errors.street = "Please enter street address";
      isValid = false;
    }
    if (!formData.city.trim()) {
      errors.city = "Please enter city";
      isValid = false;
    }
    if (!formData.postcode.trim()) {
      errors.postcode = "Please enter postcode";
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.postcode)) {
      errors.postcode = "Please enter a valid Australian postcode";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  // Validate payment information
  const validatePaymentInfo = () => {
    let isValid = true;
    const errors = { ...formErrors };
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = "Please enter card number";
      isValid = false;
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Please enter a valid 16-digit card number";
      isValid = false;
    }
    if (!formData.cardName.trim()) {
      errors.cardName = "Please enter cardholder name";
      isValid = false;
    }
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = "Please enter expiry date";
      isValid = false;
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = "Please use MM/YY format";
      isValid = false;
    }
    if (!formData.cvv.trim()) {
      errors.cvv = "Please enter CVV";
      isValid = false;
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = "Please enter a valid CVV";
      isValid = false;
    }
    if (!formData.paymentMethod.trim()) {
      errors.paymentMethod = "Please select payment method";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  // Handle next step button click
  const handleNextStep = async () => {
    if (!validatePersonalInfo()) return;
    setIsSubmitting(true);
    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("userToken");
      }
      const addressBody: AddressBody = {
        recipient_name: formData.firstName + " " + formData.lastName,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        is_default: true,
      };
      if (token) addressBody.token = token;
      const res = await fetch(`${API_BASE_URL}/order/add_address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressBody),
      });
      if (!res.ok) throw new Error("Failed to save address");
      const data = await res.json();
      if (data._id && typeof window !== "undefined") {
        localStorage.setItem("addressId", data._id);
      }
      setCheckoutStep("payment");
      window.scrollTo(0, 0);
    } catch {
      alert("Failed to save address info");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button click
  const handleBackStep = () => {
    setCheckoutStep("personal");
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === "personal") {
      await handleNextStep();
      return;
    }
    if (!validatePaymentInfo()) return;
    setIsSubmitting(true);
    try {
      let cartId = null;
      let addressId = null;
      let token = null;
      let discountId = null;
      if (typeof window !== "undefined") {
        cartId = localStorage.getItem("cartId");
        addressId = localStorage.getItem("addressId");
        token = localStorage.getItem("userToken");
        discountId = localStorage.getItem("discountId");
      }
      const orderBody: OrderBody = {
        cart_id: cartId,
        address_id: addressId,
        payment_method: formData.paymentMethod,
      };
      if (discountId) orderBody.discount_id = discountId;
      if (token) orderBody.token = token;
      const res = await fetch(`${API_BASE_URL}/order/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });
      if (!res.ok) throw new Error("Payment failed");
      setPaymentSuccess(true);
      localStorage.removeItem("cartId");
      localStorage.removeItem("addressId");
      localStorage.removeItem("discountId");
      setTimeout(() => {
        router.push("/checkout/success");
      }, 2000);
    } catch {
      alert("Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your cart is empty, unable to checkout
          </p>
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

  if (paymentSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Redirecting to order confirmation page...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      {/* Checkout progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center ${
                checkoutStep === "personal"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div className="text-sm font-medium ml-2">Personal & Address</div>
          </div>
          <div className="h-1 w-16 bg-gray-200 mx-4"></div>
          <div className="flex items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center ${
                checkoutStep === "payment"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div className="text-sm font-medium ml-2">Payment</div>
          </div>
        </div>
      </div>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Checkout form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {checkoutStep === "personal" && (
              <>
                {/* Personal information */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.firstName
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.lastName
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.email
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="04XX XXX XXX"
                        className={`mt-1 block w-full border ${
                          formErrors.phone
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Address information */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="street"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.street
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.street && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.street}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.city ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700"
                      >
                        State/Territory
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      >
                        <option value="NSW">New South Wales</option>
                        <option value="VIC">Victoria</option>
                        <option value="QLD">Queensland</option>
                        <option value="WA">Western Australia</option>
                        <option value="SA">South Australia</option>
                        <option value="TAS">Tasmania</option>
                        <option value="ACT">
                          Australian Capital Territory
                        </option>
                        <option value="NT">Northern Territory</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="postcode"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Postcode
                      </label>
                      <input
                        type="text"
                        id="postcode"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.postcode
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.postcode && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.postcode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Next step button */}
                <div className="flex justify-end">
                  <Link href="/cart" className="mr-4">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Back to Cart
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Next: Payment
                  </button>
                </div>
              </>
            )}
            {checkoutStep === "payment" && (
              <>
                {/* Payment information */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Payment Information
                  </h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="paymentMethod"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.paymentMethod
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Apple Pay">Apple Pay</option>
                      </select>
                      {formErrors.paymentMethod && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.paymentMethod}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="cardNumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        className={`mt-1 block w-full border ${
                          formErrors.cardNumber
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="cardName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${
                          formErrors.cardName
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.cardName && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.cardName}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className={`mt-1 block w-full border ${
                          formErrors.expiryDate
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.expiryDate}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="cvv"
                        className="block text-sm font-medium text-gray-700"
                      >
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="XXX"
                        className={`mt-1 block w-full border ${
                          formErrors.cvv ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                      />
                      {formErrors.cvv && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Submit button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="mr-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
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
                        Processing...
                      </span>
                    ) : (
                      "Confirm Payment"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
        {/* Order summary */}
        <div className="mt-8 lg:mt-0 lg:col-span-4">
          <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                {cart.map((item) => (
                  <li
                    key={`${item.product._id}-${item.quantity}`}
                    className="py-6 flex"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
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
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.product.name}</h3>
                          <p className="ml-4">
                            ¥
                            {(
                              (item.product.discount_price * item.quantity) /
                              100
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <p className="text-gray-500">
                          Quantity {item.quantity}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                <p>Subtotal</p>
                <p>¥{getTotalPrice().toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                <p>Shipping</p>
                <p>¥0.00</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                <p>Tax</p>
                <p>¥{(getTotalPrice() * 0.1).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
                <p>Total</p>
                <p>¥{(getTotalPrice() * 1.1).toFixed(2)}</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">Including GST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
