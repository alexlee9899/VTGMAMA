import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成重置密码链接
 * @param token 重置密码令牌
 * @param isAdmin 是否是管理员
 * @returns 完整的重置密码URL
 */
export function generateResetPasswordLink(token: string, isAdmin: boolean = false): string {
  // 获取当前域名，如果在开发环境中则使用localhost
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : "http://localhost:3000";
  
  // 根据用户类型生成不同的路径
  const path = isAdmin ? "/admin/resetpassword" : "/user/resetpassword";
  
  // 返回完整的URL，包含token参数
  return `${baseUrl}${path}?token=${token}`;
}
