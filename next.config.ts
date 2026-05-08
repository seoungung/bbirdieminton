import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    // 라켓 이미지/프로필 이미지가 다양한 외부 호스트에서 오기 때문에 모든 호스트 허용.
    // 카카오 프로필 (k.kakaocdn.net) 등 일부는 HTTP — 둘 다 허용.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  /* 정적 자산 캐시 헤더 — Lighthouse "효율적인 캐시 수명 사용" 대응.
   * /public/* 의 이미지·폰트는 1년 immutable. 변경 시 파일명 바꾸면 즉시 갱신.
   * /_next/static/* 은 Next.js 가 자동으로 immutable 처리 (해시 파일명). */
  async headers() {
    const immutable1y = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ]
    return [
      { source: "/:path*.svg",   headers: immutable1y },
      { source: "/:path*.png",   headers: immutable1y },
      { source: "/:path*.jpg",   headers: immutable1y },
      { source: "/:path*.webp",  headers: immutable1y },
      { source: "/:path*.ico",   headers: immutable1y },
      { source: "/:path*.woff2", headers: immutable1y },
    ]
  },
};

const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default bundleAnalyzer(nextConfig);
