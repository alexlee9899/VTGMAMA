"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthContext";
import Link from "next/link";

export default function AdminCenter() {
  const { user } = useAuth();

  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Control Center
        </h1>

        <div className="mb-6">
          <p className="text-gray-600 text-lg text-center">
            Welcome back, {user?.first_name} {user?.last_name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-xl font-medium mb-6">Product Management</h3>
            <div className="flex flex-col flex-1 justify-between items-center w-full">
              <p className="text-gray-600 mb-6">
                Manage your product listings, add, edit or delete product
                information.
              </p>
              <Link
                href="/admin/center/product"
                className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition-colors text-center"
              >
                Go to Product Management
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-xl font-medium mb-6">Category Management</h3>
            <div className="flex flex-col flex-1 justify-between items-center w-full">
              <p className="text-gray-600 mb-6">
                Manage product categories, create and organize your product
                catalog structure.
              </p>
              <Link
                href="/admin/center/category"
                className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition-colors text-center"
              >
                Go to Category Management
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-xl font-medium mb-6">Tag Management</h3>
            <div className="flex flex-col flex-1 justify-between items-center w-full">
              <p className="text-gray-600 mb-6">
                Manage product tags, create and assign tags to organize your
                products.
              </p>
              <Link
                href="/admin/center/tag"
                className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition-colors text-center"
              >
                Go to Tag Management
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-xl font-medium mb-6">Statistics</h3>
            <div className="flex flex-col flex-1 justify-between items-center w-full">
              <p className="text-gray-600 mb-6">
                View sales data, visitor statistics and other important metrics.
              </p>
              <button
                className="w-full bg-gray-200 text-gray-600 py-3 rounded cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-3">Recent Activities</h3>
            <div className="text-gray-600">
              <p>No recent activity records</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-3">System Notifications</h3>
            <div className="text-gray-600">
              <p>No system notifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
