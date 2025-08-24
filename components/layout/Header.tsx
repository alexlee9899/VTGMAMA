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

  const isAdminCenter = pathname?.startsWith("/admin/center") || false;

  useEffect(() => {
    console.log("Header state:", { user, isLoading, isAdmin, pathname });
  }, [user, isLoading, isAdmin, pathname]);

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

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="site-header bg-white border-b shadow-sm">
      <div className="container max-w-page mx-auto px-6">
        {/* 顶部：左右图标 + 中间标题 */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-2 mt-6 mb-6">
          <div className="flex items-center gap-4"></div>
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image src="/logo.png" alt="VTGMAMA" width={36} height={36} />
            <h1 className="text-2xl md:text-3xl font-playfair tracking-wide">
              VTGMAMA
            </h1>
          </Link>
          <div className="flex items-center justify-end gap-4">
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

            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 text-sm"
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
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
              <div className="flex items-center space-x-4">
                <Link
                  href="/user/login"
                  className="text-gray-700 hover:text-primary text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/user/register"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 第二行：导航（Sedan 字体） */}
        {!isAdminCenter && (
          <div className="pb-2 lg:flex lg:justify-center">
            {/* 移动端可横向滚动，避免超出父容器；大屏居中且不需要滚动 */}
            <nav className="flex items-center gap-6 sm:gap-8 font-sedan text-sm text-gray-800 overflow-x-auto whitespace-nowrap px-4 -mx-4 lg:overflow-visible lg:whitespace-normal lg:px-0 lg:mx-0">
              <Link href="/">Home</Link>
              <Link href="/products">Sales</Link>
              <Link href="/products">Bags</Link>
              <Link href="/products">Accessories</Link>
              <Link href="/products">Jewelry &amp; Watches</Link>
              <Link href="/products">Clothing</Link>
              <Link href="/products">Men</Link>
              <Link href="/products">Women</Link>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact Us</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
