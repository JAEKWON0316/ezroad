import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,  // <-- 이 줄 추가!

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'd36oknyr1agcyh.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://3.36.74.144:8080/:path*',
      },
    ];
  },
};

export default nextConfig;
