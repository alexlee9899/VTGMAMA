"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import dynamic from "next/dynamic";

// 动态导入ImageManager组件
const ImageManager = dynamic(() => import("./ImageManager"), { ssr: false });

interface ProductDetails {
  _id: string;
  name: string;
  description: string;
  base_price: number;
  discount_price: number;
  qty: number;
  is_published: boolean;
  images: string[];
  product_variable: {
    _id: string;
    product_id: string;
    name: string;
    price_modifier: number;
  }[];
  product_category: {
    _id: string;
    name: string;
    parent_id: string;
  }[];
  product_tag: {
    _id: string;
    name: string;
  }[];
}

interface Category {
  _id: string;
  name: string;
  childs: Category[];
  parent_id: string | null;
}

interface ProductDetailsProps {
  mode: "add" | "edit" | "view";
  productId?: string;
  onClose: () => void;
  onProductUpdated: (
    productId: string,
    updatedProduct: Partial<ProductDetails>
  ) => void;
  onProductAdded?: (product: ProductDetails) => void;
  onProductDeleted?: (productId: string) => void;
  categories?: Category[];
}

export default function ProductDetails({
  mode,
  productId,
  onClose,
  onProductUpdated,
  onProductAdded,
  onProductDeleted,
  categories = [],
}: ProductDetailsProps) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: 0,
    discount_price: 0,
    qty: 0,
    is_published: true,
    category_id: "",
  });

  // 获取管理员Token
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  // 获取产品详情
  useEffect(() => {
    // 添加模式不需要获取产品详情
    if (mode === "add") {
      setLoading(false);
      return;
    }

    // 编辑或查看模式需要获取产品详情
    if (productId) {
      const fetchProductDetails = async () => {
        try {
          setLoading(true);
          const token = getAdminToken();
          if (!token) {
            throw new Error("未授权，请先登录");
          }

          const response = await axios.get(
            `http://3.25.93.171:8000/product/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setProduct(response.data);

          // 设置表单数据用于编辑
          if (mode === "edit") {
            setFormData({
              name: response.data.name,
              description: response.data.description,
              // 将分转换为元用于表单显示
              base_price: response.data.base_price / 100,
              discount_price: response.data.discount_price / 100,
              qty: response.data.qty,
              is_published: response.data.is_published,
              category_id:
                response.data.product_category &&
                response.data.product_category[0]
                  ? response.data.product_category[0]._id
                  : "",
            });
          }

          setError(null);
        } catch (err) {
          console.error("获取产品详情失败:", err);
          setError("获取产品详情失败，请重试");
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    }
  }, [productId, mode]);

  // 图片导航
  const prevImage = () => {
    if (!product || !product.images || product.images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!product || !product.images || product.images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // 处理图片更新
  const handleImagesUpdate = (newImages: string[]) => {
    if (mode === "view" && product) {
      // 更新本地产品状态
      const updatedProduct = { ...product, images: newImages };
      setProduct(updatedProduct);

      // 通知父组件产品已更新
      if (productId) {
        onProductUpdated(productId, { images: newImages });
      }
    }
  };

  // 处理表单输入变化
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // 处理数字和布尔类型
    let processedValue: string | number | boolean = value;
    if (name === "base_price" || name === "discount_price" || name === "qty") {
      processedValue = value === "" ? 0 : Number(value);
    } else if (name === "is_published") {
      processedValue = value === "true";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // 添加分类到产品
  const addCategoryToProduct = async (
    productId: string,
    categoryId: string
  ) => {
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      await axios.post(
        "http://3.25.93.171:8000/product/category/add_product",
        {
          category_id: categoryId,
          product_id: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("添加分类失败:", err);
      throw err;
    }
  };

  // 添加产品
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      // 准备请求数据，确保价格以分为单位（整数）
      const requestBody = {
        ...formData,
        base_price: Math.round(formData.base_price * 100),
        discount_price: Math.round(formData.discount_price * 100),
      };

      const response = await axios.post(
        "http://3.25.93.171:8000/product/create",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdProduct = response.data;

      // 如果选择了分类，添加分类关联
      if (formData.category_id) {
        await addCategoryToProduct(createdProduct._id, formData.category_id);
      }

      // 获取完整的产品数据（包括分类信息）
      const updatedResponse = await axios.get(
        `http://3.25.93.171:8000/product/${createdProduct._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 显示成功消息
      setNotification({
        type: "success",
        message: "产品添加成功！",
      });

      // 通知父组件产品已添加
      if (onProductAdded) {
        onProductAdded(updatedResponse.data);
      }

      // 3秒后关闭通知
      setTimeout(() => {
        setNotification(null);
        onClose(); // 关闭窗口
      }, 3000);
    } catch (err) {
      console.error("添加产品失败:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "添加产品失败，请重试",
      });
      // 3秒后关闭通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // 更新产品
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) return;

    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      const requestBody = {
        name: formData.name,
        description: formData.description,
        base_price: Math.round(formData.base_price * 100),
        discount_price: Math.round(formData.discount_price * 100),
        qty: formData.qty,
        is_published: formData.is_published,
      };

      // 更新产品基本信息
      const response = await axios.put(
        `http://3.25.93.171:8000/product/${productId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 如果选择了分类，尝试更新分类关联
      if (formData.category_id) {
        try {
          await addCategoryToProduct(productId, formData.category_id);
        } catch (categoryError) {
          console.error("分类更新失败，但产品已更新:", categoryError);
        }
      }

      // 获取更新后的完整产品数据
      const updatedResponse = await axios.get(
        `http://3.25.93.171:8000/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 更新本地状态
      setProduct(updatedResponse.data);

      // 显示成功消息
      setNotification({
        type: "success",
        message: "产品更新成功！",
      });

      // 通知父组件产品已更新
      onProductUpdated(productId, updatedResponse.data);

      // 3秒后关闭通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error("更新产品失败:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "更新产品失败，请重试",
      });
      // 3秒后关闭通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // 删除产品
  const handleDeleteProduct = async () => {
    if (!productId) return;

    // 确认删除
    if (!window.confirm("确定要删除该产品吗？此操作不可撤销。")) {
      return;
    }

    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      await axios.delete(`http://3.25.93.171:8000/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 显示成功消息
      setNotification({
        type: "success",
        message: "产品删除成功！",
      });

      // 通知父组件产品已删除
      if (onProductDeleted) {
        onProductDeleted(productId);
      }

      // 3秒后关闭通知
      setTimeout(() => {
        setNotification(null);
        onClose(); // 关闭窗口
      }, 3000);
    } catch (err) {
      console.error("删除产品失败:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "删除产品失败，请重试",
      });
      // 3秒后关闭通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // 渲染分类选择器
  const renderCategorySelect = () => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          商品分类
        </label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
        >
          <option value="">选择分类</option>
          {categories.map((category) => (
            <React.Fragment key={category._id}>
              <option value={category._id}>{category.name}</option>
              {category.childs.map((child) => (
                <option key={child._id} value={child._id}>
                  &nbsp;&nbsp;└─ {child.name}
                </option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </div>
    );
  };

  // 渲染表单（添加或编辑模式）
  const renderForm = () => {
    return (
      <form onSubmit={mode === "add" ? handleAddProduct : handleUpdateProduct}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              原价 (¥) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              折扣价 (¥) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discount_price"
              value={formData.discount_price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              库存数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              发布状态
            </label>
            <select
              name="is_published"
              value={formData.is_published.toString()}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value="true">已发布</option>
              <option value="false">未发布</option>
            </select>
          </div>
          {renderCategorySelect()}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
          >
            <FiSave className="mr-1" /> {mode === "add" ? "添加" : "更新"}
          </button>
          {mode === "edit" && productId && (
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="ml-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <FiTrash2 className="mr-1" /> 删除
            </button>
          )}
        </div>
      </form>
    );
  };

  // 渲染产品详情（查看模式）
  const renderProductDetails = () => {
    if (!product) return null;

    return (
      <>
        {/* 产品图片轮播 */}
        {product.images && product.images.length > 0 ? (
          <div className="mb-6">
            <div className="relative w-full h-64 border rounded-md flex items-center justify-center bg-gray-50">
              <img
                src={product.images[currentImageIndex]}
                alt={`Product ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={prevImage}
                disabled={product.images.length <= 1}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                disabled={product.images.length <= 1}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-gray-600">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {/* 缩略图预览 */}
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 border rounded-md overflow-hidden cursor-pointer ${
                      index === currentImageIndex ? "ring-2 ring-gray-800" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 w-full h-64 border rounded-md flex items-center justify-center bg-gray-50">
            <span className="text-gray-500">暂无图片</span>
          </div>
        )}

        {/* 产品基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-lg mb-2">基本信息</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-2">
                <span className="font-medium">商品名称: </span>
                {product.name}
              </div>
              <div className="mb-2">
                <span className="font-medium">原价: </span>¥
                {(product.base_price / 100).toFixed(2)}
              </div>
              <div className="mb-2">
                <span className="font-medium">折扣价: </span>¥
                {(product.discount_price / 100).toFixed(2)}
              </div>
              <div className="mb-2">
                <span className="font-medium">库存数量: </span>
                {product.qty}
              </div>
              <div>
                <span className="font-medium">状态: </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    product.is_published
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.is_published ? "已发布" : "未发布"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">商品描述</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-wrap">
                {product.description || "暂无描述"}
              </p>
            </div>
          </div>
        </div>

        {/* 分类和标签 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-lg mb-2">商品分类</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {product.product_category &&
              product.product_category.length > 0 ? (
                <ul>
                  {product.product_category.map((category) => (
                    <li key={category._id} className="mb-1">
                      {category.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">暂未分类</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">商品标签</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {product.product_tag && product.product_tag.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.product_tag.map((tag) => (
                    <span
                      key={tag._id}
                      className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无标签</p>
              )}
            </div>
          </div>
        </div>

        {/* 产品变体 */}
        {product.product_variable && product.product_variable.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">商品变体</h3>
            <div className="bg-white border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      变体名称
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      价格修正
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {product.product_variable.map((variant) => (
                    <tr key={variant._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {variant.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ¥{(variant.price_modifier / 100).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setLoading(false)} // 设置为false以避免加载状态
            className="mr-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            disabled={loading}
          >
            编辑
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            关闭
          </button>
        </div>
      </>
    );
  };

  if (loading && mode !== "add") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {mode === "add"
              ? "添加新商品"
              : mode === "edit"
              ? "编辑商品"
              : product?.name || "商品详情"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {notification && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded relative ${
              notification.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <span className="block sm:inline">{notification.message}</span>
          </div>
        )}

        <div className="p-6">
          {/* 根据模式显示不同的内容 */}
          {mode === "add" || mode === "edit"
            ? renderForm()
            : renderProductDetails()}

          {/* 图片管理功能 - 仅在编辑或查看模式下显示，且需要有productId */}
          {mode !== "add" && productId && product && (
            <ImageManager
              productId={productId}
              imageUrls={product.images || []}
              onImagesUpdate={handleImagesUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
