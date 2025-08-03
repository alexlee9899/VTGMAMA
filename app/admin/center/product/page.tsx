"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { API_BASE_URL } from "@/lib/config";

// 动态导入组件
const ProductDetails = dynamic(() => import("./ProductDetails"), {
  ssr: false,
});

interface Product {
  _id: string;
  name: string;
  description: string;
  base_price: number;
  discount_price: number;
  qty: number;
  is_published: boolean;
  images: string[];
  category?: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
  childs: Category[];
  parent_id: string | null;
}

export default function ProductManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 产品详情模态框状态
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("view");

  // 分类状态
  const [categories, setCategories] = useState<Category[]>([]);

  // 获取管理员Token
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken") ||
        ""
      );
    }
    return "";
  };

  // 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = getAdminToken();
        if (!token) {
          throw new Error("Authorization token not found");
        }

        const response = await fetch(`${API_BASE_URL}/admin/shop_products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(
          err instanceof Error ? err.message : "Error retrieving products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 获取分类数据
  useEffect(() => {
    fetchCategories();
  }, []);

  // 获取产品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const response = await fetch(
        "http://3.25.93.171:8000/admin/shop_products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        err instanceof Error ? err.message : "Error retrieving products"
      );
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://3.25.93.171:8000/product/category/full"
      );
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error fetching categories",
      });
    }
  };

  // 处理添加产品
  const handleAddProduct = () => {
    setModalMode("add");
    setSelectedProductId(null);
    setShowProductModal(true);
  };

  // 处理编辑产品
  const handleEditProduct = (productId: string) => {
    setModalMode("edit");
    setSelectedProductId(productId);
    setShowProductModal(true);
  };

  // 处理查看产品详情
  const handleViewProductDetails = (productId: string) => {
    setModalMode("view");
    setSelectedProductId(productId);
    setShowProductModal(true);
  };

  // 处理删除产品
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("确定要删除此产品？此操作无法撤销。")) {
      return;
    }

    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const response = await fetch(
        `http://3.25.93.171:8000/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Request failed: ${response.status}`
        );
      }

      // 从本地状态移除已删除的产品
      setProducts(products.filter((product) => product._id !== productId));

      setNotification({
        type: "success",
        message: "产品已成功删除！",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Error deleting product",
      });

      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 处理产品创建后的回调
  const handleProductAdded = (newProduct: Product) => {
    setProducts([...products, newProduct]);
    setShowProductModal(false);

    setNotification({
      type: "success",
      message: "产品已成功添加！",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // 处理产品更新后的回调
  const handleProductUpdated = (
    productId: string,
    updatedProduct: Partial<Product>
  ) => {
    const updatedProducts = products.map((product) => {
      if (product._id === productId) {
        return { ...product, ...updatedProduct };
      }
      return product;
    });

    setProducts(updatedProducts);

    // 如果是在编辑模式下更新，则关闭模态窗口
    if (modalMode === "edit") {
      setShowProductModal(false);

      setNotification({
        type: "success",
        message: "产品已成功更新！",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 处理产品删除后的回调
  const handleProductDeleted = (productId: string) => {
    setProducts(products.filter((product) => product._id !== productId));
    setShowProductModal(false);

    setNotification({
      type: "success",
      message: "产品已成功删除！",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // 过滤产品
  const filteredProducts =
    activeTab === "all"
      ? products
      : activeTab === "inStock"
      ? products.filter((product) => product.qty > 0)
      : products.filter((product) => product.qty === 0);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">商品管理</h1>
          <button
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors flex items-center"
            onClick={handleAddProduct}
          >
            <FiPlus className="mr-1" /> 添加商品
          </button>
        </div>

        {/* 通知消息 */}
        {notification && (
          <div
            className={`mb-6 px-4 py-3 rounded relative ${
              notification.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <span className="block sm:inline">{notification.message}</span>
          </div>
        )}

        {/* 产品筛选标签 */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`py-3 px-6 ${
                activeTab === "all"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("all")}
            >
              所有商品
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "inStock"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("inStock")}
            >
              有库存
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "outOfStock"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("outOfStock")}
            >
              无库存
            </button>
          </div>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-grow max-w-xl">
            <input
              type="text"
              placeholder="搜索商品..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800">
              <option value="">状态</option>
              <option value="true">已发布</option>
              <option value="false">未发布</option>
            </select>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">错误：</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载产品数据中...</p>
          </div>
        ) : (
          /* 产品列表表格 */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    商品名称
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    描述
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    原价
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    折扣价
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    库存
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    状态
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    分类
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      未找到商品数据
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ¥{(product.base_price / 100).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ¥{(product.discount_price / 100).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.qty}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.is_published ? "已发布" : "未发布"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category ? product.category.name : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                          onClick={() => handleViewProductDetails(product._id)}
                        >
                          <FiEye className="mr-1" /> 查看
                        </button>
                        <button
                          className="text-gray-800 hover:text-gray-600 mr-3 flex items-center"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          <FiEdit className="mr-1" /> 编辑
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 flex items-center"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <FiTrash2 className="mr-1" /> 删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 分页 */}
        {!loading && filteredProducts.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">1</span> 到{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  共{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  条结果
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    上一页
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    下一页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* 产品详情模态窗口 */}
        {showProductModal && (
          <ProductDetails
            mode={modalMode}
            productId={selectedProductId || undefined}
            onClose={() => setShowProductModal(false)}
            onProductUpdated={handleProductUpdated}
            onProductAdded={handleProductAdded}
            onProductDeleted={handleProductDeleted}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
}
