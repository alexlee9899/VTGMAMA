"use client";

import React, { useState } from "react";
import RequestResetPasswordForm from "@/components/auth/ResetPasswordForm";
import api from "@/lib/api";

export default function AdminRequestResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // 请求重置密码
  const handleRequestResetPassword = async (email: string) => {
    setIsLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      // 使用管理员API请求重置密码
      await api.admin.requestResetPassword(email);
      setSuccess("密码重置链接已发送到您的邮箱。");
    } catch (err) {
      setError("发送重置密码邮件失败，请重试。");
      console.error("Request reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequestResetPasswordForm
      onSubmit={handleRequestResetPassword}
      loginPath="/admin/login"
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
}
