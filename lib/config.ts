// Add type declaration for window.APP_CONFIG
declare global {
  interface Window {
    APP_CONFIG?: {
      API_BASE_URL: string;
    };
  }
}

// Import API base URL from public configuration
export const getApiBaseUrl = (): string => {
  // For server-side rendering or during build time
  if (typeof window === 'undefined') {
    return "https://e357d85fea10.ngrok-free.app";
  }
  
  // For client-side rendering
  return window.APP_CONFIG?.API_BASE_URL || "https://e357d85fea10.ngrok-free.app";
};

// Export API base URL for convenience
export const API_BASE_URL = getApiBaseUrl();

// 其他全局配置可以在这里添加 