/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "vtgmama.s3.ap-southeast-2.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "vtgmama.s3.ap-southeast-2.com",
        pathname: "**",
      },
    ],
  },

  // 添加API重写规则
  async rewrites() {
    return [
      {
        source: "/api/:path*", // 前端访问 /api/xxx
        destination: "http://3.25.93.171:8000/:path*", // 实际去请求
      },
    ];
  },
};

module.exports = nextConfig;
