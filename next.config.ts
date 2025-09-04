import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // すべてのHTTPホスト名を許可
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**', // すべてのHTTPSホスト名を許可
        port: '',
        pathname: '**',
      },
    ],
  },
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
