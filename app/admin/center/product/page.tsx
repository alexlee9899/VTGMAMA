"use client";

import React, { useState, useEffect } from "react";

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

interface ProductFormData {
  name: string;
  description: string;
  base_price: number;
  discount_price: number;
  qty: number;
  is_published: boolean;
  category_id?: string;
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

  // Add product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    description: "",
    base_price: 0,
    discount_price: 0,
    qty: 0,
    is_published: true,
  });

  // Edit product form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    ProductFormData & { _id?: string }
  >({
    name: "",
    description: "",
    base_price: 0,
    discount_price: 0,
    qty: 0,
    is_published: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  // Get admin token from localStorage or sessionStorage
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

  // Fetch product data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = getAdminToken();
        console.log("admin token =====>", token);
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
        // Use sample data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get categories
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

  // On component load, get categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category to product
  const addCategoryToProduct = async (
    productId: string,
    categoryId: string
  ) => {
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const response = await fetch(
        "http://3.25.93.171:8000/product/category/add_product",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_id: categoryId,
            product_id: productId,
          }),
        }
      );

      if (!response.ok && response.status !== 400) {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to add category to product:", err);
      if (err instanceof Error && !err.message.includes("400")) {
        throw err;
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    formType: "add" | "edit"
  ) => {
    const { name, value } = e.target;

    // Process number and boolean types
    let processedValue: string | number | boolean = value;
    if (name === "base_price" || name === "discount_price" || name === "qty") {
      processedValue = value === "" ? 0 : Number(value);
    } else if (name === "is_published") {
      processedValue = value === "true";
    }

    if (formType === "add") {
      setNewProduct((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    } else {
      setEditingProduct((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  // Handle add product form submission
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Authorization token not found");
      }

      // Prepare request body, ensure prices are in cents (integer)
      const requestBody = {
        ...newProduct,
        base_price: Math.round(newProduct.base_price * 100),
        discount_price: Math.round(newProduct.discount_price * 100),
      };

      const response = await fetch("http://3.25.93.171:8000/product/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Request failed: ${response.status}`
        );
      }

      const createdProduct = await response.json();

      // If a category is selected, add category association
      if (newProduct.category_id) {
        await addCategoryToProduct(createdProduct._id, newProduct.category_id);
      }

      // Refresh product list
      const updatedResponse = await fetch(
        "http://3.25.93.171:8000/admin/shop_products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setProducts(updatedData);
      }

      // Reset form and show success notification
      setNewProduct({
        name: "",
        description: "",
        base_price: 0,
        discount_price: 0,
        qty: 0,
        is_published: true,
        category_id: undefined,
      });
      setShowAddForm(false);
      setNotification({
        type: "success",
        message: "Product added successfully!",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to add product:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Error adding product",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle edit product
  const handleEdit = (productId: string) => {
    const productToEdit = products.find((p) => p._id === productId);
    if (productToEdit) {
      setEditingProduct({
        _id: productToEdit._id,
        name: productToEdit.name,
        description: productToEdit.description,
        // Convert cents to dollars for display in form
        base_price: productToEdit.base_price / 100,
        discount_price: productToEdit.discount_price / 100,
        qty: productToEdit.qty,
        is_published: productToEdit.is_published,
      });
      setShowEditForm(true);
    }
  };

  // Handle product update form submission
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const requestBody = {
        name: editingProduct.name,
        description: editingProduct.description,
        base_price: Math.round(editingProduct.base_price * 100),
        discount_price: Math.round(editingProduct.discount_price * 100),
        qty: editingProduct.qty,
        is_published: editingProduct.is_published,
      };

      // 先更新商品基本信息
      const response = await fetch(
        `http://3.25.93.171:8000/product/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Request failed: ${response.status}`
        );
      }

      // 如果选择了分类，尝试更新分类关联
      if (editingProduct.category_id) {
        try {
          await addCategoryToProduct(
            editingProduct._id!,
            editingProduct.category_id
          );
        } catch (categoryError) {
          console.error(
            "Category update failed but product was updated:",
            categoryError
          );
          // 不中断流程，继续执行
        }
      }

      // 刷新商品列表
      const updatedResponse = await fetch(
        "http://3.25.93.171:8000/admin/shop_products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setProducts(updatedData);
      }

      setEditingProduct({
        name: "",
        description: "",
        base_price: 0,
        discount_price: 0,
        qty: 0,
        is_published: true,
        category_id: undefined,
      });
      setShowEditForm(false);
      setNotification({
        type: "success",
        message: "商品更新成功！",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to update product:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Error updating product",
      });

      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle product deletion
  const handleDelete = async (productId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
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

      // Remove the product from local state after successful deletion
      setProducts(products.filter((product) => product._id !== productId));

      setNotification({
        type: "success",
        message: "Product deleted successfully!",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Error deleting product",
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Filter products
  const filteredProducts =
    activeTab === "all"
      ? products
      : activeTab === "inStock"
      ? products.filter((product) => product.qty > 0)
      : products.filter((product) => product.qty === 0);

  // Render category selector
  const renderCategorySelect = (formType: "add" | "edit") => {
    const value =
      formType === "add" ? newProduct.category_id : editingProduct.category_id;
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const categoryId = e.target.value;
      if (formType === "add") {
        setNewProduct((prev) => ({ ...prev, category_id: categoryId }));
      } else {
        setEditingProduct((prev) => ({ ...prev, category_id: categoryId }));
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          商品分类
        </label>
        <select
          name="category_id"
          value={value || ""}
          onChange={handleChange}
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

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <button
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {/* Notification */}
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

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={(e) => handleInputChange(e, "add")}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={(e) => handleInputChange(e, "add")}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={newProduct.base_price}
                    onChange={(e) => handleInputChange(e, "add")}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discount_price"
                    value={newProduct.discount_price}
                    onChange={(e) => handleInputChange(e, "add")}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inventory Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={newProduct.qty}
                    onChange={(e) => handleInputChange(e, "add")}
                    required
                    min="0"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    name="is_published"
                    value={newProduct.is_published.toString()}
                    onChange={(e) => handleInputChange(e, "add")}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                  </select>
                </div>
                {renderCategorySelect("add")}
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

        {/* Edit Product Form */}
        {showEditForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingProduct.name}
                    onChange={(e) => handleInputChange(e, "edit")}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    value={editingProduct.description}
                    onChange={(e) => handleInputChange(e, "edit")}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={editingProduct.base_price}
                    onChange={(e) => handleInputChange(e, "edit")}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discount_price"
                    value={editingProduct.discount_price}
                    onChange={(e) => handleInputChange(e, "edit")}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inventory Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={editingProduct.qty}
                    onChange={(e) => handleInputChange(e, "edit")}
                    required
                    min="0"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    name="is_published"
                    value={editingProduct.is_published.toString()}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                  </select>
                </div>
                {renderCategorySelect("edit")}
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

        {/* Product Filter Tabs */}
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
              All Products
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "inStock"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("inStock")}
            >
              In Stock
            </button>
            <button
              className={`py-3 px-6 ${
                activeTab === "outOfStock"
                  ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("outOfStock")}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Search and Filter Toolbar */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-grow max-w-xl">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800">
              <option value="">Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product data...</p>
          </div>
        ) : (
          /* Product List Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Original Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Discount Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Inventory
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
                    Category
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No product data found
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
                          {product.is_published ? "Published" : "Unpublished"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category ? product.category.name : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-gray-800 hover:text-gray-600 mr-3"
                          onClick={() => handleEdit(product._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredProducts.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
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
    </div>
  );
}
