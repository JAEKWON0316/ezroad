import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://3.106.186.205:8080/:path*',
      },
    ];
  },
};

export default nextConfig;
