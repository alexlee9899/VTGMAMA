"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { PromoteCode } from "./types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PromotePage() {
  const [promoCodes, setPromoCodes] = useState<PromoteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  // 获取所有促销码
  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      const response = await axios.get(
        "http://3.25.93.171:8000/promote/all_discount/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPromoCodes(response.data);
      setError(null);
    } catch (err) {
      console.error("获取促销码失败:", err);
      setError("获取促销码失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 删除促销码
  const deletePromoCode = async () => {
    if (!selectedPromoId) return;

    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      await axios.delete(
        `http://3.25.93.171:8000/promote/delete/${selectedPromoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 删除成功后刷新列表
      fetchPromoCodes();
      setShowDeleteModal(false);
      setSelectedPromoId(null);
    } catch (err) {
      console.error("删除促销码失败:", err);
      setError("删除促销码失败，请重试");
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  // 格式化折扣值
  const formatDiscountValue = (value: number, type: string) => {
    if (type === "percentage") {
      return `${value.toFixed(2)}折`; // 显示为折扣率，如0.85显示为"0.85折"
    } else {
      return `¥${(value / 100).toFixed(2)}`; // 金额单位是分
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">促销码管理</h1>
        <Link
          href="/admin/center/promote/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          创建促销码
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {promoCodes.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      促销码
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      折扣值
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      生效时间
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      结束时间
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      最大使用次数
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promoCodes.map((code) => (
                    <tr key={code._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {code.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDiscountValue(code.value, code.discount_type)}
                        <span className="text-xs text-gray-400 ml-1">
                          (
                          {code.discount_type === "percentage"
                            ? "折扣率"
                            : "固定金额"}
                          )
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(code.strat_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(code.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {code.max_usage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/center/promote/edit/${code._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPromoId(code._id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 text-center text-gray-500 rounded-lg shadow">
              暂无促销码，请点击"创建促销码"按钮添加
            </div>
          )}
        </>
      )}

      {/* 删除确认对话框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
            <p className="mb-6">确定要删除这个促销码吗？此操作无法撤销。</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPromoId(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={deletePromoCode}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
