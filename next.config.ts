import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 라켓 이미지가 다양한 쇼핑몰/브랜드 사이트에서 오기 때문에 모든 https 허용
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
