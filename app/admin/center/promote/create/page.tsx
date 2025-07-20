"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PromoteCodeRequest } from "../types";

export default function CreatePromotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PromoteCodeRequest>({
    code: "",
    value: 0,
    start_time: new Date().toISOString().slice(0, 16), // 格式化为 YYYY-MM-DDTHH:MM
    end_time: new Date(new Date().setDate(new Date().getDate() + 30))
      .toISOString()
      .slice(0, 16), // 默认30天后
    max_usage: 100,
    min_amount: 0, // 可选字段
    discount_type: "percentage",
  });

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === "value" && type === "number") {
      // 如果是百分比折扣，确保值在0-1之间
      if (formData.discount_type === "percentage") {
        const numValue = parseFloat(value);
        if (numValue > 1) {
          setFormData({
            ...formData,
            [name]: 1,
          });
          return;
        }
      }
    }

    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getAdminToken();
      console.log(token);
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      // 准备请求数据
      const requestData = {
        ...formData,
        // 转换日期时间格式为ISO字符串
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      await axios.post("http://3.25.93.171:8000/promote/create", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 创建成功，重定向到促销码列表页
      router.push("/admin/center/promote");
    } catch (err) {
      console.error("创建促销码失败:", err);
      setError("创建促销码失败，请检查输入并重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">创建促销码</h1>
        <Link
          href="/admin/center/promote"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          返回列表
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 促销码 */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              促销码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: SUMMER2023"
            />
            <p className="mt-1 text-xs text-gray-500">
              输入客户使用的促销码，建议使用大写字母和数字
            </p>
          </div>

          {/* 折扣类型 */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              折扣类型 <span className="text-red-500">*</span>
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">百分比折扣(%)</option>
              <option value="deduct">固定金额折扣(¥)</option>
            </select>
          </div>

          {/* 折扣值 */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              折扣值 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              min={0}
              max={formData.discount_type === "percentage" ? 1 : undefined}
              step={formData.discount_type === "percentage" ? 0.01 : 1}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.discount_type === "percentage"
                  ? "例如: 0.85 表示 85折"
                  : "例如: 500 表示 5元"
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.discount_type === "percentage"
                ? "输入0-1之间的小数，如0.85表示85折"
                : "输入金额，单位为分，例如500表示5元"}
            </p>
          </div>

          {/* 最低消费金额 (可选) */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              最低消费金额 (可选)
            </label>
            <input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleChange}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: 1000 表示 10元"
            />
            <p className="mt-1 text-xs text-gray-500">
              订单满多少金额才能使用此促销码，0表示无限制，单位为分
            </p>
          </div>

          {/* 生效时间 */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              生效时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleDateChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 结束时间 */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              结束时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleDateChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 最大使用次数 */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              最大使用次数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="max_usage"
              value={formData.max_usage}
              onChange={handleChange}
              required
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: 100"
            />
            <p className="mt-1 text-xs text-gray-500">
              此促销码最多可以被使用的次数
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/center/promote"
            className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "创建中..." : "创建促销码"}
          </button>
        </div>
      </form>
    </div>
  );
}
