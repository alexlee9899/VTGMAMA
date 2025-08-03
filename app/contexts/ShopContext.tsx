"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";

export interface Product {
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

export interface Category {
  _id: string;
  name: string;
  childs: Category[];
  parent_id: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  categoryProducts: Product[];
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Get all products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/all_products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      // Only show published products
      setProducts(data.filter((product: Product) => product.is_published));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    }
  };

  // Get all categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/category/full`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    }
  };

  // Get products by category
  const fetchCategoryProducts = async (categoryId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/category/${categoryId}/products`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch category products");
      }
      const data = await response.json();
      setCategoryProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch category products"
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchCategoryProducts(selectedCategoryId);
    } else {
      setCategoryProducts([]);
    }
  }, [selectedCategoryId]);

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        return currentCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product._id !== productId)
    );
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) =>
        total + (item.product.discount_price * item.quantity) / 100,
      0
    );
  };

  // Calculate total items in cart
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    products,
    categories,
    cart,
    loading,
    error,
    selectedCategoryId,
    categoryProducts,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    setSelectedCategoryId,
    getTotalPrice,
    getTotalItems,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
