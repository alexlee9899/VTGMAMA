"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "@/app/contexts/ShopContext";

export default function CategoryNav() {
  const { categories, setSelectedCategoryId } = useShop();

  const topCategories = categories.filter((c) => !c.parent_id);

  const handleSelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <nav className="relative z-50 bg-white border-b shadow-sm">
      <div className="container max-w-page mx-auto px-6">
        <ul className="flex justify-center gap-10 py-2 overflow-x-auto">
          <li>
            <Link
              href="/products"
              className="text-sm text-gray-800 hover:text-black"
              onClick={() => handleSelect(null)}
            >
              All
            </Link>
          </li>
          {topCategories.map((cat) => (
            <li key={cat._id} className="relative group">
              <Link
                href="/products"
                className="text-sm text-gray-800 hover:text-black whitespace-nowrap"
                onClick={() => handleSelect(cat._id)}
              >
                {cat.name}
              </Link>
              {cat.childs && cat.childs.length > 0 && (
                <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50">
                  <div className="min-w-[260px] bg-white border shadow-lg rounded-md p-3">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.childs.map((sub) => (
                        <li key={sub._id} className="relative group/sub">
                          <Link
                            href="/products"
                            className="block text-sm text-gray-700 hover:text-black px-2 py-1 rounded hover:bg-gray-50"
                            onClick={() => handleSelect(sub._id)}
                          >
                            {sub.name}
                          </Link>
                          {sub.childs && sub.childs.length > 0 && (
                            <div className="absolute left-full top-0 ml-2 hidden group-hover/sub:block z-50">
                              <div className="min-w-[220px] bg-white border shadow-lg rounded-md p-3">
                                <ul className="space-y-1">
                                  {sub.childs.map((leaf) => (
                                    <li key={leaf._id}>
                                      <Link
                                        href="/products"
                                        className="block text-sm text-gray-700 hover:text-black px-2 py-1 rounded hover:bg-gray-50 whitespace-nowrap"
                                        onClick={() => handleSelect(leaf._id)}
                                      >
                                        {leaf.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
