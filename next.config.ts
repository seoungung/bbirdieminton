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
};

const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default bundleAnalyzer(nextConfig);
