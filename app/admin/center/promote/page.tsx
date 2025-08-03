"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

interface PromoteCode {
  _id: string;
  code: string;
  value: number;
  strat_time: string; // Typo in API
  end_time: string;
  max_usage: number;
  create_at: string;
  min_amount?: number;
  discount_type: "percentage" | "deduct";
}

export default function PromotePage() {
  const [promoCodes, setPromoCodes] = useState<PromoteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);

  // Fetch all promotion codes
  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        const token = localStorage.getItem("adminToken") || "";
        if (!token) {
          throw new Error("Unauthorized, please login");
        }

        const response = await axios.get<PromoteCode[]>(
          `${API_BASE_URL}/promote/all_discount/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPromoCodes(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch promotion codes:", err);
        setError("Failed to fetch promotion codes, please try again");
        setLoading(false);
      }
    };

    fetchPromoCodes();
  }, []);

  // Delete promotion code
  const deletePromoCode = async () => {
    if (!selectedPromoId) return;

    try {
      const token = localStorage.getItem("adminToken") || "";
      if (!token) {
        throw new Error("Unauthorized, please login");
      }

      await axios.delete(`${API_BASE_URL}/promote/delete/${selectedPromoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh list after successful deletion
      setPromoCodes(promoCodes.filter((code) => code._id !== selectedPromoId));
      setShowDeleteModal(false);
      setSelectedPromoId(null);
    } catch (err) {
      console.error("Failed to delete promotion code:", err);
      setError("Failed to delete promotion code, please try again");
    }
  };

  // Format date time
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  // Format discount value
  const formatDiscountValue = (value: number, type: string) => {
    if (type === "percentage") {
      return `${value.toFixed(2)} off`; // Display as discount rate
    } else {
      return `$${(value / 100).toFixed(2)}`; // Amount in cents
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotion Code Management</h1>
        <Link
          href="/admin/center/promote/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Promotion Code
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2">Loading promotion codes...</p>
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>No promotion codes found. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Valid Period
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Max Usage
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Min Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promoCodes.map((promo) => (
                <tr key={promo._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {promo.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDiscountValue(promo.value, promo.discount_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        promo.discount_type === "percentage"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {promo.discount_type === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(promo.strat_time)} -<br />
                      {formatDateTime(promo.end_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promo.max_usage}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promo.min_amount
                        ? `$${(promo.min_amount / 100).toFixed(2)}`
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/center/promote/edit/${promo._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedPromoId(promo._id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this promotion code? This action
              cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deletePromoCode}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
