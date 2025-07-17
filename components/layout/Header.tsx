"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Check if currently on admin center page
  const isAdminCenter = pathname?.startsWith("/admin/center") || false;

  // Debug output, check user state in Header component
  useEffect(() => {
    console.log("Header state:", { user, isLoading, isAdmin, pathname });
  }, [user, isLoading, isAdmin, pathname]);

  // Click event handler to close dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout operation
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header
      className={`${
        isAdminCenter
          ? "bg-white border-b border-gray-200"
          : "bg-white shadow-md"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and brand name */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="VTGMAMA Logo"
              width={40}
              height={40}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">VTGMAMA</span>
          </Link>

          {/* Navigation links - display different navigation based on page type */}
          {isAdminCenter ? (
            <nav className="flex items-center space-x-1">
              <Link
                href="/admin/center"
                className={`py-2 px-4 rounded transition-colors ${
                  pathname === "/admin/center"
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/center/product"
                className={`py-2 px-4 rounded transition-colors ${
                  pathname === "/admin/center/product"
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Products
              </Link>
              <Link
                href="/admin/center/category"
                className={`py-2 px-4 rounded transition-colors ${
                  pathname === "/admin/center/category"
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Categories
              </Link>
              <Link
                href="/admin/center/tag"
                className={`py-2 px-4 rounded transition-colors ${
                  pathname === "/admin/center/tag"
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Tags
              </Link>
              <Link
                href="/admin/center/order"
                className={`py-2 px-4 rounded transition-colors ${
                  pathname === "/admin/center/order"
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Order Center
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary">
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-primary"
              >
                Products
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary">
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-primary"
              >
                Contact Us
              </Link>
            </nav>
          )}

          {/* User area */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              // Show skeleton screen while loading
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              // Logged in state
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                >
                  <span>
                    {isAdmin ? "Admin: " : ""}
                    {user.first_name} {user.last_name}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {isAdmin ? (
                      <>
                        <Link
                          href="/admin/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/admin/center"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/user/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/user/order"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Order
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Logged out state
              <div className="flex items-center space-x-4">
                <Link
                  href="/user/login"
                  className="text-gray-700 hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/user/register"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Shopping cart icon - only show on non-admin center pages */}
            {!isAdminCenter && (
              <Link href="/cart" className="text-gray-700 hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
