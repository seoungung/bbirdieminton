import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "ttvphjtiosnfaykzmiek.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // 요넥스 공식
      {
        protocol: "https",
        hostname: "www.yonex.com",
      },
      // 요넥스몰
      {
        protocol: "https",
        hostname: "www.yonexmall.com",
      },
      // 빅터 공식
      {
        protocol: "https",
        hostname: "www.victorsport.com",
      },
      // 리닝 공식
      {
        protocol: "https",
        hostname: "www.lining-badminton.com",
      },
      // 쇼핑몰 이미지 (스마트스토어 등)
      {
        protocol: "https",
        hostname: "**.naver.com",
      },
      {
        protocol: "https",
        hostname: "**.kakaocdn.net",
      },
    ],
  },
};

export default nextConfig;
