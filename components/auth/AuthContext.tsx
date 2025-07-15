"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
    isAdmin: boolean
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // 使用useCallback包装checkAuth函数，避免不必要的重新创建
  const checkAuth = useCallback(async () => {
    if (typeof window === "undefined") return; // 确保在浏览器环境中运行

    setIsLoading(true);
    try {
      // 检查是否有管理员token，只从localStorage中读取
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        try {
          const response = await api.admin.getProfile(adminToken);
          setUser(response);
          setIsAdmin(true);
          setIsLoading(false);

          // 如果是管理员，检查当前路径是否在管理员中心外
          // 使用window.location检查路径，避免在服务器端执行
          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            if (!path.startsWith("/admin/center")) {
              router.push("/admin/center");
            }
          }
          return;
        } catch (error) {
          console.error("Admin token invalid:", error);
          // 清除无效的管理员token
          localStorage.removeItem("adminToken");
        }
      }

      // 检查是否有用户token，只从localStorage中读取
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        try {
          const response = await api.auth.getProfile(userToken);
          setUser(response);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("User token invalid:", error);
          // 清除无效的用户token
          localStorage.removeItem("userToken");
        }
      }

      // 没有有效的token
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setIsAdmin(false);
      // 清除可能无效的token
      localStorage.removeItem("userToken");
      localStorage.removeItem("adminToken");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 初始化时检查认证状态，只运行一次
  useEffect(() => {
    checkAuth();
    // 移除pathname依赖，避免路由变化导致的无限刷新
  }, [checkAuth]);

  // 登录函数
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean,
    isAdmin: boolean
  ) => {
    setIsLoading(true);
    try {
      // 始终使用 localStorage 存储 token
      if (isAdmin) {
        const response = await api.admin.login(email, password);
        localStorage.setItem("adminToken", response.token);
        const profileResponse = await api.admin.getProfile(response.token);
        setUser(profileResponse);
        setIsAdmin(true);

        // 管理员登录成功后自动跳转到管理员中心
        router.push("/admin/center");
      } else {
        const response = await api.auth.login(email, password);
        localStorage.setItem("userToken", response.token);
        const profileResponse = await api.auth.getProfile(response.token);
        setUser(profileResponse);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  // 将AuthContext的值输出到控制台，帮助调试
  useEffect(() => {
    console.log("AuthContext state:", { user, isLoading, isAdmin });
  }, [user, isLoading, isAdmin]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 创建一个hook用于组件中使用认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
