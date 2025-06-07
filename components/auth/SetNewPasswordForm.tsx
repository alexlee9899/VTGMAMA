import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface SetNewPasswordFormProps {
  onSubmit: (newPassword: string, token: string) => Promise<void>;
  token: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export default function SetNewPasswordForm({
  onSubmit,
  token,
  isLoading = false,
  error,
  success,
}: SetNewPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirm: "",
  });

  // 验证密码长度
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // 处理密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);

    if (value && !validatePassword(value)) {
      setFormErrors((prev) => ({ ...prev, password: "密码长度必须至少为6位" }));
    } else {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }

    // 如果确认密码已经输入，验证两次密码是否匹配
    if (confirmPassword) {
      if (value !== confirmPassword) {
        setFormErrors((prev) => ({ ...prev, confirm: "两次输入的密码不匹配" }));
      } else {
        setFormErrors((prev) => ({ ...prev, confirm: "" }));
      }
    }
  };

  // 处理确认密码输入变化
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== newPassword) {
      setFormErrors((prev) => ({ ...prev, confirm: "两次输入的密码不匹配" }));
    } else {
      setFormErrors((prev) => ({ ...prev, confirm: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单提交前再次验证
    if (!validatePassword(newPassword)) {
      setFormErrors((prev) => ({ ...prev, password: "密码长度必须至少为6位" }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormErrors((prev) => ({ ...prev, confirm: "两次输入的密码不匹配" }));
      return;
    }

    try {
      await onSubmit(newPassword, token);
    } catch (error) {
      console.error("Set new password error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">设置新密码</h1>

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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium">
            新密码
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.password ? "border-red-500" : "border-input"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input`}
            placeholder="输入新密码"
            value={newPassword}
            onChange={handlePasswordChange}
            required
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            确认新密码
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.confirm ? "border-red-500" : "border-input"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input`}
            placeholder="再次输入新密码"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
          {formErrors.confirm && (
            <p className="text-red-500 text-xs mt-1">{formErrors.confirm}</p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={
              isLoading || !!formErrors.password || !!formErrors.confirm
            }
          >
            {isLoading ? "处理中..." : "重置密码"}
          </Button>
        </div>
      </form>
    </div>
  );
}
