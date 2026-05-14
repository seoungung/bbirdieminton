import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System v2 — 버디민턴",
  description: "Forest + Lime 디자인 시스템 검토용 임시 라우트",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function DesignPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
