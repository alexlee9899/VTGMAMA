"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/components/auth/AuthContext";

export default function UserLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleLogin = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // 使用AuthContext中的login函数
      await login(email, password, rememberMe, false); // false表示不是管理员登录

      // 登录成功后跳转到网站首页
      router.push("/");
    } catch (err) {
      setError("邮箱或密码错误，请重试。");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      registerPath="/user/register"
      resetPasswordPath="/user/request_reset_password"
      isLoading={isLoading}
      error={error}
    />
  );
}
