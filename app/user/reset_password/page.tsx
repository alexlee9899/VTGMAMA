"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SetNewPasswordForm from "@/components/auth/SetNewPasswordForm";
import api from "@/lib/api";

// 创建一个内部组件来使用useSearchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // 重置密码
  const handleResetPassword = async (newPassword: string, token: string) => {
    setIsLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      // 使用用户API重置密码
      await api.auth.resetPassword(newPassword, token);
      setSuccess("密码重置成功，即将跳转到登录页面。");

      // 密码重置成功后3秒跳转到登录页面
      setTimeout(() => {
        router.push("/user/login");
      }, 3000);
    } catch (err) {
      setError("重置密码失败，令牌可能无效或已过期。");
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 如果没有token参数，显示错误信息
  if (!token) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">重置密码</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          无效的重置链接。请重新请求密码重置。
        </div>
        <div className="text-center">
          <a
            href="/user/request_reset_password"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            返回密码重置
          </a>
        </div>
      </div>
    );
  }

  return (
    <SetNewPasswordForm
      onSubmit={handleResetPassword}
      token={token}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
}

// 主页面组件使用Suspense包裹内部组件
export default function UserResetPassword() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
