import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login/app/dashboard",
        destination: "/marketplace/browse",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
