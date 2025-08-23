"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "./contexts/ShopContext";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });
}

function sample<T>(arr: T[], n: number): T[] {
  if (!arr || arr.length === 0) return [] as T[];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export default function Home() {
  const { products } = useShop();

  const picks = useMemo(() => sample(products, 6), [products]);
  const fresh3 = picks.slice(0, 3);
  const more3 = picks.slice(3, 6);

  return (
    <div className="page">
      <main>
        {/* Hero */}
        <section className="bg-page-bg-primary py-12">
          <div className="container max-w-page mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <figure className="overflow-hidden rounded-lg">
              <div className="aspect-[867/488] relative">
                <Image
                  src={picks[0]?.images?.[0] || "https://placehold.co/867x488"}
                  alt={picks[0]?.name || "Sales Banner"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </figure>
            <div className="max-w-[520px]">
              <h2 className="font-inknut text-3xl md:text-4xl mb-4">
                Sustainable Luxury
              </h2>
              <p className="font-opensans text-gray-700 leading-relaxed mb-6">
                Discover pre-loved designer pieces with certified authenticity
                and elegant presentation— curated weekly to bring you timeless
                classics and modern favorites.
              </p>
              <Link
                href="/products"
                className="inline-block bg-black text-white px-5 py-2 rounded text-sm"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* Fresh Finds */}
        <section className="bg-page-bg-secondary py-12">
          <div className="container max-w-page mx-auto px-6">
            <h3 className="font-inknut text-2xl mb-6">Fresh Finds</h3>
            <p className="font-opensans text-sm text-gray-600 mb-8">
              Discover the latest designer drops and classic favorites—updated
              weekly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {fresh3.map((p) => (
                <article
                  key={p._id}
                  className="bg-product-bg rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/3] relative bg-white">
                    <Image
                      src={p.images?.[0] || "https://placehold.co/640x480"}
                      alt={p.name}
                      fill
                      className="object-contain p-6"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-inknut text-base mb-1">
                      {p.category?.name || "HIGHLIGHT"}
                    </h4>
                    <div className="font-opensans text-sm text-gray-700 mb-3 line-clamp-2">
                      {p.name}
                    </div>
                    <div className="font-opensans text-sm text-gray-800">
                      {formatPrice(p.discount_price)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="bg-page-bg-primary py-12">
          <div className="container max-w-page mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="font-inknut text-2xl mb-4">Best Sellers</h3>
              <p className="font-opensans text-sm text-gray-700 mb-6">
                These favorites fly off our shelves. Grab yours before they sell
                out.
              </p>
              <Link href="/products" className="inline-block text-sm underline">
                Find out more
              </Link>
            </div>
            <figure className="order-1 lg:order-2 overflow-hidden rounded-lg">
              <div className="aspect-[4/3] relative">
                <Image
                  src={more3[0]?.images?.[0] || "https://placehold.co/900x675"}
                  alt={more3[0]?.name || "Best Sellers"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </figure>
          </div>
        </section>
      </main>
    </div>
  );
}
