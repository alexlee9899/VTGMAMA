"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "antd";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/config";

interface Category {
  _id: string;
  name: string;
  childs: Category[];
  parent_id: string | null;
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

export default function CategoryManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [newCategory, setNewCategory] = useState({
    name: "",
    parent_id: null as string | null,
  });

  const [editCategory, setEditCategory] = useState({
    _id: "",
    name: "",
    parent_id: null as string | null,
  });

  // Get admin token
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  // Get all categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/product/category/full`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setCategories(response.data);

      // Filter parent categories (categories with parent_id as null)
      const parents = response.data.filter(
        (cat: Category) => cat.parent_id === null
      );
      setParentCategories(parents);
      setError(null);
    } catch (error) {
      console.error("Failed to get categories:", error);
      setError("Failed to get category data");
      setNotification({
        type: "error",
        message: "Failed to get categories",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Admin authorization token not found");
      }

      await axios.post(
        `${API_BASE_URL}/product/category/create`,
        {
          name: newCategory.name,
          parent_id: newCategory.parent_id || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      setNewCategory({ name: "", parent_id: null });
      setShowAddForm(false);
      fetchCategories(); // Refresh category list
      setNotification({
        type: "success",
        message: "Category created successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Failed to create category:", error);
      setNotification({
        type: "error",
        message: "Failed to create category",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Update category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Admin authorization token not found");
      }

      await axios.put(
        `${API_BASE_URL}/product/category/update/${editCategory._id}`,
        {
          name: editCategory.name,
          parent_id: editCategory.parent_id || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      setShowEditForm(false);
      fetchCategories(); // Refresh category list
      setNotification({
        type: "success",
        message: "Category updated successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Failed to update category:", error);
      setNotification({
        type: "error",
        message: "Failed to update category",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Admin authorization token not found");
      }

      await axios.delete(
        `${API_BASE_URL}/product/category/delete/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      fetchCategories(); // Refresh category list
      setNotification({
        type: "success",
        message: "Category deleted successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setNotification({
        type: "error",
        message: "Failed to delete category",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Open edit form
  const openEditForm = (category: Category) => {
    setEditCategory({
      _id: category._id,
      name: category.name,
      parent_id: category.parent_id,
    });
    setShowEditForm(true);
  };

  // View category products
  const viewCategoryProducts = async (categoryId: string) => {
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Admin authorization token not found");
      }

      const response = await axios.get(
        `${API_BASE_URL}/product/category/${categoryId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setCategoryProducts(response.data);
      setSelectedCategoryId(categoryId);
      setShowProductsModal(true);
    } catch (error) {
      console.error("Failed to get category products:", error);
      setNotification({
        type: "error",
        message: "Failed to get category products",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setEditCategory({
        ...editCategory,
        [name]: name === "parent_id" ? (value === "" ? null : value) : value,
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: name === "parent_id" ? (value === "" ? null : value) : value,
      });
    }
  };

  // Recursively get all categories (flattened)
  const getAllCategories = (
    categoryList: Category[],
    result: Category[] = []
  ) => {
    categoryList.forEach((category) => {
      result.push(category);
      if (category.childs && category.childs.length > 0) {
        getAllCategories(category.childs, result);
      }
    });
    return result;
  };

  // Recursively render category and its subcategories
  const renderCategories = (categoryList: Category[], level = 0) => {
    return categoryList.map((category) => (
      <React.Fragment key={category._id}>
        <tr>
          <td className="px-6 py-4 whitespace-nowrap">
            <div
              className="text-sm font-medium text-gray-900"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {category.name}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-500">
              {category.parent_id ? "Subcategory" : "Parent Category"}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-500">
              {category.parent_id || "None"}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {category.childs?.length || 0}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              className="text-blue-600 hover:text-blue-900 mr-3"
              onClick={() => viewCategoryProducts(category._id)}
            >
              View Products
            </button>
            <button
              className="text-gray-800 hover:text-gray-600 mr-3"
              onClick={() => openEditForm(category)}
            >
              Edit
            </button>
            <button
              className="text-red-600 hover:text-red-900"
              onClick={() => handleDeleteCategory(category._id)}
            >
              Delete
            </button>
          </td>
        </tr>
        {category.childs &&
          category.childs.length > 0 &&
          renderCategories(category.childs, level + 1)}
      </React.Fragment>
    ));
  };

  // Filter categories
  const filteredCategories = (() => {
    const allFlatCategories = getAllCategories(categories);

    if (activeTab === "all") {
      return categories;
    } else if (activeTab === "parent") {
      return categories.filter((cat) => cat.parent_id === null);
    } else if (activeTab === "child") {
      return allFlatCategories.filter((cat) => cat.parent_id !== null);
    }

    return categories;
  })();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Category Management</h1>
          <button
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add Category"}
          </button>
        </div>

        {/* Notification message */}
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

        {/* Add category form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">Add New Category</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    name="parent_id"
                    value={newCategory.parent_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">None (as parent category)</option>
                    {parentCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit category form */}
        {showEditForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">Edit Category</h2>
            <form onSubmit={handleUpdateCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editCategory.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    name="parent_id"
                    value={editCategory.parent_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">None (as parent category)</option>
                    {parentCategories
                      .filter((category) => category._id !== editCategory._id) // Prevent selecting itself as parent
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category filter tags */}
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
              All Categories
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "parent"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("parent")}
            >
              Parent Categories
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "child"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("child")}
            >
              Subcategories
            </button>
          </div>
        </div>

        {/* Search and filter toolbar */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-grow max-w-xl">
            <input
              type="text"
              placeholder="Search category..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800">
              <option value="">Category Type</option>
              <option value="parent">Parent Category</option>
              <option value="child">Subcategory</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading category data...</p>
          </div>
        ) : (
          /* Category list table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category Name
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
                    Parent Category ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subcategory Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No category data found
                    </td>
                  </tr>
                ) : (
                  renderCategories(filteredCategories)
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredCategories.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {filteredCategories.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredCategories.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product modal */}
      <Modal
        title={`Category Product List ${
          selectedCategoryId ? `(ID: ${selectedCategoryId})` : ""
        }`}
        open={showProductsModal}
        onCancel={() => setShowProductsModal(false)}
        footer={null}
        width={1000}
      >
        {categoryProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Product Name</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Base Price</th>
                  <th className="px-4 py-2 text-left">Discount Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Image</th>
                </tr>
              </thead>
              <tbody>
                {categoryProducts.map((product) => (
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
                        {product.is_published ? "Published" : "Unpublished"}
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
                        "No Image"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            No products found in this category
          </div>
        )}
      </Modal>
    </div>
  );
}
