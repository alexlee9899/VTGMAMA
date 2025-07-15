import { API_BASE_URL } from "./config";

// 用户类型定义
interface User {
  email: string;
  first_name: string;
  last_name: string;
}

// 管理员类型定义
interface Admin {
  email: string;
  first_name: string;
  last_name: string;
}

// 基础API请求函数
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // 可以根据状态码处理不同的错误
    const error = await response.json().catch(() => ({}));
    // 如果API返回了具体的错误信息，使用它
    const errorMessage = error.detail || error.message || `API error: ${response.status}`;
    throw new Error(errorMessage);
  }

  // 对于204 No Content的响应，不尝试解析JSON
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// 用户Auth API服务
export const authApi = {
  // 用户登录
  login: (email: string, password: string) => {
    return fetchApi<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // 用户注册
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    return fetchApi<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password
      }),
    });
  },

  // 用户请求重置密码
  requestResetPassword: (email: string) => {
    return fetchApi<{ message: string }>("/auth/request_reset_password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // 用户重置密码
  resetPassword: (newPassword: string, token: string) => {
    return fetchApi<{ message: string }>("/auth/reset_password", {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword, token }),
    });
  },
  
  // 获取用户信息
  getProfile: (token: string) => {
    return fetchApi<User>("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// 管理员Auth API服务
export const adminApi = {
  // 管理员登录
  login: (email: string, password: string) => {
    return fetchApi<{ token: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // 管理员注册
  register: (adminData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    return fetchApi<{ message: string }>("/admin/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        password: adminData.password
      }),
    });
  },

  // 管理员请求重置密码
  requestResetPassword: (email: string) => {
    return fetchApi<{ message: string }>("/admin/request_reset_password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // 管理员重置密码
  resetPassword: (newPassword: string, token: string) => {
    return fetchApi<{ message: string }>("/admin/reset_password", {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword, token }),
    });
  },
  
  // 获取管理员信息
  getProfile: (token: string) => {
    return fetchApi<Admin>("/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// 导出统一的API对象
const api = {
  auth: authApi,
  admin: adminApi,
};

export default api; 