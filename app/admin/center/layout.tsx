"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

export default function AdminCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAdmin } = useAuth();
  const router = useRouter();

  // 验证用户是否为管理员，否则重定向到登录页面
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果不是管理员，不渲染任何内容（页面会被重定向）
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* 主要内容区，占据整个页面 */}
      {children}
    </div>
  );
}
