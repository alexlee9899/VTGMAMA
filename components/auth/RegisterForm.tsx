import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RegisterFormProps {
  onSubmit: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  loginPath: string;
  isLoading?: boolean;
  error?: string;
}

export default function RegisterForm({
  onSubmit,
  loginPath,
  isLoading = false,
  error,
}: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 添加表单验证状态
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码长度
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // 处理邮箱输入变化
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setFormErrors((prev) => ({ ...prev, email: "请输入有效的邮箱地址" }));
    } else {
      setFormErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  // 处理密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (value && !validatePassword(value)) {
      setFormErrors((prev) => ({ ...prev, password: "密码长度必须至少为6位" }));
    } else {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单提交前再次验证
    if (!validateEmail(email)) {
      setFormErrors((prev) => ({ ...prev, email: "请输入有效的邮箱地址" }));
      return;
    }

    if (!validatePassword(password)) {
      setFormErrors((prev) => ({ ...prev, password: "密码长度必须至少为6位" }));
      return;
    }

    try {
      await onSubmit(firstName, lastName, email, password);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Register</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="mt-1 block w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="mt-1 block w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.email ? "border-red-500" : "border-input"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input`}
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.password ? "border-red-500" : "border-input"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input`}
            placeholder="Create a password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isLoading || !!formErrors.email || !!formErrors.password}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <Link
          href={loginPath}
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}
