import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — 작은 상태/카테고리 칩 (v2 Forest + Lime).
 *
 * Variants:
 *  - default   : forest 채우기 (강조 카운트)
 *  - secondary : beige-25 + forest 텍스트 — 일반 라벨
 *  - accent    : lime 채우기 — 실시간/CTA ("LIVE", "지금")
 *  - outline   : 보더만 — 조용한 카테고리
 *  - success   : mint + forest
 *  - warning   : zest + moss
 *  - danger    : destructive 옅은 톤
 *  - lime      : zest 옅은 lime — 신규/베타
 *  - olive     : olive earthy 톤 — 시즌/아카이브
 *  - coral     : coral 따뜻 — 알림/이벤트
 *  - sky       : sky 시원 — info / 안내
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap",
  {
    variants: {
      variant: {
        default:   "bg-forest text-beige",
        secondary: "bg-beige-25 text-forest border border-beige-50",
        accent:    "bg-lime text-forest",
        outline:   "border border-beige-75 text-muted-foreground",
        success:   "bg-mint text-forest border border-grass/30",
        warning:   "bg-zest text-moss border border-olive/30",
        danger:    "bg-destructive/10 text-destructive border border-destructive/25",
        lime:      "bg-zest text-forest border border-lime/40",
        olive:     "bg-olive/15 text-moss border border-olive/30",
        coral:     "bg-coral/15 text-coral border border-coral/30",
        sky:       "bg-sky text-sea border border-lake/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
