"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Modal } from "antd";
import Image from "next/image";

interface Tag {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  base_price: number;
  discount_price: number;
  qty: number;
  is_published: boolean;
  images: string[];
}

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [tagProducts, setTagProducts] = useState<Product[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newTag, setNewTag] = useState({
    name: "",
  });

  const [editTag, setEditTag] = useState({
    _id: "",
    name: "",
  });

  // 获取管理员token
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  // 使用 useCallback 包装 fetchTags 函数
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      // 获取管理员token
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      const response = await axios.get(
        "http://3.25.93.171:8000/product/tag/full",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTags(response.data);
      setError(null);
    } catch (error) {
      console.error("获取标签失败:", error);
      setError("获取标签数据失败");
      setNotification({
        type: "error",
        message: "获取标签失败",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取所有标签
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // 创建新标签
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 获取管理员token
      const token = getAdminToken();
      console.log("admin token", token);
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      await axios.post(
        "http://3.25.93.171:8000/product/tag/create",
        {
          name: newTag.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewTag({ name: "" });
      setShowAddForm(false);
      fetchTags(); // 重新获取标签列表
      setNotification({
        type: "success",
        message: "标签创建成功！",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("创建标签失败:", error);
      setNotification({
        type: "error",
        message: "创建标签失败",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 更新标签
  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 获取管理员token
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      await axios.post(
        `http://3.25.93.171:8000/product/tag/update/${editTag._id}`,
        {
          name: editTag.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowEditForm(false);
      fetchTags(); // 重新获取标签列表
      setNotification({
        type: "success",
        message: "标签更新成功！",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("更新标签失败:", error);
      setNotification({
        type: "error",
        message: "更新标签失败",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 删除标签
  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm("确定要删除这个标签吗？此操作无法撤销。")) {
      return;
    }

    try {
      // 获取管理员token
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      await axios.delete(
        `http://3.25.93.171:8000/product/tag/delete/${tagId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTags(); // 重新获取标签列表
      setNotification({
        type: "success",
        message: "标签删除成功！",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("删除标签失败:", error);
      setNotification({
        type: "error",
        message: "删除标签失败",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 打开编辑表单
  const openEditForm = (tag: Tag) => {
    setEditTag({
      _id: tag._id,
      name: tag.name,
    });
    setShowEditForm(true);
  };

  // 查看标签产品
  const viewTagProducts = async (tagId: string) => {
    try {
      // 获取管理员token
      const token = getAdminToken();
      if (!token) {
        throw new Error("未授权，请先登录");
      }

      const response = await axios.get(
        `http://3.25.93.171:8000/product/tag/${tagId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTagProducts(response.data);
      setSelectedTagId(tagId);
      setShowProductsModal(true);
    } catch (error) {
      console.error("获取标签产品失败:", error);
      setNotification({
        type: "error",
        message: "获取标签产品失败",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setEditTag({
        ...editTag,
        [name]: value,
      });
    } else {
      setNewTag({
        ...newTag,
        [name]: value,
      });
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 过滤标签
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">标签管理</h1>
          <button
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "取消" : "添加标签"}
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

        {/* 添加标签表单 */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">添加新标签</h2>
            <form onSubmit={handleCreateTag}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newTag.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowAddForm(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 编辑标签表单 */}
        {showEditForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">编辑标签</h2>
            <form onSubmit={handleUpdateTag}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editTag.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEditForm(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 搜索工具栏 */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-grow max-w-xl">
            <input
              type="text"
              placeholder="搜索标签..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
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
            <p className="mt-4 text-gray-600">正在加载标签数据...</p>
          </div>
        ) : (
          /* 标签列表表格 */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    标签ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    标签名称
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
                {filteredTags.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      没有找到标签数据
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => (
                    <tr key={tag._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{tag._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tag.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => viewTagProducts(tag._id)}
                        >
                          查看产品
                        </button>
                        <button
                          className="text-gray-800 hover:text-gray-600 mr-3"
                          onClick={() => openEditForm(tag)}
                        >
                          编辑
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteTag(tag._id)}
                        >
                          删除
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
        {!loading && filteredTags.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">1</span> 到{" "}
                  <span className="font-medium">{filteredTags.length}</span> 共{" "}
                  <span className="font-medium">{filteredTags.length}</span>{" "}
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
      </div>

      {/* 产品模态框 */}
      <Modal
        title={`标签产品列表 ${selectedTagId ? `(ID: ${selectedTagId})` : ""}`}
        open={showProductsModal}
        onCancel={() => setShowProductsModal(false)}
        footer={null}
        width={1000}
      >
        {tagProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">产品名称</th>
                  <th className="px-4 py-2 text-left">描述</th>
                  <th className="px-4 py-2 text-left">原价</th>
                  <th className="px-4 py-2 text-left">折扣价</th>
                  <th className="px-4 py-2 text-left">库存</th>
                  <th className="px-4 py-2 text-left">状态</th>
                  <th className="px-4 py-2 text-left">图片</th>
                </tr>
              </thead>
              <tbody>
                {tagProducts.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2 truncate max-w-xs">
                      {product.description}
                    </td>
                    <td className="px-4 py-2">
                      ¥{(product.base_price / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      ¥{(product.discount_price / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{product.qty}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.is_published ? "已发布" : "未发布"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover"
                          onError={() => {
                            // Handle error by using a default image
                          }}
                        />
                      ) : (
                        "无图片"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">该标签下暂无产品</div>
        )}
      </Modal>
    </div>
  );
}
