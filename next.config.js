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
};

module.exports = nextConfig;
