"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
}

export default function UserProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // 从localStorage或sessionStorage获取token
        const token =
          localStorage.getItem("userToken") ||
          sessionStorage.getItem("userToken");

        if (!token) {
          // 如果没有token，重定向到登录页面
          router.push("/user/login");
          return;
        }

        // 获取用户个人资料
        const response = await api.auth.getProfile(token);
        setProfile({
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
        });
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("获取个人资料失败，请重新登录。");

        // 清除token并重定向到登录页面
        localStorage.removeItem("userToken");
        sessionStorage.removeItem("userToken");

        setTimeout(() => {
          router.push("/user/login");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    // 清除token
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userToken");

    // 重定向到登录页面
    router.push("/user/login");
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">用户个人资料</h1>

        {profile && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center py-4 border-b">
              <span className="font-medium w-full md:w-1/4">电子邮箱:</span>
              <span className="text-gray-700 w-full md:w-3/4">
                {profile.email}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 border-b">
              <span className="font-medium w-full md:w-1/4">名字:</span>
              <span className="text-gray-700 w-full md:w-3/4">
                {profile.first_name}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 border-b">
              <span className="font-medium w-full md:w-1/4">姓氏:</span>
              <span className="text-gray-700 w-full md:w-3/4">
                {profile.last_name}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4">
              <span className="font-medium w-full md:w-1/4">全名:</span>
              <span className="text-gray-700 w-full md:w-3/4">{`${profile.first_name} ${profile.last_name}`}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
