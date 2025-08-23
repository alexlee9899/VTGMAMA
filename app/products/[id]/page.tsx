"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useShop } from "../../contexts/ShopContext";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const { products, addToCart } = useShop();

  const product = useMemo(
    () => products.find((p) => p._id === id),
    [products, id]
  );

  const fallback = {
    name: "Constance Slim wallet",
    brand: "HERMÈS",
    price: 350000,
    description:
      "A compact, elegantly crafted wallet with signature hardware and premium leather.",
    images: ["/logo.png", "/logo.png"],
  };

  const p = product || (fallback as any);

  return (
    <div className="page">
      <main className="container max-w-page mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 py-10 bg-page-bg-primary">
        {/* 左侧：主图 + 辅图 */}
        <div className="space-y-6">
          <div className="relative aspect-[4/3] bg-white">
            <Image
              src={p.images?.[0] || "/logo.png"}
              alt={p.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="relative aspect-[4/3] bg-white">
            <Image
              src={p.images?.[1] || p.images?.[0] || "/logo.png"}
              alt={`${p.name} - inside`}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* 右侧：信息区 */}
        <div>
          <h1 className="font-playfair text-3xl mb-4">{p.brand || "HERMÈS"}</h1>
          <h2 className="font-inknut text-xl mb-4">{p.name}</h2>
          <div className="text-lg mb-6">
            {(p.discount_price || p.price) && (
              <span>
                AU$
                {(
                  ((p.discount_price || p.price) as number) / 100
                ).toLocaleString("en-AU")}
              </span>
            )}
          </div>

          <button
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 mb-6"
            onClick={() => (product ? addToCart(product as any) : null)}
          >
            Add To Cart
          </button>

          {/* Condition（假数据 UI） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm mb-2">
              <span>Condition</span>
              <span className="w-2 h-2 bg-black rounded-full inline-block"></span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-700">
              <span>Perfect</span>
              <span>Excellent</span>
              <span>Very Good</span>
              <span>Good</span>
            </div>
          </div>

          {/* 折叠面板（静态 UI） */}
          <div className="divide-y">
            <details className="py-4" open>
              <summary className="cursor-pointer font-semibold">
                Description
              </summary>
              <p className="mt-2 text-sm text-gray-700">{p.description}</p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold">
                Details
              </summary>
              <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Material: Premium leather</li>
                <li>Hardware: Palladium finish</li>
                <li>Origin: Made in France</li>
              </ul>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold">
                Shipping & Returns Info
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                Ships within 2-5 business days. 14-day return policy.
              </p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold">
                Payment Options
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                We accept major credit cards and PayPal.
              </p>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
