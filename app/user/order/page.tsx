"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import OrderCard from "./orderCard";

interface OrderItem {
  product_id: string;
  product_name: string;
  variable_id: string;
  variable_name: string;
  order_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

interface Address {
  _id: string;
  user_id: string;
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  is_default: boolean;
}

interface DiscountCode {
  _id: string;
  code: string;
  value: number;
  strat_time: string;
  end_time: string;
  max_usage: number;
  create_at: string;
  min_amount: number;
  discount_type: string;
}

interface Order {
  order_id: string;
  address: Address;
  discount_code: DiscountCode | null;
  user_id: string;
  track_number: string;
  order_items: OrderItem[];
  total_amount: number;
  sale_amount: number;
  status: string;
  payment_method: string;
  placed_at: string;
  update_at: string;
}

interface OrderResponse {
  page_idx: number;
  total_page: number;
  orders: Order[];
}

export default function UserOrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0); // 将页码重置为0
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(6);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setError("Please login to view your orders");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      // 添加调试信息
      console.log("Using token:", token);

      // 修复POST请求格式
      const response = await axios.post<OrderResponse>(
        "http://3.25.93.171:8000/order/history",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Order response:", response.data);
      // 类型转换，确保传入的是数组
      setOrders(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.data.total_page || 1);
      setError(null);
    } catch (error) {
      console.error("Failed to get orders:", error);
      // 更详细的错误信息
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data);
        setError(
          `Failed to load your orders: ${error.response?.status} ${
            error.response?.statusText
          }. ${JSON.stringify(error.response?.data)}`
        );
      } else {
        setError("Failed to load your orders. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [pageIndex, pageSize, user, fetchOrders]);

  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
          Please login to view your orders
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : selectedOrder ? (
        // Order detail view
        <OrderCard
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
        />
      ) : (
        // Orders list view
        <>
          {!orders || orders.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-4xl mx-auto">
              <p className="text-gray-600 mb-4">
                You don&apos;t have any orders yet.
              </p>
              <a
                href="/products"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-6xl mx-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr
                          key={order.order_id || `order-${Math.random()}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #
                            {order.order_id
                              ? order.order_id.substring(0, 8) + "..."
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.placed_at
                              ? formatDate(order.placed_at)
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                order.status || "unknown"
                              )}`}
                            >
                              {getStatusText(order.status || "unknown")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ¥
                            {order.sale_amount
                              ? (order.sale_amount / 100).toFixed(2)
                              : "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 hover:text-blue-900 px-3 py-1  hover:bg-blue-50"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(0, pageIndex - 1))
                      }
                      disabled={pageIndex === 0}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {pageIndex + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.min(totalPages - 1, pageIndex + 1)
                        )
                      }
                      disabled={pageIndex >= totalPages - 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
