import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 请求重置密码的Props
interface RequestResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loginPath: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export default function RequestResetPasswordForm({
  onSubmit,
  loginPath,
  isLoading = false,
  error,
  success,
}: RequestResetPasswordFormProps) {
  const [email, setEmail] = useState("");

  // 处理请求重置密码
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(email);
    } catch (error) {
      console.error("Request reset password error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">重置密码</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleRequestReset}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            邮箱
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
            placeholder="输入您注册的邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "发送中..." : "发送重置链接"}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <Link
          href={loginPath}
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          返回登录
        </Link>
      </div>
    </div>
  );
}
