"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import api from "@/lib/api";

export default function AdminRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleRegister = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    setError(undefined);

    try {
      await api.admin.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      // 注册成功后跳转到登录页面
      router.push("/admin/login?registered=true");
    } catch (err) {
      // 显示API返回的具体错误信息
      setError(err instanceof Error ? err.message : "注册失败，请重试。");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterForm
      onSubmit={handleRegister}
      loginPath="/admin/login"
      isLoading={isLoading}
      error={error}
    />
  );
}
