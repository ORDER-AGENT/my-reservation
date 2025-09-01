import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/customer/reservation',
        destination: '/customer/reservation/menu',
        permanent: true, // 永続的なリダイレクト
      },
    ];
  },
};

export default nextConfig;
