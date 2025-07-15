import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../app/page";
import Header from "../components/layout/Header";
import { AuthProvider } from "../components/auth/AuthContext";

// 模拟Next.js的usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe("首页测试", () => {
  test("Header组件中应该包含登录按钮", () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );

    // 寻找登录按钮
    const loginLink = screen.getByText("Login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/user/login");
  });

  test("Header组件中应该包含注册按钮", () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );

    // 寻找注册按钮
    const registerLink = screen.getByText("Register");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest("a")).toHaveAttribute("href", "/user/register");
  });

  test("首页应该正确渲染", () => {
    render(<Home />);

    // 检查首页标题
    const heading = screen.getByText("VTGMAMA");
    expect(heading).toBeInTheDocument();
  });
});
